import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import Latex, {
  getLogoCanUrls,
  makeImageFilesUrls,
} from '../../../../src/lib/Latex'
import { LOGO_CAN_TEX_FILE } from '../../../../src/lib/latex/preambuleTex'
import type { LatexFileInfos } from '../../../../src/lib/LatexTypes'
import { shuffle } from '../../../../src/lib/outils/arrayOutils'
import type { IExercice, IExerciceStatique } from '../../../../src/lib/types'
import { context } from '../../../../src/modules/context'
import { findStatic, findUuid, loadStaticRef } from '../../helpers/filter'
import { createIssue } from '../../helpers/issue'
import { getFileLogger, log as lg, logError as lgE } from '../../helpers/log'

context.isHtml = false

type ExportStatus = 'OK' | 'KO' | 'NON_TESTE'
type ExportStyle =
  'ProfMaquette' | 'Can' | 'Classique' | 'Coopmaths' | 'ProfMaquetteQrcode'

type ExportRow = {
  uuid: string
  exercicePath: string
  style: ExportStyle
  status: ExportStatus
  detail: string
  debugDetail?: string
  durationMs?: number
}

const logPDF = getFileLogger('exportPDF', { append: true })
const DEFAULT_ALEA = 'e906e'
const configuredPdfCompileTimeoutMs = Number(process.env.PDF_COMPILE_TIMEOUT_MS)
const PDF_COMPILE_TIMEOUT_MS =
  Number.isFinite(configuredPdfCompileTimeoutMs) &&
  configuredPdfCompileTimeoutMs > 0
    ? configuredPdfCompileTimeoutMs
    : 90_000
const configuredPdfSlowCompileMs = Number(process.env.PDF_SLOW_COMPILE_MS)
const PDF_SLOW_COMPILE_MS =
  Number.isFinite(configuredPdfSlowCompileMs) && configuredPdfSlowCompileMs > 0
    ? configuredPdfSlowCompileMs
    : 10_000
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

const defaultLatexFileInfos: Omit<LatexFileInfos, 'style'> = {
  title: '',
  reference: '',
  subtitle: '',
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

function log(...args: unknown[]) {
  lg(args)
  logPDF(args)
}

function logError(...args: unknown[]) {
  lgE(args)
  logPDF(args)
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

vi.mock('apigeom', async (original) => {
  const real = await original()
  ;(globalThis as any).APP_VERSION = 'test'
  return real
})

const { mathaleaLoadExerciceFromUuid } =
  await import('../../../../src/lib/mathalea')

function hasLualatex() {
  const res = spawnSync('lualatex', ['--version'], { stdio: 'ignore' })
  return res.status === 0
}

function isStaticUuid(uuid: string) {
  return STATIC_UUID_PREFIXES.some((prefix) => uuid.startsWith(prefix))
}

function normalizeChangedFiles(envValue: string | undefined) {
  if (!envValue) return []
  return envValue
    .split('\n')
    .flatMap((entry) => entry.split(' '))
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function isRelevantExerciseFile(filePath: string) {
  const normalized = filePath.replaceAll('\\', '/')
  if (!normalized.startsWith('src/exercices/')) return false
  if (normalized.includes('ressources') || normalized.includes('apps')) {
    return false
  }
  const segments = normalized.replace('src/exercices/', '').split('/')
  if (segments.length < 2) return false
  return /\.(ts|js)$/.test(normalized)
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

function formatDuration(durationMs: number | undefined) {
  if (durationMs == null) return '-'
  return `${(durationMs / 1000).toFixed(1)}s`
}

function needsStaticLookup(filter: string) {
  return /(dnb|dnbpro|crpe|sti2d|stl|bac|e3c|eam|evacom|2nd)/.test(filter)
}

function toFilterFromExercisePath(file: string) {
  return file.replace(/\.ts$/, '.').replace(/\.js$/, '.')
}

function getExerciseId(exercicePath: string, uuid: string) {
  if (exercicePath === uuid) return uuid
  const withoutExt = exercicePath.replace(/\.[^.]+$/, '')
  const parts = withoutExt.split('/')
  return parts[parts.length - 1] || uuid
}

function getStartedPath(exercicePath: string, uuid: string) {
  if (exercicePath !== uuid) {
    return exercicePath.split('/')[0] || 'test'
  }
  const [prefix] = uuid.split('_')
  return prefix || 'test'
}

function buildExerciseUrl(uuid: string, exercicePath: string) {
  const port =
    process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')
  const idPath =
    exercicePath === uuid ? uuid : exercicePath.replace(/\.[^.]+$/, '')
  return `http://localhost:${port}/alea/?uuid=${uuid}&id=${idPath}&alea=${DEFAULT_ALEA}&v=latex&testCI`
}

function getStaticExerciceByUuid(
  root: Record<string, unknown>,
  targetUuid: string,
): Record<string, unknown> | null {
  if (root.uuid === targetUuid) return root

  for (const value of Object.values(root)) {
    if (value && typeof value === 'object') {
      const found = getStaticExerciceByUuid(
        value as Record<string, unknown>,
        targetUuid,
      )
      if (found) return found
    }
  }

  return null
}

async function readFirstExistingText(paths: string[]) {
  for (const path of paths) {
    try {
      return {
        content: await fs.readFile(path, 'utf8'),
        path,
      }
    } catch {
      // On essaie le chemin suivant: les statiques peuvent venir du dépôt
      // local ou du clone CI public/static.
    }
  }
  return {
    content: '',
    path: undefined,
  }
}

function getStaticSerie(uuid: string) {
  return uuid.split('_')[0]
}

function getStaticExam(uuid: string) {
  if (uuid.startsWith('crpe')) return 'CRPE'
  if (uuid.startsWith('dnb_')) return 'DNB'
  if (uuid.startsWith('dnbpro_')) return 'DNBPRO'
  if (uuid.startsWith('e3c_')) return 'E3C'
  if (uuid.startsWith('eam_')) return 'EAM'
  if (uuid.startsWith('bac_')) return 'BAC'
  if (uuid.startsWith('sti2d_')) return 'STI2D'
  if (uuid.startsWith('stl_')) return 'STL'
  if (uuid.startsWith('evacom_')) return 'EVACOM'
  if (uuid.startsWith('2nd_')) return '2ND'
  return ''
}

async function loadStaticExercise(uuid: string) {
  const allStaticReferentiels = loadStaticRef()
  const infos = allStaticReferentiels
    ? getStaticExerciceByUuid(
        allStaticReferentiels as Record<string, unknown>,
        uuid,
      )
    : null

  if (!infos) {
    return {
      status: 'NON_TESTE' as const,
      detail: 'Informations statiques introuvables.',
    }
  }

  const annee = infos.annee
  const serie = getStaticSerie(uuid)
  const texCandidates =
    typeof annee === 'string'
      ? [
          resolve(
            process.cwd(),
            'public',
            'static',
            serie,
            annee,
            'tex',
            `${uuid}.tex`,
          ),
          resolve(
            process.cwd(),
            'src',
            'exercicesStatiques',
            serie,
            annee,
            'tex',
            `${uuid}.tex`,
          ),
        ]
      : []
  const texCorrectionCandidates =
    typeof annee === 'string'
      ? [
          resolve(
            process.cwd(),
            'public',
            'static',
            serie,
            annee,
            'tex',
            `${uuid}_cor.tex`,
          ),
          resolve(
            process.cwd(),
            'src',
            'exercicesStatiques',
            serie,
            annee,
            'tex',
            `${uuid}_cor.tex`,
          ),
        ]
      : []

  const enonce = await readFirstExistingText(texCandidates)
  if (!enonce.path) {
    return {
      status: 'NON_TESTE' as const,
      detail: `Fichier LaTeX statique introuvable: ${texCandidates.join(' ou ')}`,
    }
  }

  const correction = await readFirstExistingText(texCorrectionCandidates)

  return {
    status: 'OK' as const,
    exercice: {
      typeExercice: 'statique',
      uuid,
      content: enonce.content,
      contentCorr: correction.content,
      annee,
      lieu: infos.lieu,
      mois: infos.mois,
      numeroInitial: infos.numeroInitial,
      examen: getStaticExam(uuid),
    } as IExerciceStatique,
  }
}

async function loadExercise(uuid: string) {
  if (isStaticUuid(uuid)) {
    return await loadStaticExercise(uuid)
  }

  const exercice = await mathaleaLoadExerciceFromUuid(uuid)

  if (!exercice) {
    return {
      status: 'NON_TESTE' as const,
      detail: 'Exercice introuvable.',
    }
  }

  if ('pasDeVersionLatex' in exercice && exercice.pasDeVersionLatex) {
    return {
      status: 'NON_TESTE' as const,
      detail: 'Exercice marque pasDeVersionLatex: export LaTeX non pertinent.',
    }
  }

  ;(exercice as IExercice | IExerciceStatique).uuid = uuid

  if ('seed' in exercice) {
    exercice.seed = DEFAULT_ALEA
    exercice.interactif = false
    exercice.numeroExercice = 1
  }

  return {
    status: 'OK' as const,
    exercice: exercice as IExercice | IExerciceStatique,
  }
}

async function resolveTargets() {
  if (process.env.NIV) {
    const filter = process.env.NIV.replaceAll(' ', '')
    const allTargets = needsStaticLookup(filter)
      ? await findStatic(filter)
      : await findUuid(filter)
    return shuffle(allTargets).slice(0, 50) // On limite à 50 exercices pour éviter de saturer le CI sur des filtres trop larges.
  }

  const changedFiles = normalizeChangedFiles(process.env.CHANGED_FILES)
  const relevantFiles = [
    ...new Set(changedFiles.filter(isRelevantExerciseFile)),
  ]

  if (relevantFiles.length > 0) {
    const entries: Awaited<ReturnType<typeof findUuid>>[] = []
    for (const sourceFile of relevantFiles) {
      const exercicePath = sourceFile.replace(/^src\/exercices\//, '')
      const filter = toFilterFromExercisePath(exercicePath)
      entries.push(await findUuid(filter))
    }
    return entries.flat()
  }
  if (process.env.CI === 'true') {
    return []
  }
  // En local, si pas de fichier modifié identifié, on teste une sélection de cibles par défaut pour assurer une couverture régulière sur les exercices populaires et les différents types d'exercices.
  const defaults = ['can', '3e', '4e', '5e', '6e', '2e', '1e']
  const results: Awaited<ReturnType<typeof findUuid>>[] = []
  for (const filter of defaults) {
    results.push(await findUuid(filter))
  }
  return results.flat() // Si on lance le test en local sans cible spécifique, on teste tous les exercices (ça dure 5h sur une machine puissante). Plus de
}

async function materializeAssets(
  workDir: string,
  exercices: (IExercice | IExerciceStatique)[],
) {
  const urls = [...new Set(makeImageFilesUrls(exercices))]

  for (const url of urls) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Impossible de telecharger ${url} (${response.status})`)
    }
    const arrayBuffer = await response.arrayBuffer()
    await fs.writeFile(
      resolve(workDir, basename(new URL(url).pathname)),
      Buffer.from(arrayBuffer),
    )
  }
}

/**
 * La page de garde du style `Can` référence le logo `logoCan.png` : le `.tex`
 * le cherche à côté de lui, comme dans le zip téléchargé par l'utilisateur.
 */
async function materializeLogoCan(workDir: string, latexCode: string) {
  if (getLogoCanUrls(latexCode).length === 0) return
  await fs.copyFile(
    resolve(__dirname, '../../../../public/images', LOGO_CAN_TEX_FILE),
    resolve(workDir, LOGO_CAN_TEX_FILE),
  )
}

async function compileTexToPdf(
  texContent: string,
  workDir: string,
  outputBaseName: string,
) {
  const texFile = resolve(workDir, 'main.tex')
  await fs.writeFile(texFile, texContent, 'utf8')
  const startedAt = Date.now()

  return await new Promise<{
    ok: boolean
    detail: string
    debugDetail: string
    durationMs: number
  }>((resolveResult) => {
    let stdout = ''
    let stderr = ''
    let timedOut = false
    let settled = false
    let killTimeout: ReturnType<typeof setTimeout> | undefined

    const proc = spawn(
      'lualatex',
      ['--halt-on-error', '-interaction=nonstopmode', 'main.tex'],
      { cwd: workDir },
    )

    const timeout = setTimeout(() => {
      timedOut = true
      proc.kill('SIGTERM')
      killTimeout = setTimeout(() => {
        if (!settled) proc.kill('SIGKILL')
      }, 5_000)
    }, PDF_COMPILE_TIMEOUT_MS)

    proc.stdout.on('data', (chunk) => {
      stdout += String(chunk)
    })

    proc.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })

    proc.on('error', (error) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      if (killTimeout) clearTimeout(killTimeout)
      resolveResult({
        ok: false,
        detail: `Execution lualatex impossible: ${String(error)}`,
        debugDetail: `Execution lualatex impossible: ${String(error)}`,
        durationMs: Date.now() - startedAt,
      })
    })

    proc.on('close', async (code) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      if (killTimeout) clearTimeout(killTimeout)
      const durationMs = Date.now() - startedAt
      if (timedOut) {
        const detail = `Timeout lualatex apres ${formatDuration(durationMs)} (limite ${formatDuration(PDF_COMPILE_TIMEOUT_MS)})`
        resolveResult({
          ok: false,
          detail,
          debugDetail: detail,
          durationMs,
        })
        return
      }

      if (code === 0) {
        const pdfSource = resolve(workDir, 'main.pdf')
        const pdfTarget = resolve(workDir, `${outputBaseName}.pdf`)
        await fs.copyFile(pdfSource, pdfTarget)
        resolveResult({
          ok: true,
          detail: `Compilation OK en ${formatDuration(durationMs)} (${pdfTarget})`,
          debugDetail: `Compilation OK en ${formatDuration(durationMs)} (${pdfTarget})`,
          durationMs,
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
        detail: `lualatex exit ${code} en ${formatDuration(durationMs)}. ${shortErrorLabel(debugDetail)}`,
        debugDetail,
        durationMs,
      })
    })
  })
}

function printSummary(rows: ExportRow[]) {
  const failingRows = rows.filter((row) => row.status === 'KO')
  const slowRows = rows
    .filter((row) => row.durationMs != null)
    .sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0))
    .slice(0, 20)
  const totalRows = rows.length

  console.log('')
  console.log('=============================================================')
  console.log('[SUMMARY] PDF exports KO uniquement')
  console.log('=============================================================')
  console.log('| Exercice | UUID | Style | Cause |')
  console.log('| --- | --- | --- | --- |')

  for (const row of failingRows) {
    const cause = (row.debugDetail ?? row.detail)
      .replace(/\|/g, '/')
      .slice(0, 1200)
    console.log(
      `| ${row.exercicePath} | ${row.uuid} | ${row.style} | ${cause} |`,
    )
  }

  console.log(
    `| TOTAL | - | - | ${failingRows.length}/${totalRows} (echecs/total) |`,
  )

  console.log('-------------------------------------------------------------')
  console.log(`ECHECS=${failingRows.length} TOTAL=${totalRows}`)
  console.log('=============================================================')

  console.log('')
  console.log('=============================================================')
  console.log('[SUMMARY] PDF exports les plus lents')
  console.log('=============================================================')
  console.log('| Duree | Exercice | UUID | Style | Statut |')
  console.log('| --- | --- | --- | --- | --- |')

  for (const row of slowRows) {
    console.log(
      `| ${formatDuration(row.durationMs)} | ${row.exercicePath} | ${row.uuid} | ${row.style} | ${row.status} |`,
    )
  }

  console.log('=============================================================')
}

describe('pdfexports sans playwright', () => {
  test('genere puis compile les exports latex attendus', async () => {
    if (
      process.env.NIV == null &&
      process.env.CHANGED_FILES == null &&
      process.env.CI !== 'true'
    ) {
      console.log(
        '[INFO] Aucun filtre NIV ou CHANGED_FILES fourni, et pas en CI: test saute.',
      )
      console.log(
        '[INFO] Pour tester les exports PDF, vous pouvez lancer le test avec un filtre NIV ou CHANGED_FILES, par exemple:',
      )
      console.log('  NIV=can pnpm test:e2e:pdfexports')
      console.log(
        '  CHANGED_FILES="src/exercices/3e/arithmetique/pgcd.ts" pnpm test:e2e:pdfexports',
      )
      console.log(
        '[INFO] En CI, le test est automatiquement saute si aucun fichier modifie n est detecte.',
      )
      console.log(
        '[INFO] Pour tester tous les exercices en local, vous pouvez lancer le test avec NIV=all (cela peut durer plusieurs heures (5h max)):',
      )
      console.log(
        '[INFO] Pour limiter la compilation à des styles spécifiques, vous pouvez utiliser la variable d environnement STYLES, par exemple:',
      )
      console.log('  STYLES="ProfMaquette,Can" pnpm test:e2e:pdfexports')
      console.log(
        '  Les styles disponibles sont: ProfMaquette, ProfMaquetteQrcode, Can, Classique, Coopmaths',
      )
      expect(true).toBe(true)
      return
    }

    log(`Démarrage du test PDF Exports - ${new Date().toLocaleString()}`)
    if (!hasLualatex()) {
      console.log('[INFO] lualatex introuvable: test saute.')
      expect(true).toBe(true)
      return
    }
    const stylesForExport = process.env.STYLES
      ? process.env.STYLES.split(',').map((s) => s.trim())
      : process.env.CI === 'true'
        ? ['Coopmaths']
        : [
            'ProfMaquette',
            'ProfMaquetteQrcode',
            'Can',
            'Classique',
            'Coopmaths',
          ]

    const targets = await resolveTargets()

    if (targets.length === 0) {
      console.log('[INFO] Aucun exercice cible detecte.')
      expect(true).toBe(true)
      return
    }

    const uniqueTargets = [
      ...new Map(
        targets.map(([uuid, exercicePath]) => [uuid, exercicePath]),
      ).entries(),
    ]

    const rows: ExportRow[] = []

    for (const [uuid, exercicePath] of uniqueTargets) {
      const loaded = await loadExercise(uuid)
      log(
        `Processing ${(exercicePath.split('/').pop() ?? '').replace(
          /\.[^/.]+$/,
          '',
        )} (UUID: ${uuid}) -> ${loaded.status}`,
      )
      if (loaded.status !== 'OK') {
        rows.push({
          uuid,
          exercicePath,
          style: 'ProfMaquette',
          status: 'NON_TESTE',
          detail: loaded.detail,
        })
        continue
      }

      const styles: ExportStyle[] =
        isStaticUuid(uuid) || loaded.exercice.typeExercice === 'statique'
          ? ['ProfMaquette']
          : (stylesForExport as ExportStyle[])

      for (const style of styles) {
        const startedPath = getStartedPath(exercicePath, uuid)
        const exerciseId = getExerciseId(exercicePath, uuid)
        const outputRoot = resolve('updatefile/output', startedPath)
        await fs.mkdir(outputRoot, { recursive: true })

        const safeLabel =
          `${exerciseId}${style}${exerciseId === uuid ? '_' : `_${uuid}_`}`
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .slice(0, 120)
        const workDir = await fs.mkdtemp(resolve(outputRoot, `${safeLabel}-`))

        try {
          const latex = new Latex()
          latex.addExercices([loaded.exercice])
          const latexFile = await latex.getFile({
            ...defaultLatexFileInfos,
            style,
          })

          await materializeAssets(workDir, [loaded.exercice])
          await materializeLogoCan(workDir, latexFile.latexWithPreamble)
          const compileResult = await compileTexToPdf(
            latexFile.latexWithPreamble,
            workDir,
            safeLabel,
          )

          if (!compileResult.ok) {
            logError(
              `Compilation KO pour ${exercicePath} (style ${style}): ${compileResult.detail}`,
            )
            await createIssue(
              buildExerciseUrl(uuid, exercicePath),
              [compileResult.debugDetail],
              ['pdfexport'],
              logError,
            )
          } else if (compileResult.durationMs >= PDF_SLOW_COMPILE_MS) {
            log(
              `Compilation lente pour ${exercicePath} (style ${style}): ${formatDuration(compileResult.durationMs)}`,
            )
          }

          rows.push({
            uuid,
            exercicePath,
            style,
            status: compileResult.ok ? 'OK' : 'KO',
            detail: compileResult.detail,
            debugDetail: compileResult.debugDetail,
            durationMs: compileResult.durationMs,
          })
        } catch (error) {
          const detail = `Generation ou compilation impossible: ${String(error)}`
          logError(detail)
          rows.push({
            uuid,
            exercicePath,
            style,
            status: 'KO',
            detail,
            debugDetail: detail,
          })
        }
      }
    }

    printSummary(rows)

    const failingRows = rows.filter((row) => row.status === 'KO')
    if (failingRows.length > 0) {
      throw new Error(
        `Compilation PDF en erreur pour ${failingRows.length} export(s).`,
      )
    }

    expect(true).toBe(true)
  })
})
