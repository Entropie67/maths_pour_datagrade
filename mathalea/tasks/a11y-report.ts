/**
 * Rapport périodique d'accessibilité : mesure les vues du site avec axe-core et
 * écrit ce qui a changé depuis le passage précédent.
 *
 * Il informe et ne bloque rien : le code de sortie reste 0, même avec des défauts
 * ou des vues en erreur. Seul lancement refusé : en local, un serveur qui ne sert
 * pas cette copie, car la mesure serait attribuée au mauvais code.
 *
 * Usage : pnpm a11y:report (voir documentation/tests/rapport-accessibilite.md)
 *
 * A11Y_BASE_URL          adresse du serveur, base /alea/ comprise
 * PLAYWRIGHT_SERVER_PORT port, si A11Y_BASE_URL n'est pas donnée
 * A11Y_OUTPUT_DIR        dossier des deux fichiers produits (reports par défaut)
 * A11Y_PREVIOUS          passage de référence (par défaut, le JSON de ce dossier)
 * A11Y_VIEW_TIMEOUT_MS   délai par vue avant de la déclarer en erreur (90 s)
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AxeResults, RunOptions } from 'axe-core'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'
import {
  A11Y_REPORT_VERSION,
  A11Y_SEED,
  A11Y_VIEWS,
  AXE_EXCLUDED_SELECTORS,
  AXE_TAGS,
  VITRINE_SELECTOR,
  compareRuns,
  computeTotals,
  isA11yRun,
  renderMarkdown,
  renderSummary,
  summarizeAxeResults,
} from './lib/a11yReport.ts'
import type {
  A11yRun,
  A11yView,
  AxeSummaryInput,
  ErrorKind,
  MeasuredView,
  RuleInfo,
  RunConfig,
  ViewResult,
} from './lib/a11yReport.ts'

declare global {
  interface Window {
    axe: {
      configure: (spec: { locale: unknown }) => void
      run: (
        context: { exclude: string[] },
        options: RunOptions,
      ) => Promise<AxeResults>
    }
  }
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const AXE_SCRIPT = require.resolve('axe-core/axe.min.js')
const AXE_LOCALE = JSON.parse(
  readFileSync(join(dirname(AXE_SCRIPT), 'locales', 'fr.json'), 'utf8'),
) as unknown

const VIEWPORT = { width: 1280, height: 800 }
const VIEW_TIMEOUT_MS = Number(process.env.A11Y_VIEW_TIMEOUT_MS ?? 90_000)
/** Une page est posée quand son DOM ne bouge plus pendant cette durée */
const QUIET_MS = 1_000
const SETTLE_TIMEOUT_MS = 20_000
/** La visite guidée démarre 400 ms après l'affichage de l'accueil */
const TOUR_TIMEOUT_MS = 15_000
const AXE_TIMEOUT_MS = 120_000

const OUTPUT_DIR = resolve(ROOT, process.env.A11Y_OUTPUT_DIR ?? 'reports')
const JSON_PATH = join(OUTPUT_DIR, 'a11y-status.json')
const MARKDOWN_PATH = join(OUTPUT_DIR, 'a11y-report.md')

class ViewError extends Error {
  kind: ErrorKind
  constructor(kind: ErrorKind, message: string) {
    super(message)
    this.kind = kind
  }
}

function resolveBaseUrl(): string {
  const explicit = process.env.A11Y_BASE_URL
  const port =
    process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')
  const url = explicit ?? `http://localhost:${port}/alea/`
  return url.endsWith('/') ? url : `${url}/`
}

/**
 * Répertoires de travail des serveurs qui écoutent sur ce port (un serveur IPv4
 * et un serveur IPv6 peuvent le partager). Vide si lsof ne sait pas répondre.
 */
function serverCheckouts(port: string): string[] {
  try {
    const pids = execFileSync(
      'lsof',
      ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    )
      .split('\n')
      .filter(Boolean)
    return pids.flatMap((pid) =>
      execFileSync('lsof', ['-a', '-p', pid, '-d', 'cwd', '-Fn'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .split('\n')
        .filter((line) => line.startsWith('n'))
        .map((line) => line.slice(1)),
    )
  } catch {
    return []
  }
}

/** En local, plusieurs copies tournent souvent côte à côte sur des ports voisins */
function otherCheckoutServer(baseUrl: string): string | null {
  const url = new URL(baseUrl)
  if (process.env.CI || url.hostname !== 'localhost') return null
  const port = url.port || '80'
  const others = serverCheckouts(port).filter(
    (checkout) => resolve(checkout) !== resolve(ROOT),
  )
  return others[0] ?? null
}

function currentCommit(): string {
  if (process.env.CI_COMMIT_SHORT_SHA) return process.env.CI_COMMIT_SHORT_SHA
  try {
    const run = (...args: string[]) =>
      execFileSync('git', args, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
    const dirty = run('status', '--porcelain') !== ''
    return `${run('rev-parse', '--short', 'HEAD')}${dirty ? '+modifs' : ''}`
  } catch {
    return 'inconnu'
  }
}

function readPrevious(): {
  run: A11yRun | null
  state: 'absent' | 'illisible' | 'ok'
} {
  const path = process.env.A11Y_PREVIOUS
    ? resolve(ROOT, process.env.A11Y_PREVIOUS)
    : JSON_PATH
  if (!existsSync(path)) return { run: null, state: 'absent' }
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'))
    return isA11yRun(parsed)
      ? { run: parsed, state: 'ok' }
      : { run: null, state: 'illisible' }
  } catch {
    return { run: null, state: 'illisible' }
  }
}

/** Les requêtes fetch et XHR en cours, pour ne pas mesurer avant leur réponse */
function trackPendingRequests(page: Page): () => number {
  let pending = 0
  const isData = (type: string) => type === 'fetch' || type === 'xhr'
  page.on('request', (request) => {
    if (isData(request.resourceType())) pending++
  })
  const done = (request: { resourceType: () => string }) => {
    if (isData(request.resourceType())) pending--
  }
  page.on('requestfinished', done)
  page.on('requestfailed', done)
  return () => pending
}

/**
 * Attend que le DOM ne bouge plus et qu'aucune donnée ne soit attendue. Une page
 * qui s'anime sans fin n'est pas une erreur : la mesure se fait quand même, et
 * le rapport le signale.
 */
async function waitForSettled(
  page: Page,
  pendingRequests: () => number,
): Promise<boolean> {
  const deadline = Date.now() + SETTLE_TIMEOUT_MS
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now()
    const quiet = await page.evaluate(
      ([quietMs, maxMs]) =>
        new Promise<boolean>((resolvePromise) => {
          let timer: ReturnType<typeof setTimeout>
          const finish = (isQuiet: boolean) => {
            observer.disconnect()
            clearTimeout(timer)
            clearTimeout(cap)
            resolvePromise(isQuiet)
          }
          const observer = new MutationObserver((records) => {
            // Le champ de recherche anime son texte indicatif en continu : ce
            // n'est pas du contenu qui arrive.
            if (records.every((r) => r.attributeName === 'placeholder')) return
            clearTimeout(timer)
            timer = setTimeout(() => finish(true), quietMs)
          })
          observer.observe(document.documentElement, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true,
          })
          timer = setTimeout(() => finish(true), quietMs)
          const cap = setTimeout(() => finish(false), maxMs)
        }),
      [QUIET_MS, remaining],
    )
    if (quiet && pendingRequests() === 0) {
      await page.evaluate(() => document.fonts.ready.then(() => undefined))
      return true
    }
  }
  return false
}

/** Ferme la visite guidée (driver.js) comme le ferait un visiteur */
async function closeTour(page: Page): Promise<void> {
  const popover = page.locator('.driver-popover')
  await page.keyboard.press('Escape')
  await popover.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {
    throw new ViewError(
      'visite-guidee',
      'La visite guidée reste affichée après Échap : une mesure serait faussée par son voile.',
    )
  })
}

interface RealState {
  /** Remarques à faire figurer au rapport */
  notes: string[]
  degraded: string | null
}

/** Attend l'état réel de la vue : son contenu, ou le message qui dit son échec */
async function waitForRealState(
  page: Page,
  view: A11yView,
  pendingRequests: () => number,
): Promise<RealState> {
  const notes: string[] = []
  let degraded: string | null = null
  const reach = async (selector: string, state: 'visible' | 'hidden') => {
    await page
      .locator(selector)
      .first()
      .waitFor({ state, timeout: VIEW_TIMEOUT_MS })
      .catch(() => {
        throw new ViewError(
          'etat-reel',
          `État réel non atteint en ${VIEW_TIMEOUT_MS / 1000} s : \`${selector}\` n'est pas ${state === 'visible' ? 'affiché' : 'masqué'}. Paramètres d'URL périmés, page blanche ou vue trop lente.`,
        )
      })
  }
  await reach('#loading', 'hidden')
  if (view.degraded) {
    const nominal = view.ready.join(', ')
    await reach(`${nominal}, ${view.degraded.selector}`, 'visible')
    if (!(await page.locator(nominal).first().isVisible())) {
      const message = await page
        .locator(view.degraded.selector)
        .first()
        .innerText()
      degraded = `${view.degraded.label} : ${message.trim().slice(0, 120)}`
      notes.push(degraded)
    }
  }
  if (degraded === null) {
    for (const selector of view.ready) await reach(selector, 'visible')
    if (view.busy) await reach(view.busy, 'hidden')
  }

  // Un `math-field` existe avant que son shadow DOM soit construit : axe n'y
  // verrait rien, et aucun de ses défauts ne serait compté.
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll('math-field')].every(
          (field) => (field.shadowRoot?.childElementCount ?? 0) > 0,
        ),
      undefined,
      { timeout: VIEW_TIMEOUT_MS },
    )
    .catch(() => {
      throw new ViewError(
        'etat-reel',
        "Un champ math-field n'a jamais construit son shadow DOM.",
      )
    })

  if (view.tour) {
    const popover = page.locator('.driver-popover')
    const appeared = await popover
      .waitFor({ state: 'visible', timeout: TOUR_TIMEOUT_MS })
      .then(() => true)
      .catch(() => false)
    if (appeared) await closeTour(page)
    else notes.push('visite guidée attendue, jamais apparue')
  }

  if (!(await waitForSettled(page, pendingRequests))) {
    notes.push(
      `page encore en mouvement après ${SETTLE_TIMEOUT_MS / 1000} s, mesure peu reproductible`,
    )
  }
  // Une visite ouverte tardivement fausserait la mesure, quelle que soit la vue
  if (await page.locator('.driver-popover').isVisible()) {
    await closeTour(page)
    await waitForSettled(page, pendingRequests)
  }
  return { notes, degraded }
}

/** L'application réécrit l'adresse : un paramètre perdu n'aurait pas eu d'effet */
function checkParameters(page: Page, view: A11yView): void {
  const wanted = new URLSearchParams(view.query)
  const actual = new URL(page.url()).searchParams
  for (const name of ['uuid', 'alea', 'v']) {
    const value = wanted.get(name)
    if (!value) continue
    if (actual.get(name) !== value) {
      throw new ViewError(
        'parametres',
        `Le paramètre ${name}=${value} n'a pas survécu au chargement (adresse finale : ${page.url()}).`,
      )
    }
  }
}

async function runAxe(page: Page): Promise<AxeSummaryInput> {
  for (const frame of page.frames()) {
    await frame.addScriptTag({ path: AXE_SCRIPT })
    await frame.evaluate((locale) => {
      window.axe.configure({ locale })
    }, AXE_LOCALE)
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new ViewError(
            'axe',
            `axe-core n'a pas répondu en ${AXE_TIMEOUT_MS / 1000} s.`,
          ),
        ),
      AXE_TIMEOUT_MS,
    )
  })
  const analysis = page.evaluate(
    ({ tags, excluded }) =>
      window.axe.run(
        { exclude: excluded },
        {
          runOnly: { type: 'tag', values: tags },
          resultTypes: ['violations', 'incomplete'],
        },
      ),
    { tags: AXE_TAGS, excluded: AXE_EXCLUDED_SELECTORS },
  )
  try {
    return (await Promise.race([analysis, timeout])) as AxeSummaryInput
  } finally {
    clearTimeout(timer)
  }
}

async function measureView(
  browser: Browser,
  baseUrl: string,
  view: A11yView,
  rules: Record<string, RuleInfo>,
): Promise<MeasuredView> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'fr-FR',
    colorScheme: 'light',
    serviceWorkers: 'block',
  })
  try {
    const page = await context.newPage()
    const pendingRequests = trackPendingRequests(page)
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    let response
    try {
      response = await page.goto(baseUrl + view.query, {
        waitUntil: 'load',
        timeout: VIEW_TIMEOUT_MS,
      })
    } catch (error) {
      throw new ViewError(
        'navigation',
        `Page inaccessible : ${firstLine(error)}`,
      )
    }
    if (response !== null && !response.ok()) {
      throw new ViewError(
        'navigation',
        `Le serveur a répondu ${response.status()}.`,
      )
    }
    const { notes, degraded } = await waitForRealState(
      page,
      view,
      pendingRequests,
    )
    checkParameters(page, view)
    const { endlessAnimations, ...markers } = await page.evaluate(
      (vitrineSelector) => ({
        mathFields: document.querySelectorAll('math-field').length,
        vitrine: document.querySelector(vitrineSelector) !== null,
        endlessAnimations: document
          .getAnimations()
          .filter(
            (animation) =>
              animation.playState === 'running' &&
              animation.effect?.getComputedTiming().endTime === Infinity,
          ).length,
      }),
      VITRINE_SELECTOR,
    )
    const results = await runAxe(page).catch((error: unknown) => {
      if (error instanceof ViewError) throw error
      throw new ViewError('axe', `axe-core a échoué : ${firstLine(error)}`)
    })
    const summary = summarizeAxeResults(results, rules)
    if (summary === null) {
      throw new ViewError(
        'axe',
        "axe-core n'a évalué aucune règle sur cette page.",
      )
    }
    if (pageErrors.length > 0) {
      notes.push(
        `${pageErrors.length} erreur(s) JavaScript sur la page, dont : ${pageErrors[0].slice(0, 120)}`,
      )
    }
    if (markers.mathFields > 0) {
      notes.push(
        `${markers.mathFields} champ(s) math-field : nom et focus à contrôler à la main`,
      )
    }
    if (markers.vitrine) {
      notes.push('vitrine de coopmaths.fr exclue de la mesure')
    }
    if (endlessAnimations > 0) {
      notes.push(
        `${endlessAnimations} animation(s) sans fin en cours : un contraste peut varier d'un passage à l'autre`,
      )
    }
    return {
      status: 'ok',
      query: view.query,
      durationMs: 0,
      notes,
      markers: { ...markers, degraded },
      ...summary,
    }
  } finally {
    await context.close().catch(() => undefined)
  }
}

function firstLine(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return message.split('\n')[0]
}

async function launchBrowser(config: RunConfig): Promise<Browser> {
  try {
    const browser = await chromium.launch()
    config.browser = `Chromium ${browser.version()}`
    return browser
  } catch (error) {
    throw new ViewError(
      'navigateur',
      `Chromium ne se lance pas : ${firstLine(error)}`,
    )
  }
}

async function measureAll(baseUrl: string, config: RunConfig) {
  const views: Record<string, ViewResult> = {}
  const rules: Record<string, RuleInfo> = {}
  let browser: Browser | null = null
  for (const view of A11Y_VIEWS) {
    const start = Date.now()
    let result: ViewResult
    try {
      // Un plantage du navigateur ne doit pas emporter les vues suivantes
      if (browser === null || !browser.isConnected()) {
        browser = await launchBrowser(config)
      }
      result = await measureView(browser, baseUrl, view, rules)
      result.durationMs = Date.now() - start
    } catch (error) {
      result = {
        status: 'error',
        query: view.query,
        durationMs: Date.now() - start,
        error:
          error instanceof ViewError
            ? { kind: error.kind, message: error.message }
            : { kind: 'navigateur', message: firstLine(error) },
      }
    }
    views[view.name] = result
    console.log(
      result.status === 'ok'
        ? `  ${view.name} : mesurée (${Math.round(result.durationMs / 1000)} s)`
        : `  ⚠️ ${view.name} : ERREUR ${result.error.kind}, ${result.error.message}`,
    )
  }
  await browser?.close().catch(() => undefined)
  return { views, rules }
}

async function main() {
  const baseUrl = resolveBaseUrl()
  const other = otherCheckoutServer(baseUrl)
  if (other !== null) {
    console.error(
      `Le serveur ${baseUrl} sert une autre copie (${other}) : la mesure serait attribuée au mauvais code.\n` +
        `Lancer \`pnpm dev\` depuis ${ROOT}, puis A11Y_BASE_URL=http://localhost:<port affiché par Vite>/alea/ pnpm a11y:report`,
    )
    process.exitCode = 1
    return
  }

  console.log(`Rapport d'accessibilité sur ${baseUrl}`)
  const config: RunConfig = {
    axeVersion: (require('axe-core/package.json') as { version: string })
      .version,
    tags: AXE_TAGS,
    excluded: AXE_EXCLUDED_SELECTORS,
    browser: 'non lancé',
    viewport: VIEWPORT,
    seed: A11Y_SEED,
  }
  const { views, rules } = await measureAll(baseUrl, config)
  const run: A11yRun = {
    version: A11Y_REPORT_VERSION,
    generatedAt: new Date().toISOString(),
    commit: currentCommit(),
    environment: process.env.CI ? 'ci' : 'local',
    baseUrl,
    config,
    rules: Object.fromEntries(
      Object.entries(rules).sort(([a], [b]) => (a < b ? -1 : 1)),
    ),
    views,
  }
  const previous = readPrevious()
  const comparison = compareRuns(previous.run, run, previous.state)

  mkdirSync(OUTPUT_DIR, { recursive: true })
  writeFileSync(MARKDOWN_PATH, renderMarkdown(run, comparison))
  // Sans aucune mesure, ce passage ne peut servir de référence au suivant
  if (computeTotals(run).measured > 0) {
    writeFileSync(JSON_PATH, `${JSON.stringify(run, null, 2)}\n`)
  } else {
    console.log(
      `Aucune vue mesurée : ${JSON_PATH} reste inchangé pour le prochain passage.`,
    )
  }

  console.log(`\n${renderSummary(run, comparison)}`)
  console.log(`\nRapport : ${MARKDOWN_PATH}`)
  console.log(`Données : ${JSON_PATH}`)
  console.log(
    "Ni taux de conformité RGAA ni audit : axe-core ne détecte qu'une partie des défauts.",
  )
}

main().catch((error: unknown) => {
  // Le rapport informe : même un échec imprévu ne doit pas faire échouer un job
  console.error('⚠️ Rapport non produit :', error)
})
