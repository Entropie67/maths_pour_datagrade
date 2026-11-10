import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import Latex from '../../../../src/lib/Latex'
import { context } from '../../../../src/modules/context'
import type { LatexFileInfos } from '../../../src/lib/LatexTypes'
import { findUuid } from '../../helpers/filter'

context.isHtml = false
type RowStatus = 'OK' | 'KO' | 'NON_TESTE'

type ReportRow = {
  sourceFile: string
  exercicePath: string
  uuid: string
  status: RowStatus
  detail: string
  debugDetail?: string
}

type LoadedExercise = {
  sourceFile: string
  exercicePath: string
  uuid: string
  exercice: any
}

const DEFAULT_ALEA = 'e906e'
const STATIC_UUID_PREFIXES = [
  'crpe',
  'dnb_',
  'dnbpro_',
  'e3c_',
  'eam_',
  'bac_',
  'sti2d_',
  'evacom_',
  '2nd_',
]

const defaultLatexFileInfos: LatexFileInfos = {
  title: '',
  reference: '',
  subtitle: '',
  style: 'Coopmaths',
  fontOption: 'StandardFont',
  tailleFontOption: 12,
  dysTailleFontOption: 14,
  correctionOption: 'AvecCorrection',
  qrcodeOption: 'SansQrcode',
  typeFiche: 'Fiche',
  durationCanOption: '9 min',
  titleOption: 'SansTitre',
  nbVersions: 1,
  exos: {},
}

beforeAll(() => {
  const proto = SVGElement.prototype as any
  if (!proto.getBBox) {
    proto.getBBox = function () {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
  }

  window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as any

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
})

vi.mock('../../../../src/lib/3d/3d_dynamique/Canvas3DElement', () => ({
  ajouteCanvas3d: vi.fn((args) => `canvas3DElement-mock:${args.length}`),
}))

vi.mock('../../../../src/lib/3d/3d_dynamique/solidesThreeJs', () => ({
  sphericalToCartesian: vi.fn(
    (args) => `sphericalToCartesian-mock:${args.length}`,
  ),
}))

vi.mock('../../../../src/lib/components/version', () => ({
  fetchServerVersion: vi.fn(() => Promise.resolve('1.0.0')),
  checkForServerUpdate: vi.fn(() => Promise.resolve(false)),
}))

vi.mock('../../../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked value'),
}))

const { mathaleaLoadExerciceFromUuid } =
  await import('../../../../src/lib/mathalea')

function hasLualatex() {
  const res = spawnSync('lualatex', ['--version'], { stdio: 'ignore' })
  return res.status === 0
}

function isRelevantExerciseFile(filePath: string) {
  const normalized = filePath.replaceAll('\\\\', '/')
  if (!normalized.startsWith('src/exercices/')) return false
  if (normalized.includes('ressources') || normalized.includes('apps'))
    return false
  const segments = normalized.replace('src/exercices/', '').split('/')
  if (segments.length < 2) return false
  return /\.(ts|js)$/.test(normalized)
}

function normalizeChangedFiles(envValue: string | undefined) {
  if (!envValue) return []
  return envValue
    .split('\n')
    .flatMap((entry) => entry.split(' '))
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function toFilterFromExercisePath(file: string) {
  return file.replace(/\.ts$/, '.').replace(/\.js$/, '.')
}

function isStaticUuid(uuid: string) {
  return STATIC_UUID_PREFIXES.some((prefix) => uuid.startsWith(prefix))
}

function compactLines(value: string, maxLines: number = 18) {
  const lines = value.split('\n').filter(Boolean)
  return lines.slice(Math.max(0, lines.length - maxLines)).join(' | ')
}

function extractLatexDiagnostic(logText: string) {
  const lines = logText.split('\n')
  const importantIndex = lines.findIndex((line) => /^!\s/.test(line))
  if (importantIndex === -1) {
    return (
      compactLines(logText, 18) ||
      'Aucun message LaTeX exploitable dans main.log.'
    )
  }

  const start = Math.max(0, importantIndex - 3)
  const end = Math.min(lines.length, importantIndex + 8)
  return lines
    .slice(start, end)
    .map((line) => line.trim())
    .join(' | ')
}

function shortErrorLabel(detail: string) {
  const knownPatterns = [
    /Misplaced alignment tab character\s*&\./i,
    /Undefined control sequence\./i,
    /Missing \$ inserted\./i,
    /Emergency stop\./i,
    /File `[^']+' not found\./i,
    /LaTeX Error:[^.]+\./i,
  ]

  for (const pattern of knownPatterns) {
    const match = detail.match(pattern)
    if (match && match[0]) return match[0]
  }
  return detail.slice(0, 180)
}

async function compileTexToPdf(texContent: string, label: string) {
  const outputRoot = resolve('updatefile/output/latex_compile_exomodified')
  await fs.mkdir(outputRoot, { recursive: true })

  const safeLabel = label.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  const workDir = await fs.mkdtemp(resolve(outputRoot, `${safeLabel}-`))
  const texFile = resolve(workDir, 'main.tex')
  await fs.writeFile(texFile, texContent, 'utf8')

  return await new Promise<{
    ok: boolean
    detail: string
    debugDetail: string
  }>((resolveResult) => {
    let stdout = ''
    let stderr = ''

    const proc = spawn(
      'lualatex',
      ['--halt-on-error', '-interaction=nonstopmode', 'main.tex'],
      { cwd: workDir },
    )

    proc.stdout.on('data', (chunk) => {
      stdout += String(chunk)
    })

    proc.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })

    proc.on('error', (error) => {
      resolveResult({
        ok: false,
        detail: `Execution lualatex impossible: ${String(error)}`,
        debugDetail: `Execution lualatex impossible: ${String(error)}`,
      })
    })

    proc.on('close', async (code) => {
      if (code === 0) {
        resolveResult({
          ok: true,
          detail: `Compilation OK (${workDir}/main.pdf)`,
          debugDetail: `Compilation OK (${workDir}/main.pdf)`,
        })
        return
      }

      let latexDiagnostic = ''
      try {
        const logPath = resolve(workDir, 'main.log')
        const logContent = await fs.readFile(logPath, 'utf8')
        latexDiagnostic = extractLatexDiagnostic(logContent)
      } catch {
        latexDiagnostic = ''
      }

      const excerpt = compactLines(`${stdout}\n${stderr}`)
      const debugDetail =
        latexDiagnostic || excerpt || 'Aucune trace exploitable.'
      resolveResult({
        ok: false,
        detail: `lualatex exit ${code}. ${shortErrorLabel(debugDetail)}`,
        debugDetail,
      })
    })
  })
}

async function loadExerciseForLatex(uuid: string) {
  const exercice = await mathaleaLoadExerciceFromUuid(uuid)

  if (!exercice) {
    return {
      status: 'NON_TESTE' as const,
      detail: 'Exercice introuvable.',
    }
  }

  if (isStaticUuid(uuid) || exercice.typeExercice === 'statique') {
    return {
      status: 'NON_TESTE' as const,
      detail: 'Exercice statique: non teste.',
    }
  }

  if (exercice.typeExercice === 'html') {
    return {
      status: 'NON_TESTE' as const,
      detail: 'Exercice HTML uniquement: export LaTeX non pertinent.',
    }
  }

  if ('pasDeVersionLatex' in exercice && exercice.pasDeVersionLatex) {
    return {
      status: 'NON_TESTE' as const,
      detail: 'Exercice marque pasDeVersionLatex: export LaTeX non pertinent.',
    }
  }

  exercice.uuid = uuid
  exercice.seed = DEFAULT_ALEA
  exercice.interactif = false
  exercice.numeroExercice = 1

  return {
    status: 'OK' as const,
    exercice,
  }
}

async function resolveReportRowsFromChangedFiles(changedFiles: string[]) {
  const relevantFiles = [
    ...new Set(changedFiles.filter(isRelevantExerciseFile)),
  ]
  const rows: ReportRow[] = []

  for (const sourceFile of relevantFiles) {
    const exercicePath = sourceFile.replace(/^src\/exercices\//, '')
    const filter = toFilterFromExercisePath(exercicePath)
    const uuidMatches = await findUuid(filter)

    if (uuidMatches.length === 0) {
      rows.push({
        sourceFile,
        exercicePath,
        uuid: '-',
        status: 'NON_TESTE',
        detail: 'Aucun UUID associe (mapping non resolu).',
      })
      continue
    }

    const uniqueMatches = [
      ...new Map(
        uuidMatches.map(([uuid, exoPath]) => [uuid, exoPath]),
      ).entries(),
    ]

    for (const [uuid, exoPath] of uniqueMatches) {
      rows.push({
        sourceFile,
        exercicePath: exoPath,
        uuid,
        status: 'NON_TESTE',
        detail: 'En attente.',
      })
    }
  }

  return rows
}

function printFinalTable(rows: ReportRow[]) {
  console.log('')
  console.log('=============================================================')
  console.log('[SUMMARY] Compilation LaTeX ExosModified (sans UI)')
  console.log('=============================================================')
  console.log('| Exercice | UUID | Statut | Detail |')
  console.log('| --- | --- | --- | --- |')

  for (const row of rows) {
    console.log(
      `| ${row.exercicePath} | ${row.uuid} | ${row.status} | ${row.detail.replace(/\|/g, '/')} |`,
    )
  }

  const okCount = rows.filter((row) => row.status === 'OK').length
  const koCount = rows.filter((row) => row.status === 'KO').length
  const skippedCount = rows.filter((row) => row.status === 'NON_TESTE').length

  console.log('-------------------------------------------------------------')
  console.log(`OK=${okCount} KO=${koCount} NON_TESTE=${skippedCount}`)
  console.log('=============================================================')

  const koRows = rows.filter((row) => row.status === 'KO')
  if (koRows.length > 0) {
    console.log('')
    console.log('[DETAILS_KO]')
    console.log('=============================================================')
    for (const row of koRows) {
      console.log(`- ${row.exercicePath} (uuid=${row.uuid})`)
      console.log(
        `  ${String(row.debugDetail ?? row.detail)
          .replace(/\|/g, '/')
          .slice(0, 1200)}`,
      )
    }
    console.log('=============================================================')
  }
}

describe('latex compile exomodified', () => {
  test('global puis detail par exercice en cas d echec', async () => {
    if (!hasLualatex()) {
      console.log('[INFO] lualatex introuvable: test saute.')
      expect(true).toBe(true)
      return
    }

    const changedFiles = normalizeChangedFiles(process.env.CHANGED_FILES)
    const rows = await resolveReportRowsFromChangedFiles(changedFiles)

    if (rows.length === 0) {
      console.log('[INFO] Aucun exercice modifie detecte.')
      expect(true).toBe(true)
      return
    }

    const loadedExercises: LoadedExercise[] = []

    for (const row of rows) {
      if (row.uuid === '-') {
        continue
      }

      const loaded = await loadExerciseForLatex(row.uuid)
      if (loaded.status !== 'OK') {
        row.status = 'NON_TESTE'
        row.detail = loaded.detail
        continue
      }

      loadedExercises.push({
        sourceFile: row.sourceFile,
        exercicePath: row.exercicePath,
        uuid: row.uuid,
        exercice: loaded.exercice,
      })
    }

    if (loadedExercises.length === 0) {
      printFinalTable(rows)
      expect(rows.some((row) => row.status === 'KO')).toBe(false)
      return
    }

    let globalOk = false
    let globalDetail = ''

    try {
      const latex = new Latex()
      latex.addExercices(loadedExercises.map((entry) => entry.exercice))
      const file = await latex.getFile({ ...defaultLatexFileInfos })
      const compileGlobal = await compileTexToPdf(
        file.latexWithPreamble,
        'global_all_modified',
      )
      globalOk = compileGlobal.ok
      globalDetail = compileGlobal.detail
    } catch (error) {
      globalOk = false
      globalDetail = `Generation globale KO: ${String(error)}`
    }

    if (globalOk) {
      for (const row of rows) {
        if (row.uuid !== '-' && row.status !== 'NON_TESTE') {
          row.status = 'OK'
          row.detail = `Global OK. ${globalDetail}`
        }
      }
    } else {
      for (const entry of loadedExercises) {
        const row = rows.find((candidate) => candidate.uuid === entry.uuid)
        if (!row) continue

        try {
          const latex = new Latex()
          latex.addExercices([entry.exercice])
          const file = await latex.getFile({ ...defaultLatexFileInfos })
          const compileSingle = await compileTexToPdf(
            file.latexWithPreamble,
            `single_${entry.exercicePath}`,
          )

          row.status = compileSingle.ok ? 'OK' : 'KO'
          row.detail = compileSingle.ok
            ? 'Compilation unitaire OK apres echec global.'
            : `Compilation unitaire KO apres echec global. ${compileSingle.detail}`
          row.debugDetail = compileSingle.debugDetail
        } catch (error) {
          row.status = 'KO'
          row.detail = `Generation unitaire KO apres echec global: ${String(error)}`
          row.debugDetail = `Generation unitaire KO apres echec global: ${String(error)}`
        }
      }

      const untouchedRows = rows.filter(
        (row) => row.uuid !== '-' && row.status === 'NON_TESTE',
      )
      for (const row of untouchedRows) {
        row.detail = `Non teste. Echec global initial: ${globalDetail}`
      }
    }

    printFinalTable(rows)

    const failingRows = rows.filter((row) => row.status === 'KO')
    if (failingRows.length > 0) {
      throw new Error(
        `Compilation LaTeX en erreur pour ${failingRows.length} exercice(s).`,
      )
    }

    expect(true).toBe(true)
  })
})
