import { expect } from '@playwright/test'
import type { ConsoleMessage, Locator, Page } from 'playwright'
import { afterAll, describe, test } from 'vitest'
import { shuffle } from '../../../../src/lib/outils/arrayOutils'
import { findStatic, findUuid } from '../../helpers/filter.js'
import { createIssue } from '../../helpers/issue.js'
import {
  getFileLogger,
  log,
  logError,
  logIfDebug,
  logIfVerbose,
} from '../../helpers/log.js'
import prefs from '../../helpers/prefs.js'
import { runSeveralTests } from '../../helpers/run.js'
import { checkEachCombinationOfParams } from '../../helpers/testAllViews.js'

const logConsole = getFileLogger('exportConsole', { append: true })
const consoleErrorsFailures = new Map<string, string>()

class ConsoleErrorsTestFailure extends Error {}

class ConsoleErrorsSummaryFailure extends Error {
  constructor(fileName: string, message: string) {
    super(
      `console_errors a détecté une erreur dans ${fileName}: ${message}\nVoir le récapitulatif console_errors ci-dessus et tests/e2e/logs/exportConsole.log pour le détail.`,
    )
    this.name = 'ConsoleErrorsSummaryFailure'
    this.stack = this.message
  }
}

type ConsoleTestTimeouts = {
  default: number
  navigation: number
  networkIdle: number
  selector: number
  zoomUrl: number
  zoomExercise: number
}

type ConsoleErrorsProfile = 'smoke' | 'standard' | 'deep'

function getConsoleTestTimeouts(urlExercice: string): ConsoleTestTimeouts {
  const url = new URL(urlExercice)
  const isForgeLocalServer =
    urlExercice.startsWith('http://localhost:80/') ||
    url.port === '80' ||
    (url.port === '' && process.env.CI)
  const shortTimeout = 10_000
  // Le serveur Vite des runners compile les modules à la demande : les
  // exercices lourds (apigeom…) dépassent 30 s quand le runner est chargé.
  const forgeTimeout = 90_000
  const timeout = isForgeLocalServer ? forgeTimeout : shortTimeout

  return {
    default: timeout,
    navigation: timeout,
    networkIdle: timeout,
    selector: timeout,
    zoomUrl: 5_000,
    zoomExercise: timeout,
  }
}

function getConsoleErrorsProfile(): ConsoleErrorsProfile {
  const profile = process.env.CONSOLE_ERRORS_PROFILE?.trim().toLowerCase()
  if (profile === 'smoke' || profile === 'standard' || profile === 'deep') {
    return profile
  }
  return 'standard'
}

function shouldReportFailuresThroughVitest() {
  return process.env.DEBUG === '1'
}

function throwConsoleErrorsFailure(fileName: string, error: unknown): never {
  recordConsoleErrorsFailure(fileName, error)
  if (shouldReportFailuresThroughVitest()) throw error
  throw new ConsoleErrorsSummaryFailure(fileName, summarizeError(error))
}

function formatFailureDetails(messages: string[]) {
  return [
    `Console errors test failed: ${summarizeConsoleErrorMessage(messages[0] ?? 'Unknown error')}`,
    `Unique errors: ${messages.length}`,
    `Full logs: tests/e2e/logs/exportConsole.log`,
  ]
    .filter((line) => line !== '')
    .join('\n')
}

function compactBrowserMessage(message: string) {
  return message
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line !== '')
    ?.replace(/\s+/g, ' ')
}

function addUniqueMessage(messages: string[], message: string | undefined) {
  if (message == null || message === '') return
  if (!messages.includes(message)) messages.push(message)
}

function stripAnsiControlSequences(message: string) {
  let cleanMessage = ''
  for (let i = 0; i < message.length; i++) {
    if (
      message.charCodeAt(i) === 27 &&
      message[i + 1] === '['
    ) {
      i += 2
      while (i < message.length) {
        const code = message.charCodeAt(i)
        if (code >= 0x40 && code <= 0x7e) break
        i++
      }
      continue
    }
    cleanMessage += message[i]
  }
  return cleanMessage
}

function summarizeConsoleErrorMessage(message: string) {
  return stripAnsiControlSequences(message)
    .replace(/\s*Call log:.*$/su, '')
    .replace(
      /^(console|pageerror|crash|exception):(?:https?:\/\/\S+|chrome-error:\/\/\S+):?\s*/u,
      '',
    )
    .replace(/\s+at\s+https?:\/\/\S+/gu, '')
    .replace(/\s+at\s+chrome-error:\/\/\S+/gu, '')
    .replace(/https?:\/\/\S+/gu, '')
    .replace(/chrome-error:\/\/\S+/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function summarizeError(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : String(error)
  const firstErrorMatch = rawMessage.match(
    /Console errors test failed:\s*([^\n]+)/,
  )
  const message = firstErrorMatch?.[1] ?? rawMessage
  return summarizeConsoleErrorMessage(message).slice(0, 240)
}

function escapeMarkdownTableCell(value: string) {
  return value.replaceAll('|', '\\|').replace(/\s+/g, ' ').trim()
}

function recordConsoleErrorsFailure(fileName: string, error: unknown) {
  if (!consoleErrorsFailures.has(fileName)) {
    consoleErrorsFailures.set(fileName, summarizeError(error))
  }
}

afterAll(() => {
  if (consoleErrorsFailures.size === 0) return

  const rows = Array.from(consoleErrorsFailures.entries()).map(
    ([fileName, message]) => ({
      fichier: fileName,
      erreur: message,
    }),
  )

  console.error('\nRécapitulatif console_errors')
  console.table(rows)
  console.error('| Fichier | Extrait du message console |')
  console.error('| --- | --- |')
  for (const { fichier, erreur } of rows) {
    console.error(
      `| ${escapeMarkdownTableCell(fichier)} | ${escapeMarkdownTableCell(erreur)} |`,
    )
  }
})

async function waitForExerciseVisible(page: Page) {
  const timeouts = getConsoleTestTimeouts(page.url())
  await page.waitForSelector('div.mb-5>ul>div#consigne0-0', {
    timeout: timeouts.selector,
  })
  await waitForExerciseReady(page)
}

async function waitForExerciseReady(page: Page) {
  const timeouts = getConsoleTestTimeouts(page.url())
  await page
    .locator('[data-exercise-index="0"][data-exercise-render-state="ready"]')
    .waitFor({ state: 'visible', timeout: timeouts.selector })
}

function isLocalViteDependencyLoadingMessage(
  text: string,
  locationUrl: string,
) {
  return (
    locationUrl.includes('/node_modules/.vite/deps/') &&
    text.startsWith('Failed to load resource:')
  )
}

async function clickZoomAndWaitForExercise(page: Page, buttonZoom: Locator) {
  const timeouts = getConsoleTestTimeouts(page.url())
  const previousZoom = new URL(page.url()).searchParams.get('z') ?? ''
  await buttonZoom.click()
  const exerciseLocator = page.locator('div.mb-5>ul>div#consigne0-0')
  try {
    await page.waitForFunction(
      (zoom) => new URL(window.location.href).searchParams.get('z') !== zoom,
      previousZoom,
      { timeout: timeouts.zoomUrl },
    )
  } catch (error) {
    const exerciseIsVisible = await exerciseLocator.isVisible()
    if (!exerciseIsVisible) throw error
    logIfDebug(`Zoom inchangé, exercice déjà visible: z=${previousZoom}`)
  }
  await exerciseLocator.waitFor({
    state: 'visible',
    timeout: timeouts.zoomExercise,
  })
  await waitForExerciseReady(page)
  logIfDebug('Exercice affiché après zoom')
}

async function quickAction(page: Page, description: string) {
  logIfVerbose(`Test avec les paramètres ${description}`)
  await waitForExerciseVisible(page)
}

/**
 * Le web component <scratch-simulator> (utilisé dans certaines corrections) ouvre
 * automatiquement une modale plein écran dès qu'il est inséré dans le DOM.
 * Cette modale intercepte les clics suivants (ex: "Nouvel énoncé") tant qu'elle
 * n'est pas fermée explicitement.
 */
async function closeScratchSimulatorModalIfOpen(page: Page) {
  const scratchModal = page.locator('dialog[data-scratch-sim="true"]')
  if (await scratchModal.isVisible()) {
    await scratchModal.getByRole('button', { name: '✕' }).click()
    await scratchModal.waitFor({ state: 'hidden' })
  }
}

async function fullAction(
  page: Page,
  description: string,
  options?: { refreshAfterInteractivityCount?: number },
) {
  logIfVerbose(`Test complet avec les paramètres ${description}`)
  const buttonNewData = page.getByRole('button', { name: 'Nouvel énoncé' })
  // Le bouton est masqué pour les exercices avec pasDeVersionAleatoire = true
  const hasButtonNewData = await buttonNewData.isVisible()
  if (hasButtonNewData) {
    logIfDebug('Actualier (nouvel énoncé)')
    await buttonNewData.click({ force: true })
    await waitForExerciseReady(page)
    logIfDebug('fin Actualier (nouvel énoncé)')
  } else {
    logIfDebug('Pas de bouton « Nouvel énoncé » (exercice non aléatoire)')
  }
  const buttonZoom = page.getByRole('button', {
    name: 'Augmenter la taille du texte',
  })
  const buttonZoomMoins = page.getByRole('button', {
    name: 'Réduire la taille du texte',
  })
  const zParam = new URL(page.url()).searchParams.get('z')
  const z = zParam === null || zParam === '' ? 1 : Number(zParam)
  logIfVerbose('Zoom')
  if (z < 1.4) {
    // await buttonZoom.highlight()
    await clickZoomAndWaitForExercise(page, buttonZoom)
  } else {
    // await buttonZoomMoins.highlight()
    await clickZoomAndWaitForExercise(page, buttonZoomMoins)
  }
  logIfVerbose('Fin zoom')
  // Active le mode interactif
  const activateInteractivityButton = page.getByRole('button', {
    name: 'Rendre interactif',
  })
  if (await activateInteractivityButton.isVisible()) {
    await activateInteractivityButton.click()
    await waitForExerciseReady(page)
    logIfVerbose('Active le mode interactif')
    // selectionne les questions
    const questionSelector = 'li[id^="exercice0Q"]'
    await page.waitForSelector(questionSelector)
    logIfVerbose('new URL (mode interactif): ' + page.url())
    const locators = await page.locator(questionSelector).all()
    logIfVerbose('nbre de questions:' + locators.length)
    // locators.forEach(async (locator, index) => {
    //   const text = await locator.innerText()
    //   log(`Question ${index + 1}: ${text}`)
    // })
    // => TODOS à poursuivre
    // Cliquer sur vérifier les données
    const buttonVerifier = page.locator('#verif0')
    logIfVerbose('Vérifier les réponses')
    await buttonVerifier.click()
    await waitForExerciseReady(page)
    await page.waitForSelector('article + div')
    const buttonResult = await page.locator('article + div').innerText()
    logIfVerbose(buttonResult)
    await closeScratchSimulatorModalIfOpen(page)
    const refreshAfterInteractivityCount =
      options?.refreshAfterInteractivityCount ?? 1
    // Même garde que plus haut : sans bouton (pasDeVersionAleatoire = true),
    // le clic attendrait en vain jusqu'au timeout.
    if (hasButtonNewData) {
      logIfVerbose(
        `Actualier (nouvel énoncé) ${refreshAfterInteractivityCount} fois`,
      )
      await buttonNewData.click({ clickCount: refreshAfterInteractivityCount })
      await waitForExerciseReady(page)
      logIfVerbose(
        `fin Actualier (nouvel énoncé) ${refreshAfterInteractivityCount} fois`,
      )
    }
  } else {
    // MGu : obligé car parfois on rate l'exception car trop rapide
    // await new Promise((resolve) => setTimeout(resolve, 1000)) // GV : Si on attend 1 seconde après chaque cas, il va falloir 1 an si on veut tester toutes les possibilités
  }
}

async function getConsoleTest(page: Page, urlExercice: string) {
  logIfVerbose(urlExercice)
  const timeouts = getConsoleTestTimeouts(urlExercice)
  const profile = getConsoleErrorsProfile()
  page.setDefaultTimeout(timeouts.default)

  const retries = 3 // Nombre de tentatives en cas d'erreur
  for (let attempt = 1; attempt <= retries; attempt++) {
    const messages: string[] = []
    const onPageError = (msg: Error) => {
      if (msg.message !== 'Erreur de chargement de Mathgraph') {
        // mtgLoad : 3G22
        addUniqueMessage(messages, `pageerror:${page.url()} ${msg.message}`)
        logError(msg)
      }
    }
    const onCrash = (msg: Page) => {
      addUniqueMessage(messages, 'crash:' + page.url() + ' ' + msg)
      logError(msg)
    }
    const onConsole = (msg: ConsoleMessage) => {
      const text = msg.text()
      const locationUrl = msg.location().url
      // if (msg.type() === 'error') {
      if (
        !text.includes('[vite]') &&
        !text.includes('[bugsnag] Loaded!') &&
        !text.includes('No character metrics for') && // katex
        !text.includes('LaTeX-incompatible input') && // katex
        !text.includes('mtgLoad') && // mtgLoad : 3G22
        !text.includes('MG32div0') && // MG32div0 : 3G22
        !text.includes('Figure destroyed successfully') && // apigeom
        !text.includes('UserFriendlyError: Le chargement de mathgraph') &&
        !text.includes("Invalid 'X-Frame-Options' header") &&
        !text.includes(
          'Blockly.Workspace.getAllVariables was deprecated in v12',
        ) &&
        !text.includes('A-Frame Version:') &&
        !text.includes(
          'THREE Version (https://github.com/supermedium/three.js)',
        ) &&
        !text.includes(
          'WARNING: Too many active WebGL contexts. Oldest context will be lost.',
        ) &&
        !text.includes('GPU stall due to ReadPixels') &&
        !text.includes(': le motif contient plus') &&
        !text.includes(
          'The column width is less than 0, need to adjust page width to make',
        ) &&
        !locationUrl.includes('mathgraph32') &&
        !text.includes('placeholderMetrics 0.7 0.2') &&
        !text.includes('Compilation fallback for') &&
        !isLocalViteDependencyLoadingMessage(text, locationUrl)
      ) {
        if (!text.includes('<HeaderExercice>')) {
          addUniqueMessage(
            messages,
            `console:${page.url()} ${compactBrowserMessage(text)}`,
          )
        }
      }
      // }
    }
    try {
      page.on('pageerror', onPageError)
      page.on('crash', onCrash)
      // Listen for all console events and handle errors
      page.on('console', onConsole)

      logIfVerbose('On charge la page')
      await page.goto(urlExercice, { timeout: timeouts.navigation })
      await page.waitForLoadState('networkidle', {
        timeout: timeouts.networkIdle,
      })
      logIfVerbose('fin : On charge la page')

      // Correction
      // On cherche les questions
      logIfVerbose('On cherche les questions')
      await waitForExerciseVisible(page)
      logIfVerbose('fin : On cherche les questions')

      if (profile === 'deep') {
        // Ancien scénario : chaque valeur de paramètre déclenche le parcours UI complet.
        await checkEachCombinationOfParams(
          page,
          async (page, description) =>
            fullAction(page, description, {
              refreshAfterInteractivityCount: 3,
            }),
          { isFullViews: true },
        )
      } else if (profile === 'smoke') {
        await fullAction(page, 'smoke')
      } else {
        // Scénario par défaut : les paramètres sont parcourus légèrement,
        // puis le zoom et l'interactivité sont vérifiés une seule fois.
        await checkEachCombinationOfParams(page, quickAction, {
          isFullViews: false,
        })
        await fullAction(page, 'standard')
      }

      // Paramètres ça va les refermer puisqu'ils sont ouverts par défaut
      const buttonParam = page.getByRole('button', {
        name: "Changer les paramètres de l'",
      })
      logIfVerbose('Ferme les paramètres ')
      if (await buttonParam.isVisible()) {
        await buttonParam.click()
        await waitForExerciseReady(page)
      }
      if (messages.length > 0) {
        logError(messages)
        logError(`Il y a ${messages.length} erreurs : ${messages.join('\n')}`)
        log('url:' + page.url())
        await createIssue(urlExercice, messages, ['console'], log)
        throw new ConsoleErrorsTestFailure(formatFailureDetails(messages))
      } else {
        return 'OK'
      }
    } catch (error) {
      if (error instanceof ConsoleErrorsTestFailure) throw error
      // si une exception comme timeout: on récupère la requete
      let message = 'Unknown Error'
      if (error instanceof Error) message = error.message
      addUniqueMessage(messages, 'exception:' + page.url() + ': ' + message)
      log('url:' + page.url())
      logError(messages)
      logError(`Il y a ${messages.length} erreurs : ${messages.join('\n')}`)
      if (attempt === retries) {
        if (!message.includes('net::ERR_CONNECTION_REFUSED')) {
          // le serveur ne répond pas... si net::ERR_CONNECTION_REFUSED
          await createIssue(urlExercice, messages, ['console'], log)
        }
        throw new ConsoleErrorsTestFailure(formatFailureDetails(messages))
      }
    } finally {
      page.off('pageerror', onPageError)
      page.off('crash', onCrash)
      page.off('console', onConsole)
    }
  }
}

async function testRunAllLots(filter: string) {
  const uuids =
    filter.includes('dnb') || filter.includes('bac') || filter.includes('e3c')
      ? await findStatic(filter)
      : await findUuid(filter)

  // Exclure les exercices contenant "test" ou "beta" dans leur nom
  const filteredUuids = shuffle(
    uuids.filter(([_uuid, name]) => {
      const nameLower = name.toLowerCase()
      return !nameLower.includes('test') && !nameLower.includes('beta')
    }),
  ).slice(0, prefs.nbExosParLot) // Limiter le nombre d'exercices à tester pour éviter de surcharger le serveur

  logIfVerbose(filteredUuids)
  if (filteredUuids.length === 0) {
    log(`Aucun uuid trouvé pour le filtre '${filter}'`)
    describe('no-parameter-warning', () => {
      test.skip(`Aucun uuid trouvé pour le filtre '${filter}'`, () => {
        // This test is skipped to show a warning instead of pass/fail
      })
    })
  }
  for (let i = 0; i < filteredUuids.length && i < prefs.nbExosParLot; i += 20) {
    const ff: ((page: Page) => Promise<boolean>)[] = []
    for (let k = i; k < i + 20 && k < filteredUuids.length; k++) {
      const myName = filteredUuids[k][1]
      const f = async function (page: Page) {
        // Listen for all console logs
        page.on('console', (msg) => {
          logConsole(msg.text())
        })
        logIfVerbose(filter)
        const hostname = local
          ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
          : 'https://coopmaths.fr/alea/'
        logIfVerbose(
          `uuid=${filteredUuids[k][0]} exo=${filteredUuids[k][1]} i=${k} / ${filteredUuids.length}`,
        )
        let resultReq: string | undefined
        try {
          resultReq = await getConsoleTest(
            page,
            `${hostname}?uuid=${filteredUuids[k][0]}&id=${filteredUuids[k][1].substring(0, filteredUuids[k][1].lastIndexOf('.')) || filteredUuids[k][1]}&alea=${alea}&testCI`,
          )
        } catch (error) {
          throwConsoleErrorsFailure(filteredUuids[k][1], error)
        }
        if (resultReq !== 'OK') {
          logError(
            `Erreur pour uuid=${filteredUuids[k][0]} exo=${filteredUuids[k][1]} i=${k} / ${filteredUuids.length}`,
          )
          throwConsoleErrorsFailure(
            filteredUuids[k][1],
            `Résultat inattendu: ${resultReq}`,
          )
        } else {
          logIfVerbose(
            `Succès pour uuid=${filteredUuids[k][0]} exo=${filteredUuids[k][1]} i=${k} / ${filteredUuids.length}`,
          )
        }
        return true
      }
      Object.defineProperty(f, 'name', { value: myName, writable: false })
      ff.push(f)
    }
    runSeveralTests(ff, import.meta.url, {
      pauseOnError: false,
      silent: false,
      debug: false,
      headless: prefs.headless,
    })
  }
}

const alea = process.env.CONSOLE_ERRORS_SEED || 'e906e'
const local = true
if (process.env.NIV !== null && process.env.NIV !== undefined) {
  const filter = (process.env.NIV as string).replaceAll(' ', '')
  prefs.headless = true
  prefs.nbExosParLot = process.env.NB_EXOS_PAR_LOT
    ? parseInt(process.env.NB_EXOS_PAR_LOT)
    : 75
  logIfVerbose(filter)
  testRunAllLots(filter)
} else if (
  process.env.CHANGED_FILES !== null &&
  process.env.CHANGED_FILES !== undefined
) {
  const changedFiles = process.env.CHANGED_FILES?.split('\n') ?? []
  logIfVerbose(changedFiles)
  prefs.headless = true
  prefs.nbExosParLot = process.env.NB_EXOS_PAR_LOT
    ? parseInt(process.env.NB_EXOS_PAR_LOT)
    : 75
  const filtered = changedFiles
    .filter(
      (file) =>
        file.startsWith('src/exercices/') &&
        !file.includes('ressources') &&
        !file.includes('apps') &&
        file.replace('src/exercices/', '').split('/').length >= 2,
    )
    .map((file) =>
      file
        .replace(/^src\/exercices\//, '')
        .replace(/\.ts$/, '.')
        .replace(/\.js$/, '.'),
    )
  logIfVerbose(filtered)
  if (filtered.length === 0) {
    // aucun fichier concerné.. on sort
    describe('dummy', () => {
      test('should pass', () => {
        expect(true).toBe(true)
      })
    })
  } else {
    const cfiltered = filtered.slice(0, prefs.nbExosParLot) // limiter à 300 exercices pour éviter de surcharger le serveur
    cfiltered.forEach((file, index) => {
      const filter = file.replaceAll(' ', '')
      logIfVerbose(
        'launching test for:',
        filter + `,  ${index + 1}/${cfiltered.length}`,
      )
      testRunAllLots(filter)
    })
  }
} else {
  log('⚠️  ATTENTION : Le test a été lancé sans paramètre')
  log('Exemples :')
  log('Pour le lancer sur le niveau 4e :')
  log('Sur Windows (cmd) : set NIV=4e && pnpm test:e2e:console_errors')
  log('Sur Winows (PowerShell) : $env:NIV="4e"; pnpm test:e2e:console_errors')
  log('Sur Linux/MacOS : NIV=4e pnpm test:e2e:console_errors')
  log("Pour le lancer sur l'exercice 6e/6G2A :")
  log('Sur Windows (cmd) : set NIV=6e/6G2A.ts && pnpm test:e2e:console_errors')
  log('Sur Linux/MacOS : NIV=6e/6G2A.ts pnpm test:e2e:console_errors')
  describe('no-parameter-warning', () => {
    test.skip('test requires NIV parameter - see logs for usage', () => {
      // This test is skipped to show a warning instead of pass/fail
    })
  })
}
