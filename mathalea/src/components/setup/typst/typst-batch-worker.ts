/**
 * Worker thread long-running pour le batch check Typst.
 *
 * Chargement unique de mathalea + jsdom au démarrage, puis traitement
 * des exercices un par un via messages. Un nouveau worker est créé si
 * le précédent se bloque (boucle infinie, etc.).
 *
 * Protocol messages :
 *   → { type: 'check', filePath, uuid, ref, checkLevel, root }
 *   ← ExerciseEntry (résultat)
 *
 * Le worker reste actif jusqu'à ce qu'il soit terminé (worker.terminate()).
 */

import { appendFileSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { parentPort } from 'node:worker_threads'
import { dirname, join, resolve } from 'path'
import seedrandom from 'seedrandom'
import { fileURLToPath, pathToFileURL } from 'url'

// polices libres servies par MathALÉA : chargées aussi pour la compilation
// CLI afin que l'aperçu navigateur et les tests rendent les mêmes polices
const FONT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../public/fonts/typst',
)

// ─── Setup jsdom (une fois au démarrage) ─────────────────────────────────────

const { JSDOM } = await import('jsdom')
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost:5173/',
})
const { window: w } = dom
for (const [key, value] of [
  ['window', w],
  ['document', w.document],
  ['navigator', w.navigator],
  ['location', w.location],
  ['history', w.history],
  [
    'localStorage',
    {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    },
  ],
  [
    'sessionStorage',
    {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    },
  ],
  ['MutationObserver', w.MutationObserver],
  [
    'ResizeObserver',
    w.ResizeObserver ??
      class ResizeObserver {
        observe() {}
        disconnect() {}
      },
  ],
  ['XMLHttpRequest', w.XMLHttpRequest],
  [
    'fetch',
    w.fetch ?? (() => Promise.reject(new Error('fetch not available'))),
  ],
  ['Node', w.Node],
  ['getComputedStyle', w.getComputedStyle.bind(w)],
  ['Element', w.Element],
  ['HTMLElement', w.HTMLElement],
  ['HTMLButtonElement', w.HTMLButtonElement],
  ['HTMLInputElement', w.HTMLInputElement],
  ['HTMLSelectElement', w.HTMLSelectElement],
  ['HTMLTextAreaElement', w.HTMLTextAreaElement],
  ['HTMLDivElement', w.HTMLDivElement],
  ['HTMLSpanElement', w.HTMLSpanElement],
  ['SVGElement', w.SVGElement],
  ['XMLSerializer', w.XMLSerializer],
  ['Event', w.Event],
  ['CustomEvent', w.CustomEvent],
  ['requestAnimationFrame', (fn: () => void) => setTimeout(fn, 16)],
  ['cancelAnimationFrame', clearTimeout],
  [
    'matchMedia',
    () => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  ],
  [
    'customElements',
    w.customElements ?? {
      define: () => {},
      get: () => undefined,
      whenDefined: () => Promise.resolve(),
      upgrade: () => {},
    },
  ],
] as const) {
  if (!(key in globalThis) || key === 'window') {
    try {
      Object.defineProperty(globalThis, key, {
        value,
        writable: true,
        configurable: true,
      })
    } catch {
      /* ignore */
    }
  }
}

// jsdom ne fournit pas window.matchMedia — on le stubble directement sur l'objet window
const matchMediaStub = () => ({
  matches: false,
  media: '',
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})
try {
  Object.defineProperty(w, 'matchMedia', {
    value: matchMediaStub,
    writable: true,
    configurable: true,
  })
} catch {
  /* ignore */
}

if (w.SVGElement?.prototype) {
  Object.defineProperty(w.SVGElement.prototype, 'getBBox', {
    configurable: true,
    value: () => ({ x: 0, y: 0, width: 100, height: 100 }),
  })
}

if (w.HTMLCanvasElement?.prototype) {
  Object.defineProperty(w.HTMLCanvasElement.prototype, 'getContext', {
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

// APP_VERSION est une define Vite — non disponible dans le worker, on le stub
;(globalThis as any).APP_VERSION = 'test'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  checkedLevel: 0 | 1 | 2
  failureMode: FailureMode
  notes: string
  variationsTested: string[]
  diagnostics: string[]
}

interface CheckRequest {
  type: 'check'
  filePath: string
  uuid: string
  ref: string
  checkLevel: number
  root: string
}

// ─── Imports dynamiques (une fois au démarrage) ───────────────────────────────

const { context } = await import('../../../modules/context')
const { mathaleaHandleExerciceSimple, mathaleaFormatExercice } =
  await import('../../../lib/mathalea')
const { buildTypstDocument, defaultTypstDocumentOptions } =
  await import('./buildTypstDocument')
const { getShortAnswer, minimalCorrection } =
  await import('./minimalCorrection')
// MINIMAL=1 : réglage « Correction minimale » ; MINIMAL_DUMP=<fichier> y consigne le résultat
const MINIMAL = process.env.MINIMAL === '1'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TMP_DIR = join(tmpdir(), 'typst-batch-check-worker')
try {
  mkdirSync(TMP_DIR, { recursive: true })
} catch {}

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
  const formNum =
    exercice[`besoinFormulaire${level === 1 ? '' : level}Numerique`]
  const formCheck =
    exercice[`besoinFormulaire${level === 1 ? '' : level}CaseACocher`]
  if (Array.isArray(form) && form.length >= 2) {
    const values = parseMappingFromText(form[1])
    Object.keys(values).forEach((k) => {
      sup[parseInt(k, 10)] = String(parseInt(k, 10))
    })
  } else if (Array.isArray(formNum) && formNum.length > 0) {
    const max = Math.min(isNaN(Number(formNum[1])) ? 2 : Number(formNum[1]), 3)
    for (let i = 0; i < max; i++) sup[i] = i + 1
  } else if (formCheck) {
    sup[0] = true
    sup[1] = false
  }
  return sup
}

function sampleSup<T extends Record<number, any>>(sup: T): number[] {
  const keys = Object.keys(sup)
    .map(Number)
    .sort((a, b) => a - b)
  const n = keys.length
  if (n === 0) return []
  if (n <= 3) return keys
  const step = n / 3
  return [keys[0], keys[Math.round(step)], keys[n - 1]]
}

function sampleSupWithFallback<T extends Record<number, any>>(
  sup: T,
): Array<number | undefined> {
  const s = sampleSup(sup)
  return s.length > 0 ? s : [undefined]
}

function detectUnprocessedMath(source: string): string[] {
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
  const problems: string[] = []
  for (const line of source.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || /^#/.test(trimmed)) continue
    const tagMatch = line.match(
      /<\/?(span|div|p|br|em|strong|sub|sup|table|tr|td|th|ul|ol|li|h[1-6]|img|a)\b[^>]*>/i,
    )
    if (tagMatch) {
      problems.push(trimmed.slice(0, 120))
      if (problems.length >= 3) return problems
    }
    const entityMatch = line.match(/&(amp|lt|gt|nbsp|quot|apos);/)
    if (entityMatch) {
      problems.push(trimmed.slice(0, 120))
      if (problems.length >= 3) return problems
    }
  }
  return problems
}

function classifyError(diagnostics: string[]): FailureMode {
  const text = diagnostics.join('\n')
  if (text.includes('package not found') || text.includes('@preview'))
    return 'missing_package'
  if (/undefined variable.*fig-/.test(text)) return 'missing_figure'
  return 'compile_error'
}

function compileTypst(source: string): {
  ok: boolean
  diagnostics: string[]
  sourceSnippet: string[]
} {
  const tmpFile = join(
    TMP_DIR,
    `${Date.now()}-${Math.random().toString(36).slice(2)}.typ`,
  )
  try {
    writeFileSync(tmpFile, source, 'utf8')
    const result = spawnSync(
      'typst',
      [
        'compile',
        tmpFile,
        '--font-path',
        FONT_PATH,
        '--format',
        'pdf',
        '/dev/null',
      ],
      {
        timeout: 30_000,
        encoding: 'utf8',
      },
    )
    const stderr = (result.stderr ?? '') + (result.stdout ?? '')
    const diagnostics = stderr
      .split('\n')
      .filter((l) => l.trim())
      .filter((l) => /error:|warning:/.test(l))
    const sourceSnippet: string[] = []
    if (result.status !== 0) {
      const sourceLines = source.split('\n')
      const lineNums = new Set<number>()
      for (const diag of diagnostics) {
        const m = diag.match(/:(\d+):\d+:/)
        if (m) {
          const ln = parseInt(m[1], 10) - 1
          for (
            let i = Math.max(0, ln - 1);
            i <= Math.min(sourceLines.length - 1, ln + 1);
            i++
          )
            lineNums.add(i)
        }
      }
      for (const ln of [...lineNums].sort((a, b) => a - b))
        sourceSnippet.push(`${ln + 1}: ${sourceLines[ln]}`)
    }
    const ok = result.status === 0
    if (!ok) {
      try {
        writeFileSync('/tmp/typst-last-error.typ', source)
      } catch {}
    }
    return { ok, diagnostics, sourceSnippet }
  } finally {
    try {
      rmSync(tmpFile)
    } catch {}
  }
}

// ─── Core check logic ─────────────────────────────────────────────────────────

/**
 * Exercices qui génèrent des figures SVG complexes et dépassent le timeout.
 * Pour ces exercices, on n'utilise que les paramètres par défaut du constructeur.
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

async function checkExerciseFile(
  fp: string,
  id: string,
  r: string,
  checkLevel: number,
  root: string,
): Promise<ExerciseEntry> {
  const entry: ExerciseEntry = {
    uuid: id,
    ref: r,
    file: fp.replace(root + '/', ''),
    lastChecked: new Date().toISOString(),
    status: 'untested',
    checkedLevel: 0,
    failureMode: null,
    notes: '',
    variationsTested: [],
    diagnostics: [],
  }

  let mod: any
  try {
    mod = await import(pathToFileURL(fp).href)
  } catch (err: any) {
    entry.status = 'failing'
    entry.failureMode = 'runtime_error'
    entry.notes = `Erreur d'import: ${String(err?.message ?? err).slice(0, 120)}`
    return entry
  }

  const ExerciceClass = mod.default
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

  const type = exercice.typeExercice ?? ''
  if (
    type === 'html' ||
    (type !== 'simple' &&
      type !== '' &&
      type !== 'statique' &&
      !exercice.nouvelleVersion)
  ) {
    entry.status = 'skip'
    entry.failureMode = 'interactive_only'
    entry.notes = `typeExercice="${type}" — pas de rendu Typst attendu`
    return entry
  }

  const simpleMode = SIMPLE_MODE_UUIDS.has(id)
  const sup1 = buildSupRecord(exercice, 1)
  const sup2 = buildSupRecord(exercice, 2)
  const sup3 = buildSupRecord(exercice, 3)
  const sup4 = buildSupRecord(exercice, 4)
  const sup5 = buildSupRecord(exercice, 5)

  const v1 = simpleMode ? [undefined] : sampleSupWithFallback(sup1)
  const v2 = simpleMode ? [undefined] : sampleSupWithFallback(sup2)
  const v3 = simpleMode ? [undefined] : sampleSupWithFallback(sup3)
  const v4 = simpleMode ? [undefined] : sampleSupWithFallback(sup4)
  const v5 = simpleMode ? [undefined] : sampleSupWithFallback(sup5)

  const MAX_COMBOS = 27
  const combos: Array<
    [
      number | undefined,
      number | undefined,
      number | undefined,
      number | undefined,
      number | undefined,
    ]
  > = []
  outer: for (const k1 of v1)
    for (const k2 of v2)
      for (const k3 of v3)
        for (const k4 of v4)
          for (const k5 of v5) {
            combos.push([k1, k2, k3, k4, k5])
            if (combos.length >= MAX_COMBOS) break outer
          }

  let firstFailure: {
    mode: FailureMode
    notes: string
    diagnostics: string[]
  } | null = null
  let anyPassing = false
  const testedSigs: string[] = []

  for (const [k1, k2, k3, k4, k5] of combos) {
    if (k1 !== undefined) exercice.sup = sup1[k1]
    if (k2 !== undefined) exercice.sup2 = sup2[k2]
    if (k3 !== undefined) exercice.sup3 = sup3[k3]
    if (k4 !== undefined) exercice.sup4 = sup4[k4]
    if (k5 !== undefined) exercice.sup5 = sup5[k5]

    const sig = `sup=${exercice.sup}:sup2=${exercice.sup2}:sup3=${exercice.sup3}:sup4=${exercice.sup4}:sup5=${exercice.sup5}`
    testedSigs.push(sig)

    try {
      const prevCtx = {
        isHtml: context.isHtml,
        isAmc: context.isAmc,
        isTypst: context.isTypst,
      }
      context.isHtml = true
      context.isAmc = false
      context.isTypst = true
      seedrandom('typst-check', { global: true })
      exercice.numeroExercice = 0
      if (typeof exercice.applyNewSeed === 'function') exercice.applyNewSeed()
      seedrandom(exercice.seed ?? 'typst-check', { global: true })

      if (exercice.typeExercice === 'simple') {
        mathaleaHandleExerciceSimple(exercice, false, 0)
      } else if (typeof exercice.nouvelleVersion === 'function') {
        // comme nouvelleVersionWrapper : sans reinit(), les questions des
        // variantes précédentes s'accumulent dans listeQuestions
        if (typeof exercice.reinit === 'function') exercice.reinit()
        await Promise.resolve(exercice.nouvelleVersion())
      } else if (typeof exercice.nouvelleVersionWrapper === 'function') {
        exercice.nouvelleVersionWrapper(0)
      }
      context.isHtml = prevCtx.isHtml
      context.isAmc = prevCtx.isAmc
      context.isTypst = prevCtx.isTypst
    } catch (err: any) {
      if (!firstFailure)
        firstFailure = {
          mode: 'runtime_error',
          notes: `[${sig}] Runtime: ${String(err?.message ?? err).slice(0, 120)}`,
          diagnostics: [],
        }
      continue
    }

    const fmt = (text: string) =>
      mathaleaFormatExercice(text).replaceAll('{zoomFactor}', '1')
    const questions = (exercice.listeQuestions ?? []).map(fmt)
    const corrections = (exercice.listeCorrections ?? []).map(fmt)
    const consigne = mathaleaFormatExercice(String(exercice.consigne ?? ''))
    const introduction = mathaleaFormatExercice(
      String(exercice.introduction ?? ''),
    )
    const intro = mathaleaFormatExercice(
      [exercice.consigne, exercice.introduction]
        .filter((t: any) => t != null && String(t).length > 0)
        .join('<br>'),
    )
    const introCorrection = mathaleaFormatExercice(
      exercice.consigneCorrection ?? '',
    )
    const numbered =
      questions.length > 1 && exercice.listeAvecNumerotation !== false

    const shortAnswers = questions.map((_: string, i: number) => {
      const answer = getShortAnswer(exercice, i)
      return answer == null ? answer : fmt(answer)
    })
    if (MINIMAL && process.env.MINIMAL_DUMP) {
      appendFileSync(
        process.env.MINIMAL_DUMP,
        [`\n[${r} ${sig}]`]
          .concat(
            corrections.map(
              (c: string, i: number) =>
                `  ${i + 1}. ${minimalCorrection(c, shortAnswers[i])}`,
            ),
          )
          .join('\n') + '\n',
      )
    }

    let typstSource = ''
    try {
      typstSource = buildTypstDocument(
        [
          {
            ref: r,
            intro,
            consigne,
            introduction,
            questions,
            corrections,
            introCorrection,
            numbered,
            shortAnswers,
          },
        ],
        MINIMAL
          ? { ...defaultTypstDocumentOptions, minimalCorrections: true }
          : defaultTypstDocumentOptions,
      )
    } catch (err: any) {
      if (!firstFailure)
        firstFailure = {
          mode: 'compile_error',
          notes: `[${sig}] buildTypstDocument: ${String(err?.message ?? err).slice(0, 120)}`,
          diagnostics: [],
        }
      continue
    }

    if (process.env.DUMP_TYPST) {
      const dumpFile = join(
        process.env.DUMP_TYPST,
        `${r.replaceAll('/', '_')}-${testedSigs.length}.typ`,
      )
      try {
        mkdirSync(process.env.DUMP_TYPST, { recursive: true })
        writeFileSync(dumpFile, typstSource)
      } catch {}
    }

    const unprocessedMath = detectUnprocessedMath(typstSource)
    const htmlRemnants = detectHtmlRemnants(typstSource)

    if (unprocessedMath.length > 0 && !firstFailure) {
      firstFailure = {
        mode: 'unprocessed_math',
        notes: `[${sig}] Maths non converties : ${unprocessedMath.join(' | ')}`,
        diagnostics: unprocessedMath,
      }
    } else if (htmlRemnants.length > 0 && !firstFailure) {
      firstFailure = {
        mode: 'unprocessed_math',
        notes: `[${sig}] HTML non converti : ${htmlRemnants.join(' | ')}`,
        diagnostics: htmlRemnants,
      }
    }

    if (checkLevel < 2) {
      if (!firstFailure) anyPassing = true
      continue
    }

    const { ok, diagnostics, sourceSnippet } = compileTypst(typstSource)
    if (ok && !firstFailure) {
      anyPassing = true
    } else if (!ok) {
      const mode = classifyError(diagnostics)
      if (!firstFailure) {
        const errorLines = diagnostics.slice(0, 3).join(' | ')
        const contextLines =
          sourceSnippet.length > 0 ? '\n' + sourceSnippet.join('\n') : ''
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
    entry.status =
      firstFailure.mode === 'unprocessed_math' ? 'partial' : 'failing'
    entry.failureMode = firstFailure.mode
    entry.notes = firstFailure.notes
    entry.diagnostics = firstFailure.diagnostics
    entry.checkedLevel =
      firstFailure.mode === 'compile_error' ||
      firstFailure.mode === 'missing_figure' ||
      firstFailure.mode === 'missing_package'
        ? 2
        : 1
  } else if (anyPassing) {
    entry.status = 'passing'
    entry.checkedLevel = checkLevel as 1 | 2
  } else {
    entry.status = 'skip'
    entry.notes = 'Aucune variation générée'
    entry.checkedLevel = checkLevel as 1 | 2
  }
  return entry
}

// ─── Message loop ─────────────────────────────────────────────────────────────

parentPort!.postMessage({ type: 'ready' })

parentPort!.on('message', async (msg: CheckRequest) => {
  if (msg.type !== 'check') return
  try {
    const result = await checkExerciseFile(
      msg.filePath,
      msg.uuid,
      msg.ref,
      msg.checkLevel,
      msg.root,
    )
    parentPort!.postMessage({ type: 'result', result })
  } catch (err: any) {
    parentPort!.postMessage({
      type: 'result',
      result: {
        uuid: msg.uuid,
        ref: msg.ref,
        file: msg.filePath.replace(msg.root + '/', ''),
        lastChecked: new Date().toISOString(),
        status: 'failing',
        checkedLevel: 0,
        failureMode: 'runtime_error',
        notes: `Worker error: ${String(err?.message ?? err).slice(0, 200)}`,
        variationsTested: [],
        diagnostics: [],
      } satisfies ExerciseEntry,
    })
  }
})
