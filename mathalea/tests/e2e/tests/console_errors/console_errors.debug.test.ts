import { expect } from '@playwright/test'
import type { Locator, Page } from 'playwright'
import { describe, test } from 'vitest'
import { findStatic, findUuid } from '../../helpers/filter.js'
import { createIssue } from '../../helpers/issue.js'
import { getFileLogger, log as lg, logError as lgE } from '../../helpers/log.js'
import prefs from '../../helpers/prefs.js'
import { runSeveralTests } from '../../helpers/run.js'
import { checkEachCombinationOfParams } from '../../helpers/testAllViews.js'

const logConsole = getFileLogger('exportConsole', { append: true })

function log(...args: unknown[]) {
  lg(args)
  logConsole(args)
}

function logError(...args: unknown[]) {
  lgE(args)
  logConsole(args)
}

function logDebug(...args: unknown[]) {
  if (
    process.env.CI &&
    process.env.DEBUG !== null &&
    process.env.DEBUG !== undefined
  ) {
    if ((process.env.DEBUG as string).replaceAll(' ', '') === 'DEBUG') {
      log(args)
    }
  }
}

let lastAction = 'init'

function setLastAction(action: string) {
  lastAction = action
}

function getLastAction() {
  return lastAction
}

async function pauseOnError(page: Page, reason: string) {
  log(`Pause (${reason}). URL: ${page.url()}`)
  log(`[lastAction] ${getLastAction()}`)
  try {
    await page.pause()
  } catch (error) {
    logError('Impossible de lancer page.pause()', error)
  }
  // Fallback: garder la fenêtre ouverte assez longtemps pour inspecter
  await page.waitForTimeout(30 * 60 * 1000)
}

function applyPrefsFromEnv(defaultHeadless: boolean) {
  const env = process.env
  const normalize = (value: string | undefined) =>
    (value ?? '').trim().toLowerCase()
  const isTrue = (value: string | undefined) =>
    ['1', 'true', 'yes', 'y', 'on'].includes(normalize(value))
  const isFalse = (value: string | undefined) =>
    ['0', 'false', 'no', 'n', 'off'].includes(normalize(value))

  if (isTrue(env.HEADFUL)) {
    prefs.headless = false
  } else if (isTrue(env.HEADLESS)) {
    prefs.headless = true
  } else {
    prefs.headless = defaultHeadless
  }

  const slowMo = Number(env.SLOWMO)
  if (!Number.isNaN(slowMo) && slowMo > 0) {
    prefs.slowMo = slowMo
  }

  if (normalize(env.DEBUG) === 'debug') {
    prefs.debug = true
  }

  if (isTrue(env.VERBOSE)) {
    prefs.verbose = true
  }
}

async function clickZoomAndWaitForExercise(page: Page, buttonZoom: Locator) {
  const previousZoom = new URL(page.url()).searchParams.get('z') ?? ''
  await buttonZoom.click()
  const exerciseLocator = page.locator('div.mb-5>ul>div#consigne0-0')
  try {
    await page.waitForFunction(
      (zoom) => new URL(window.location.href).searchParams.get('z') !== zoom,
      previousZoom,
      { timeout: 5_000 },
    )
  } catch (error) {
    const exerciseIsVisible = await exerciseLocator.isVisible()
    if (!exerciseIsVisible) throw error
    logDebug(`Zoom inchangé, exercice déjà visible: z=${previousZoom}`)
  }
  await exerciseLocator.waitFor({
    state: 'visible',
    timeout: 60_000,
  })
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      }),
  )
  logDebug('Exercice affiché après zoom')
}

async function action(page: Page, description: string) {
  setLastAction(`start action: ${description}`)
  logDebug(`Test avec les paramètres ${description}`)
  // clic sur nouvel énoncé 3 fois
  const buttonNewData = page.getByRole('button', { name: 'Nouvel énoncé' })
  // Le bouton est masqué pour les exercices avec pasDeVersionAleatoire = true
  const hasButtonNewData = await buttonNewData.isVisible()
  if (hasButtonNewData) {
    logDebug('Actualier (nouvel énoncé)')
    setLastAction('click Nouvel énoncé')
    await buttonNewData.click({ force: true })
    logDebug('fin Actualier (nouvel énoncé)')
  } else {
    logDebug('Pas de bouton « Nouvel énoncé » (exercice non aléatoire)')
  }
  const buttonZoom = page.getByRole('button', {
    name: 'Augmenter la taille du texte',
  })
  const buttonZoomMoins = page.getByRole('button', {
    name: 'Réduire la taille du texte',
  })
  const zParam = new URL(page.url()).searchParams.get('z')
  const z = zParam === null || zParam === '' ? 1 : Number(zParam)
  log('Zoom')
  if (z < 1.4) {
    // await buttonZoom.highlight()
    setLastAction('click Zoom +')
    await clickZoomAndWaitForExercise(page, buttonZoom)
  } else {
    // await buttonZoomMoins.highlight()
    setLastAction('click Zoom -')
    await clickZoomAndWaitForExercise(page, buttonZoomMoins)
  }
  log('Fin zoom')
  // Active le mode interactif
  const activateInteractivityButton = page.getByRole('button', {
    name: 'Rendre interactif',
  })
  if (await activateInteractivityButton.isVisible()) {
    setLastAction('click Rendre interactif')
    await activateInteractivityButton.click()
    logDebug('Active le mode interactif')
    // selectionne les questions
    const questionSelector = 'li[id^="exercice0Q"]'
    setLastAction('wait questions')
    await page.waitForSelector(questionSelector)
    log('new URL (mode interactif): ' + page.url())
    const locators = await page.locator(questionSelector).all()
    log('nbre de questions:' + locators.length)
    // locators.forEach(async (locator, index) => {
    //   const text = await locator.innerText()
    //   log(`Question ${index + 1}: ${text}`)
    // })
    // => TODOS à poursuivre
    // Cliquer sur vérifier les données
    const buttonVerifier = page.locator('#verif0')
    logDebug('Vérifier les réponses')
    setLastAction('click Vérifier')
    await buttonVerifier.click()
    setLastAction('wait result')
    await page.waitForSelector('article + div')
    const buttonResult = await page.locator('article + div').innerText()
    log(buttonResult)
    const scratchModal = page.locator('dialog[data-scratch-sim="true"]')
    if (await scratchModal.isVisible()) {
      setLastAction('fermer la modale scratch-simulator')
      await scratchModal.getByRole('button', { name: '✕' }).click()
      await scratchModal.waitFor({ state: 'hidden' })
    }
    // Même garde que plus haut : sans bouton (pasDeVersionAleatoire = true),
    // le clic attendrait en vain jusqu'au timeout.
    if (hasButtonNewData) {
      logDebug('Actualier (nouvel énoncé) 3 fois')
      setLastAction('click Nouvel énoncé x3')
      await buttonNewData.click({ clickCount: 3 })
      logDebug('fin Actualier (nouvel énoncé) 3 fois')
    }
  } else {
    // MGu : obligé car parfois on rate l'exception car trop rapide
    // await new Promise((resolve) => setTimeout(resolve, 1000)) // GV : Si on attend 1 seconde après chaque cas, il va falloir 1 an si on veut tester toutes les possibilités
  }
}

async function getConsoleTest(page: Page, urlExercice: string) {
  log(urlExercice)
  // on configure à 5 min le timeout
  page.setDefaultTimeout(5 * 60 * 1000)

  const retries = 3 // Nombre de tentatives en cas d'erreur
  for (let attempt = 1; attempt <= retries; attempt++) {
    const messages: string[] = []
    try {
      page.on('pageerror', (msg) => {
        if (msg.message !== 'Erreur de chargement de Mathgraph') {
          // mtgLoad : 3G22
          messages.push('error:' + page.url() + ' ' + msg.stack)
          log(`[pageerror] ${msg.message}`)
          log(`[lastAction] ${getLastAction()}`)
          log(msg.stack)
          logError(msg)
          void pauseOnError(page, 'pageerror')
        }
      })
      page.on('crash', (msg) => {
        messages.push('crach:' + page.url() + ' ' + msg)
        logError(msg)
        void pauseOnError(page, 'crash')
      })
      // Listen for all console events and handle errors
      page.on('console', (msg) => {
        // if (msg.type() === 'error') {
        if (
          !msg.text().includes('[vite]') &&
          !msg.text().includes('[bugsnag] Loaded!') &&
          !msg.text().includes('No character metrics for') && // katex
          !msg.text().includes('LaTeX-incompatible input') && // katex
          !msg.text().includes('mtgLoad') && // mtgLoad : 3G22
          !msg.text().includes('MG32div0') && // MG32div0 : 3G22
          !msg.text().includes('Figure destroyed successfully') && // apigeom
          !msg
            .text()
            .includes('UserFriendlyError: Le chargement de mathgraph') &&
          !msg.text().includes("Invalid 'X-Frame-Options' header") &&
          !msg
            .text()
            .includes(
              'Blockly.Workspace.getAllVariables was deprecated in v12',
            ) &&
          !msg.text().includes('A-Frame Version:') &&
          !msg
            .text()
            .includes(
              'THREE Version (https://github.com/supermedium/three.js)',
            ) &&
          !msg
            .text()
            .includes(
              'WARNING: Too many active WebGL contexts. Oldest context will be lost.',
            ) &&
          !msg.text().includes('GPU stall due to ReadPixels') &&
          !msg.text().includes(': le motif contient plus') &&
          !msg
            .text()
            .includes(
              'The column width is less than 0, need to adjust page width to make',
            ) &&
          !msg.location().url.includes('mathgraph32') &&
          !msg.text().includes('placeholderMetrics 0.7 0.2')
        ) {
          if (!msg.text().includes('<HeaderExercice>')) {
            messages.push('console:' + page.url() + ' ' + msg.text())
            log(`[console] ${msg.text()}`)
            log(`[lastAction] ${getLastAction()}`)
            void pauseOnError(page, 'console')
          }
        }
        // }
      })

      logDebug('On charge la page')
      setLastAction('goto page')
      await page.goto(urlExercice)
      setLastAction('wait networkidle')
      await page.waitForLoadState('networkidle')
      logDebug('fin : On charge la page')

      // Correction
      // On cherche les questions
      logDebug('On cherche les questions')
      setLastAction('wait consigne')
      await page.waitForSelector('div.mb-5>ul>div#consigne0-0')
      logDebug('fin : On cherche les questions')
      // Pour chaque combinaison de paramètres, on clique sur nouvel énoncé 3 fois, active le mode interactif et reclique sur nouvel énoncé 3 fois
      await checkEachCombinationOfParams(page, action, { isFullViews: true })
      // Paramètres ça va les refermer puisqu'ils sont ouverts par défaut
      const buttonParam = page.getByRole('button', {
        name: "Changer les paramètres de l'",
      })
      logDebug('Ferme les paramètres ')
      if (await buttonParam.isVisible()) {
        setLastAction('click Fermer paramètres')
        await buttonParam.click()
      }
      if (messages.length > 0) {
        logError(messages)
        logError(`Il y a ${messages.length} erreurs : ${messages.join('\n')}`)
        log('url:' + page.url())
        await pauseOnError(page, 'messages')
        await createIssue(urlExercice, messages, ['console'], log)
        return 'KO'
      } else {
        return 'OK'
      }
    } catch (error) {
      // si une exception comme timeout: on récupère la requete
      let message = 'Unknown Error'
      if (error instanceof Error) message = error.message
      messages.push('erreur:url' + page.url() + ': ' + message)
      log('url:' + page.url())
      logError(messages)
      logError(`Il y a ${messages.length} erreurs : ${messages.join('\n')}`)
      await pauseOnError(page, 'exception')
      if (attempt === retries) {
        if (!message.includes('net::ERR_CONNECTION_REFUSED')) {
          // le serveur ne répond pas... si net::ERR_CONNECTION_REFUSED
          await createIssue(urlExercice, messages, ['console'], log)
        }
        return 'KO'
      }
    }
  }
}

async function testRunAllLots(filter: string) {
  const uuids =
    filter.includes('dnb') || filter.includes('bac') || filter.includes('e3c')
      ? await findStatic(filter)
      : await findUuid(filter)

  // Exclure les exercices contenant "test" ou "beta" dans leur nom
  const filteredUuids = uuids.filter(([uuid, name]) => {
    const nameLower = name.toLowerCase()
    return !nameLower.includes('test') && !nameLower.includes('beta')
  })

  log(filteredUuids)
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
        log(filter)
        const hostname = local
          ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
          : 'https://coopmaths.fr/alea/'
        log(
          `uuid=${filteredUuids[k][0]} exo=${filteredUuids[k][1]} i=${k} / ${filteredUuids.length}`,
        )
        const resultReq = await getConsoleTest(
          page,
          `${hostname}?uuid=${filteredUuids[k][0]}&id=${filteredUuids[k][1].substring(0, filteredUuids[k][1].lastIndexOf('.')) || filteredUuids[k][1]}&alea=${alea}&testCI`,
        )
        log(
          `Resu: ${resultReq} uuid=${filteredUuids[k][0]} exo=${filteredUuids[k][1]}`,
        )
        return resultReq === 'OK'
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

const alea = 'e906e'
const local = true

if (process.env.NIV !== null && process.env.NIV !== undefined) {
  const filter = (process.env.NIV as string).replaceAll(' ', '')
  applyPrefsFromEnv(false)
  prefs.nbExosParLot = 300
  log(filter)
  testRunAllLots(filter)
} else if (
  process.env.CHANGED_FILES !== null &&
  process.env.CHANGED_FILES !== undefined
) {
  const changedFiles = process.env.CHANGED_FILES?.split('\n') ?? []
  log(changedFiles)
  applyPrefsFromEnv(false)
  prefs.nbExosParLot = 300
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
  log(filtered)
  if (filtered.length === 0) {
    // aucun fichier concerné.. on sort
    describe('dummy', () => {
      test('should pass', () => {
        expect(true).toBe(true)
      })
    })
  } else {
    filtered.forEach((file, index) => {
      const filter = file.replaceAll(' ', '')
      console.log(
        'launching test for:',
        filter + `,  ${index + 1}/${filtered.length}`,
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
