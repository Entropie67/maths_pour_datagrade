/**
 * Vérification en lot du rendu Typst des exercices MathALÉA.
 *
 * Trois niveaux de vérification (CHECK_LEVEL) :
 *   1 — analyse du code source Typst généré (maths non converties, erreurs runtime)
 *   2 — compilation via `typst compile` (erreurs de compilation)
 *   3 — correspondance visuelle (Playwright, à faire séparément)
 *
 * Lance les exercices en jsdom, génère le code Typst via buildTypstDocument(),
 * teste toutes les variations de paramètres + corrigé.
 *
 * Usage :
 *   TYPST_BATCH=1                       pnpm test:src -- typst-batch-check  (niveau 1+2)
 *   TYPST_BATCH=1 CHECK_LEVEL=1         (source uniquement, rapide)
 *   TYPST_BATCH=1 CHECK_LEVEL=2         (compilation, plus lent)
 *   TYPST_BATCH=1 LIMIT=200             pnpm test:src -- typst-batch-check
 *   TYPST_BATCH=1 FAILING=1             pnpm test:src -- typst-batch-check
 *   TYPST_BATCH=1 UNTESTED=1            pnpm test:src -- typst-batch-check
 *   TYPST_BATCH=1 uuid=6N2C-1           pnpm test:src -- typst-batch-check
 *
 * Ne lance rien quand TYPST_BATCH n'est pas défini (intégration test:src normale).
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'path'
import seedrandom from 'seedrandom'
import { fileURLToPath, pathToFileURL } from 'url'
import { Worker } from 'node:worker_threads'
import { afterAll, beforeAll, describe, it, vi } from 'vitest'
import { context } from '../../../modules/context'
import {
  buildTypstDocument,
  type TypstExerciseInput,
} from './buildTypstDocument'

const SHOULD_RUN = process.env.TYPST_BATCH === '1'
// Niveau de vérification : 1 = source uniquement, 2 = source + compilation (défaut)
const CHECK_LEVEL = process.env.CHECK_LEVEL ? parseInt(process.env.CHECK_LEVEL, 10) : 2

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '../../../..')
const STATUS_FILE = resolve(ROOT, 'reports/typst-status.json')
const REF_TO_UUID = resolve(ROOT, 'src/json/refToUuidFR.json')
const UUID_TO_URL = resolve(ROOT, 'src/json/uuidsToUrlFR.json')
const EXERCICES_DIR = resolve(ROOT, 'src/exercices')
const TMP_DIR = join(tmpdir(), 'typst-batch-check')
const EXCLUDED_FILES = new Set([
  'Exercice.ts',
  'MetaExerciceCan.ts',
  '_ExternalApp.ts',
  'ExempleCanListeDeroulante.ts',
])

type ExerciseStatus = 'untested' | 'passing' | 'failing' | 'partial' | 'skip'
type FailureMode =
  | 'compile_error'
  | 'missing_figure'
  | 'unprocessed_math'
  | 'interactive_only'
  | 'missing_package'
  | 'runtime_error'
  | null

interface ExerciseEntry {
  uuid: string
  ref: string
  file: string
  lastChecked: string
  status: ExerciseStatus
  checkedLevel: 0 | 1 | 2  // niveau le plus élevé validé (0 = non testé)
  failureMode: FailureMode
  notes: string
  variationsTested: string[]
  diagnostics: string[]
}

interface StatusDatabase {
  version: number
  lastRun: string
  exercises: Record<string, ExerciseEntry>
}

// ─── Setup jsdom shims ────────────────────────────────────────────────────────

function installDomShims() {
  if (typeof SVGElement !== 'undefined' && SVGElement.prototype) {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 100, height: 100 }),
    })
  }
  if (typeof HTMLCanvasElement !== 'undefined') {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => ({
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: [] }),
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: () => ({ width: 0 }),
        transform: () => {},
        rect: () => {},
        clip: () => {},
      }),
    })
  }
  if (typeof window !== 'undefined') {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
    } as MediaQueryList)
  }
}

vi.mock('../../../lib/3d/3d_dynamique/Canvas3DElement', () => ({
  ajouteCanvas3d: vi.fn(() => 'canvas3D-mock'),
}))
vi.mock('../../../lib/3d/3d_dynamique/solidesThreeJs', () => ({
  sphericalToCartesian: vi.fn(() => 'spherical-mock'),
}))
vi.mock('../../../lib/components/version', () => ({
  fetchServerVersion: vi.fn(() => Promise.resolve('1.0.0')),
  checkForServerUpdate: vi.fn(() => Promise.resolve(false)),
}))
vi.mock('../../../lib/renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked-scratch'),
  renderScratchDiv: vi.fn(),
}))
vi.mock('apigeom', async (original) => {
  const real = await original()
  ;(globalThis as any).APP_VERSION = 'test'
  return real
})

installDomShims()

// ─── Helpers ──────────────────────────────────────────────────────────────────

const { mathaleaHandleExerciceSimple, mathaleaFormatExercice } = await import(
  '../../../lib/mathalea'
)

function loadStatus(): StatusDatabase {
  if (existsSync(STATUS_FILE)) {
    try {
      return JSON.parse(readFileSync(STATUS_FILE, 'utf8'))
    } catch {
      /* corrompu */
    }
  }
  return { version: 1, lastRun: new Date().toISOString(), exercises: {} }
}

function saveStatus(db: StatusDatabase) {
  db.lastRun = new Date().toISOString()
  writeFileSync(STATUS_FILE, JSON.stringify(db, null, 2), 'utf8')
}

function loadJsonMap(path: string): Record<string, string> {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return {}
  }
}

function resolveUuid(input: string): string | null {
  const uuidToUrl = loadJsonMap(UUID_TO_URL)
  const refToUuid = loadJsonMap(REF_TO_UUID)
  if (uuidToUrl[input]) return input
  if (refToUuid[input]) return refToUuid[input]
  return null
}

function getUuidRef(
  uuid: string,
  refToUuid: Record<string, string>,
): string {
  for (const [ref, u] of Object.entries(refToUuid)) {
    if (u === uuid) return ref
  }
  return uuid
}

function sampleSup<T extends Record<number, any>>(sup: T): number[] {
  const keys = Object.keys(sup).map(Number).sort((a, b) => a - b)
  const n = keys.length
  if (n <= 3) return keys
  const middle = keys[Math.round((n - 1) / 2)]
  return Array.from(new Set([keys[0], middle, keys[n - 1]]))
}

function sampleSupWithFallback<T extends Record<number, any>>(
  sup: T,
): Array<number | undefined> {
  const s = sampleSup(sup)
  return s.length > 0 ? s : [undefined]
}

function parseMappingFromText(text: string): Record<number, string> {
  const mapping: Record<number, string> = {}
  for (const line of text.split('\n')) {
    const m = line.trim().match(/^(\d+)\s*:\s*(.+)$/)
    if (m) mapping[parseInt(m[1], 10)] = m[2].trim()
  }
  return mapping
}

function buildSupRecord(
  exercice: any,
  level: 1 | 2 | 3 | 4 | 5,
): Record<number, any> {
  const sup: Record<number, any> = {}
  const form = exercice[`besoinFormulaire${level === 1 ? '' : level}Texte`]
  const formNum = exercice[`besoinFormulaire${level === 1 ? '' : level}Numerique`]
  const formCheck = exercice[`besoinFormulaire${level === 1 ? '' : level}CaseACocher`]
  if (Array.isArray(form) && form.length >= 2) {
    const values = parseMappingFromText(form[1])
    Object.keys(values).forEach((k) => { sup[parseInt(k, 10)] = String(parseInt(k, 10)) })
  } else if (Array.isArray(formNum) && formNum.length > 0) {
    // Cap at 3 pour limiter le nombre de combinaisons à tester
    const max = Math.min(isNaN(Number(formNum[1])) ? 2 : Number(formNum[1]), 3)
    for (let i = 0; i < max; i++) sup[i] = i + 1
  } else if (formCheck) {
    sup[0] = true
    sup[1] = false
  }
  return sup
}

function compileTypst(source: string): { ok: boolean; diagnostics: string[]; sourceSnippet: string[] } {
  const tmpFile = join(TMP_DIR, `${Date.now()}-${Math.random().toString(36).slice(2)}.typ`)
  try {
    writeFileSync(tmpFile, source, 'utf8')
    const result = spawnSync('typst', ['compile', tmpFile, '--font-path', resolve(ROOT, 'public/fonts/typst'), '--format', 'pdf', '/dev/null'], {
      timeout: 30_000,
      encoding: 'utf8',
    })
    const stderr = (result.stderr ?? '') + (result.stdout ?? '')
    const diagnostics = stderr
      .split('\n')
      .filter((l) => l.trim())
      .filter((l) => /error:|warning:/.test(l))

    // Extraire les numéros de ligne des erreurs pour montrer le contexte source
    const sourceSnippet: string[] = []
    if (result.status !== 0) {
      const sourceLines = source.split('\n')
      const lineNums = new Set<number>()
      for (const diag of diagnostics) {
        // typst format: "path:line:col: error: message"
        const m = diag.match(/:(\d+):\d+:/)
        if (m) {
          const ln = parseInt(m[1], 10) - 1
          for (let i = Math.max(0, ln - 1); i <= Math.min(sourceLines.length - 1, ln + 1); i++) {
            lineNums.add(i)
          }
        }
      }
      for (const ln of [...lineNums].sort((a, b) => a - b)) {
        sourceSnippet.push(`${ln + 1}: ${sourceLines[ln]}`)
      }
    }

    const ok = result.status === 0
    if (!ok) {
      // Sauvegarde le source Typst en erreur pour débogage
      const debugFile = `/tmp/typst-debug-${Date.now()}.typ`
      try { writeFileSync(debugFile, source) } catch {}
      process.stderr.write(`\n[debug] typst error source: ${debugFile}\n[debug] stderr: ${stderr.slice(0, 400)}\n`)
    }
    return { ok, diagnostics, sourceSnippet }
  } finally {
    try { rmSync(tmpFile) } catch { /* ignore */ }
  }
}

function detectUnprocessedMath(source: string): string[] {
  // Retourne les extraits problématiques (commandes LaTeX non converties dans $...$)
  const problems: string[] = []
  const lines = source.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || /^#/.test(trimmed)) continue
    if (/^[})]/.test(trimmed) || /^\}\s*(else|if)/.test(trimmed)) continue
    const mathBlocks = line.match(/\$[^$]+\$/g) ?? []
    for (const block of mathBlocks) {
      if (/\\[a-zA-Z]+\s*\{/.test(block)) {
        problems.push(block.slice(0, 120))
        if (problems.length >= 3) return problems
      }
    }
  }
  return problems
}

function detectHtmlRemnants(source: string): string[] {
  // Retourne les balises HTML non converties trouvées dans le source Typst
  const problems: string[] = []
  const lines = source.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || /^#/.test(trimmed)) continue
    const tagMatch = line.match(/<\/?(span|div|p|br|em|strong|sub|sup|table|tr|td|th|ul|ol|li|h[1-6]|img|a)\b[^>]*>/i)
    if (tagMatch) {
      problems.push(line.trim().slice(0, 120))
      if (problems.length >= 3) return problems
    }
    const entityMatch = line.match(/&(amp|lt|gt|nbsp|quot|apos);/)
    if (entityMatch) {
      problems.push(line.trim().slice(0, 120))
      if (problems.length >= 3) return problems
    }
  }
  return problems
}

function classifyError(diagnostics: string[]): FailureMode {
  const text = diagnostics.join('\n')
  if (text.includes('package not found') || text.includes('@preview')) return 'missing_package'
  if (/undefined variable.*fig-/.test(text)) return 'missing_figure'
  return 'compile_error'
}

function isInteractiveOnly(exercice: any): boolean {
  const type = exercice.typeExercice ?? ''
  return (
    type === 'html' ||
    type.includes('html') ||
    (typeof exercice.figuresApiGeom !== 'undefined' &&
      !exercice.listeQuestions?.some((q: string) => q.includes('<svg')))
  )
}

// ─── Long-running worker pool ─────────────────────────────────────────────────

/**
 * Exercices qui génèrent des figures SVG complexes et dépassent le timeout
 * même avec 50 s. Pour ces exercices, on n'utilise que les paramètres par
 * défaut du constructeur (une seule combinaison, sans variation de sup).
 */
const SIMPLE_MODE_UUIDS = new Set([
  '4b495', // géométrie complexe
  '37e38', // 5G42-2 — figures lourdes
  '37e39', // 5G42-3 — figures lourdes
  'ff2ce', // 6G4B-1 — figures lourdes
  'ff2cc', // 6G4B   — figures lourdes
  'e9dac', // 6I1B-8 — figures lourdes
  '2621f', // 5P12-2 — timeout
  'ab968', // 5R12-2 — timeout
  'ab969', // 5R12-2 — timeout
  'f8dee', // 6G2B   — window.matchMedia + timeout
  '0dbe7', // 6G3B   — window.matchMedia + timeout
  '328b1', // 6G7B-7 — timeout
  '75ea2', // 3G40   — timeout
  '6cf42', // 2G21-2 — window.matchMedia
  '3a3ec', // 2G22-1 — window.matchMedia
  'c0f90', // runtime error (Cannot set properties of undefined)
])

/**
 * Délai maximal par exercice (hors startup worker).
 * Niveau 1 : 20 s. Niveau 2 : 50 s (inclut `typst compile`).
 * Le worker charge mathalea une seule fois au démarrage (~15-20s),
 * puis traite les exercices séquentiellement.
 */
const EXERCISE_TIMEOUT_MS = CHECK_LEVEL < 2 ? 20_000 : 50_000

/** Timeout pour le démarrage du worker (chargement de mathalea.ts) */
const WORKER_STARTUP_TIMEOUT_MS = 60_000

const WORKER_FILE = resolve(__dirname, 'typst-batch-worker.ts')
const WORKER_LOADER_FILE = pathToFileURL(resolve(__dirname, 'typst-worker-loader.mjs')).href

function spawnWorker(): Promise<Worker> {
  return new Promise((res, rej) => {
    const w = new Worker(WORKER_FILE, {
      execArgv: ['--loader', WORKER_LOADER_FILE, '--experimental-vm-modules'],
    })
    w.setMaxListeners(0)
    const timer = setTimeout(() => {
      w.terminate()
      rej(new Error(`Worker startup timeout (${WORKER_STARTUP_TIMEOUT_MS / 1000}s)`))
    }, WORKER_STARTUP_TIMEOUT_MS)
    w.once('message', (msg: any) => {
      if (msg?.type === 'ready') { clearTimeout(timer); res(w) }
    })
    w.once('error', (err) => { clearTimeout(timer); rej(err) })
    w.once('exit', (code) => { clearTimeout(timer); if (code !== 0) rej(new Error(`Worker exited with code ${code}`)) })
  })
}

let sharedWorker: Worker | null = null

async function getOrCreateWorker(): Promise<Worker> {
  if (sharedWorker) return sharedWorker
  sharedWorker = await spawnWorker()
  sharedWorker.once('exit', () => { sharedWorker = null })
  sharedWorker.once('error', () => { sharedWorker = null })
  return sharedWorker
}

function checkExerciseWithWorker(
  filePath: string,
  uuid: string,
  ref: string,
): Promise<ExerciseEntry> {
  const timeoutEntry: ExerciseEntry = {
    uuid, ref, file: filePath.replace(ROOT + '/', ''),
    lastChecked: new Date().toISOString(),
    status: 'failing', checkedLevel: 0,
    failureMode: 'runtime_error',
    notes: `Timeout (>${EXERCISE_TIMEOUT_MS / 1000}s) : exercice bloqué`,
    variationsTested: [], diagnostics: [],
  }

  return new Promise<ExerciseEntry>((promiseResolve) => {
    let settled = false
    const settle = (entry: ExerciseEntry) => {
      if (settled) return
      settled = true
      promiseResolve(entry)
    }

    getOrCreateWorker().then((worker) => {
      const cleanup = () => {
        clearTimeout(timer)
        worker.off('message', responseHandler)
        worker.off('error', errorHandler)
        worker.off('exit', exitHandler)
      }
      const responseHandler = (msg: any) => {
        if (msg?.type !== 'result') return
        cleanup()
        settle(msg.result as ExerciseEntry)
      }
      const errorHandler = (err: Error) => {
        cleanup()
        sharedWorker = null
        settle({ ...timeoutEntry, notes: `Worker error: ${String(err?.message ?? err).slice(0, 200)}` })
      }
      const exitHandler = (code: number) => {
        cleanup()
        sharedWorker = null
        if (code !== 0) settle(timeoutEntry)
      }

      const timer = setTimeout(async () => {
        cleanup()
        // Terminate the stuck worker; the shared worker will be recreated next time
        await worker.terminate()
        sharedWorker = null
        settle(timeoutEntry)
      }, EXERCISE_TIMEOUT_MS)

      worker.on('message', responseHandler)
      worker.on('error', errorHandler)
      worker.on('exit', exitHandler)

      worker.postMessage({ type: 'check', filePath, uuid, ref, checkLevel: CHECK_LEVEL, root: ROOT })
    }).catch((err) => {
      settle({ ...timeoutEntry, notes: `Worker startup failed: ${String(err?.message ?? err).slice(0, 200)}` })
    })
  })
}

async function checkExerciseFile(
  filePath: string,
  uuid: string,
  ref: string,
): Promise<ExerciseEntry> {
  const relFile = filePath.replace(ROOT + '/', '')
  const entry: ExerciseEntry = {
    uuid,
    ref,
    file: relFile,
    lastChecked: new Date().toISOString(),
    status: 'untested',
    checkedLevel: 0,
    failureMode: null,
    notes: '',
    variationsTested: [],
    diagnostics: [],
  }

  let module: any
  try {
    module = await import(pathToFileURL(filePath).href)
  } catch (err: any) {
    entry.status = 'failing'
    entry.failureMode = 'runtime_error'
    entry.notes = `Erreur d'import: ${String(err?.message ?? err).slice(0, 120)}`
    return entry
  }

  const ExerciceClass = module.default
  if (typeof ExerciceClass !== 'function') {
    entry.status = 'skip'
    entry.notes = 'Pas de classe exportée par défaut'
    return entry
  }

  let exercice: any
  try {
    exercice = new ExerciceClass()
  } catch (err: any) {
    entry.status = 'failing'
    entry.failureMode = 'runtime_error'
    entry.notes = `Erreur de construction: ${String(err?.message ?? err).slice(0, 120)}`
    return entry
  }

  // Exercices purement interactifs sans rendu statique
  const type = exercice.typeExercice ?? ''
  if (type === 'html' || (type !== 'simple' && type !== '' && type !== 'statique' && !exercice.nouvelleVersion)) {
    entry.status = 'skip'
    entry.failureMode = 'interactive_only'
    entry.notes = `typeExercice="${type}" — pas de rendu Typst attendu`
    return entry
  }

  // Variations à tester (sup1..sup5)
  // Pour les exercices connus pour dépasser le timeout, on n'utilise que les
  // paramètres par défaut du constructeur (une seule combinaison sans variation).
  const simpleMode = SIMPLE_MODE_UUIDS.has(uuid)
  const sup1 = buildSupRecord(exercice, 1)
  const sup2 = buildSupRecord(exercice, 2)
  const sup3 = buildSupRecord(exercice, 3)
  const sup4 = buildSupRecord(exercice, 4)
  const sup5 = buildSupRecord(exercice, 5)

  const variations1 = simpleMode ? [undefined] : sampleSupWithFallback(sup1)
  const variations2 = simpleMode ? [undefined] : sampleSupWithFallback(sup2)
  const variations3 = simpleMode ? [undefined] : sampleSupWithFallback(sup3)
  const variations4 = simpleMode ? [undefined] : sampleSupWithFallback(sup4)
  const variations5 = simpleMode ? [undefined] : sampleSupWithFallback(sup5)

  let firstFailure: { mode: FailureMode; notes: string; diagnostics: string[] } | null = null
  let anyPassing = false
  const testedSigs: string[] = []

  // Construire la liste de combinaisons (produit cartésien), limité à MAX_COMBOS au total
  const MAX_COMBOS = 27
  const combos: Array<[number|undefined, number|undefined, number|undefined, number|undefined, number|undefined]> = []
  outer_build: for (const k1 of variations1) {
    for (const k2 of variations2) {
      for (const k3 of variations3) {
        for (const k4 of variations4) {
          for (const k5 of variations5) {
            combos.push([k1, k2, k3, k4, k5])
            if (combos.length >= MAX_COMBOS) break outer_build
          }
        }
      }
    }
  }

  for (const [k1, k2, k3, k4, k5] of combos) {
    if (k1 !== undefined) exercice.sup = sup1[k1]
    if (k2 !== undefined) exercice.sup2 = sup2[k2]
    if (k3 !== undefined) exercice.sup3 = sup3[k3]
    if (k4 !== undefined) exercice.sup4 = sup4[k4]
    if (k5 !== undefined) exercice.sup5 = sup5[k5]

    const sig = `sup=${exercice.sup}:sup2=${exercice.sup2}:sup3=${exercice.sup3}:sup4=${exercice.sup4}:sup5=${exercice.sup5}`
    testedSigs.push(sig)

    // Générer le contenu de l'exercice (questions + corrigé)
    try {
      const prevCtx = { isHtml: context.isHtml, isAmc: context.isAmc }
      context.isHtml = true
      context.isAmc = false
      seedrandom('typst-check', { global: true })

      exercice.numeroExercice = 0
      if (typeof exercice.applyNewSeed === 'function') exercice.applyNewSeed()
      seedrandom(exercice.seed ?? 'typst-check', { global: true })

      if (exercice.typeExercice === 'simple') {
        mathaleaHandleExerciceSimple(exercice, false, 0)
      } else if (typeof exercice.nouvelleVersion === 'function') {
        await Promise.resolve(exercice.nouvelleVersion())
      } else if (typeof exercice.nouvelleVersionWrapper === 'function') {
        exercice.nouvelleVersionWrapper(0)
      }

      context.isHtml = prevCtx.isHtml
      context.isAmc = prevCtx.isAmc
    } catch (err: any) {
      const msg = String(err?.message ?? err).slice(0, 120)
      if (!firstFailure) {
        firstFailure = { mode: 'runtime_error', notes: `[${sig}] Runtime: ${msg}`, diagnostics: [] }
      }
      continue
    }

    // Construire l'input Typst (identique à Typst.svelte:buildInputs)
    const fmt = (text: string) =>
      mathaleaFormatExercice(text).replaceAll('{zoomFactor}', '1')
    const questions = (exercice.listeQuestions ?? []).map(fmt)
    const corrections = (exercice.listeCorrections ?? []).map(fmt)
    const intro = mathaleaFormatExercice(
      [exercice.consigne, exercice.introduction]
        .filter((t: any) => t != null && String(t).length > 0)
        .join('<br>'),
    )
    const introCorrection = mathaleaFormatExercice(exercice.consigneCorrection ?? '')
    const numbered = questions.length > 1 && exercice.listeAvecNumerotation !== false

    const input: TypstExerciseInput = {
      ref,
      intro,
      questions,
      corrections,
      introCorrection,
      numbered,
    }

    // Générer le document Typst (corrigé inclus par défaut via #let corrige = true)
    let typstSource = ''
    try {
      typstSource = buildTypstDocument([input])
    } catch (err: any) {
      const msg = String(err?.message ?? err).slice(0, 120)
      if (!firstFailure) {
        firstFailure = { mode: 'compile_error', notes: `[${sig}] buildTypstDocument: ${msg}`, diagnostics: [] }
      }
      continue
    }

    // Niveau 1 : détecter les maths non converties et restes HTML dans le source Typst
    const unprocessedMath = detectUnprocessedMath(typstSource)
    const htmlRemnants = detectHtmlRemnants(typstSource)

    if (unprocessedMath.length > 0 && !firstFailure) {
      firstFailure = {
        mode: 'unprocessed_math',
        notes: `Maths LaTeX non converties [${sig}]: ${unprocessedMath.join(' | ')}`,
        diagnostics: unprocessedMath,
      }
    } else if (htmlRemnants.length > 0 && !firstFailure) {
      firstFailure = {
        mode: 'unprocessed_math',
        notes: `HTML non converti [${sig}]: ${htmlRemnants.join(' | ')}`,
        diagnostics: htmlRemnants,
      }
    }

    if (CHECK_LEVEL < 2) {
      // Niveau 1 seulement : pas de compilation
      if (!firstFailure) anyPassing = true
      continue
    }

    // Niveau 2 : compiler via typst CLI
    const { ok, diagnostics, sourceSnippet } = compileTypst(typstSource)

    if (ok && !firstFailure) {
      anyPassing = true
    } else if (!ok) {
      const mode = classifyError(diagnostics)
      if (!firstFailure) {
        const errorLines = diagnostics.slice(0, 3).join(' | ')
        const contextLines = sourceSnippet.length > 0 ? '\n' + sourceSnippet.join('\n') : ''
        firstFailure = {
          mode,
          notes: `[${sig}] ${errorLines}${contextLines}`,
          diagnostics: [...diagnostics, ...sourceSnippet],
        }
      }
    }
  }

  entry.variationsTested = testedSigs

  if (firstFailure) {
    entry.status = firstFailure.mode === 'unprocessed_math' ? 'partial' : 'failing'
    entry.failureMode = firstFailure.mode
    entry.notes = firstFailure.notes
    entry.diagnostics = firstFailure.diagnostics
    // compile_error / missing_* ne peuvent survenir qu'au niveau 2
    entry.checkedLevel = (firstFailure.mode === 'compile_error' || firstFailure.mode === 'missing_figure' || firstFailure.mode === 'missing_package') ? 2 : 1
  } else if (anyPassing) {
    entry.status = 'passing'
    entry.checkedLevel = CHECK_LEVEL as 1 | 2
  } else {
    entry.status = 'skip'
    entry.notes = 'Aucune variation générée'
    entry.checkedLevel = CHECK_LEVEL as 1 | 2
  }

  return entry
}

// ─── Test runner ──────────────────────────────────────────────────────────────

describe('Typst batch check', () => {
  if (!SHOULD_RUN) {
    it.skip('désactivé (TYPST_BATCH=1 requis)', () => {})
    return
  }

  beforeAll(() => {
    installDomShims()
    mkdirSync(TMP_DIR, { recursive: true })
  })

  afterAll(async () => {
    try { rmSync(TMP_DIR, { recursive: true }) } catch { /* ignore */ }
    if (sharedWorker) { await sharedWorker.terminate(); sharedWorker = null }
  })

  it('vérifie tous les exercices en Typst', async () => {
    const db = loadStatus()
    const uuidToUrl = loadJsonMap(UUID_TO_URL)
    const refToUuid = loadJsonMap(REF_TO_UUID)

    const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : Infinity
    const skip = process.env.SKIP ? parseInt(process.env.SKIP) : 0
    const inputUuid = process.env.uuid

    let allUuids: string[]

    if (inputUuid) {
      const resolved = resolveUuid(inputUuid)
      allUuids = resolved ? [resolved] : []
    } else if (process.env.FAILING === '1') {
      allUuids = Object.keys(uuidToUrl)
        .filter((u) => {
          const status = db.exercises[getUuidRef(u, refToUuid)]?.status
          return status === 'failing' || status === 'partial'
        })
        .slice(0, limit)
    } else if (process.env.UNTESTED === '1') {
      allUuids = Object.keys(uuidToUrl)
        .filter((u) => {
          const ref = getUuidRef(u, refToUuid)
          const ex = db.exercises[ref]
          // "non testé" = jamais testé OU testé à un niveau inférieur au niveau demandé
          return !ex || ex.status === 'untested' || (ex.checkedLevel ?? 0) < CHECK_LEVEL
        })
        .slice(0, limit)
    } else {
      allUuids = Object.keys(uuidToUrl).slice(skip, limit === Infinity ? undefined : skip + limit)
    }

    if (allUuids.length === 0) {
      console.log('Aucun exercice à tester.')
      return
    }

    console.log(`\n🔍 Vérification Typst (niveau ${CHECK_LEVEL}) de ${allUuids.length} exercice(s)...\n`)

    let passing = 0, failing = 0, partial = 0, skipped = 0

    for (const uuid of allUuids) {
      const relUrl = uuidToUrl[uuid]
      if (!relUrl) continue

      const filePath = resolve(EXERCICES_DIR, relUrl)
      if (!existsSync(filePath) || EXCLUDED_FILES.has(filePath.split('/').pop()!)) {
        skipped++
        continue
      }

      const ref = getUuidRef(uuid, refToUuid)
      process.stdout.write(`  ${ref} (${uuid})…`)

      const entry = await checkExerciseWithWorker(filePath, uuid, ref)
      db.exercises[ref] = entry
      saveStatus(db)

      if (entry.status === 'passing') {
        process.stdout.write(' ✅\n')
        passing++
      } else if (entry.status === 'partial') {
        process.stdout.write(` ⚠️  ${entry.failureMode}\n`)
        // Afficher le détail de l'erreur sur les lignes suivantes
        for (const line of (entry.notes ?? '').split('\n').filter(Boolean)) {
          process.stdout.write(`      ${line}\n`)
        }
        partial++
      } else if (entry.status === 'skip') {
        process.stdout.write(` ⏭️  ${entry.notes.slice(0, 60)}\n`)
        skipped++
      } else {
        process.stdout.write(` ❌ ${entry.failureMode}\n`)
        // Afficher le détail de l'erreur sur les lignes suivantes
        for (const line of (entry.notes ?? '').split('\n').filter(Boolean)) {
          process.stdout.write(`      ${line}\n`)
        }
        failing++
      }
    }

    const total = passing + failing + partial + skipped
    console.log(`\n📊 Résultats (${total} exercices) :`)
    console.log(`  ✅ Passing  : ${passing}`)
    console.log(`  ⚠️  Partial : ${partial}`)
    console.log(`  ❌ Failing  : ${failing}`)
    console.log(`  ⏭️  Skipped : ${skipped}`)
    console.log(`\nRapport : ${STATUS_FILE}`)
  }, 3_600_000)
})
