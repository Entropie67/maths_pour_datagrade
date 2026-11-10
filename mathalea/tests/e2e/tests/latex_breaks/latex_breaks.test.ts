import { beforeAll, describe, expect, test, vi } from 'vitest'
import uuidToUrlCH from '../../../../src/json/uuidsToUrlCH.json'
import uuidToUrlFR from '../../../../src/json/uuidsToUrlFR.json'
import Latex from '../../../../src/lib/Latex'
import type {
  LatexFileInfos,
  contentsType,
} from '../../../../src/lib/LatexTypes'
import type { IExercice } from '../../../../src/lib/types'
import { context } from '../../../../src/modules/context'
import {
  buildParamScenarios,
  resolveParamTestLevel,
  type ParamScenario,
} from '../../../integration/helpers/parameterScenarios'
import { findStatic, findUuid } from '../../helpers/filter'

context.isHtml = false

type LintStatus = 'OK' | 'KO' | 'NON_TESTE'
type LatexFragmentName = 'content' | 'contentCorr'

type LintIssue = {
  fragment: LatexFragmentName
  line: number
  rule:
    | 'four-consecutive-backslashes'
    | 'line-starts-with-double-backslash'
    | 'four-consecutive-backslashes-after-tikzpicture'
  excerpt: string
}

type LintRow = {
  uuid: string
  exercicePath: string
  scenario: string
  scenarioOverrides: ParamScenario['overrides']
  status: LintStatus
  detail: string
  issues?: LintIssue[]
}

type LoadExerciseForLatexResult =
  | {
      status: 'OK'
      exercice: IExercice
    }
  | {
      status: 'NON_TESTE'
      detail: string
    }

const DEFAULT_ALEA = 'e906e'
const paramLevel = resolveParamTestLevel(process.env.TEST_PARAM)
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

function createMatchMedia(): typeof window.matchMedia {
  return (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
}

beforeAll(() => {
  if (!('getBBox' in SVGElement.prototype)) {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => new DOMRect(0, 0, 0, 0),
    })
  }

  window.matchMedia = createMatchMedia()

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
  Object.defineProperty(globalThis, 'APP_VERSION', {
    configurable: true,
    value: 'test',
  })
  return real
})

const { mathaleaLoadExerciceFromUuid } =
  await import('../../../../src/lib/mathalea')

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

function needsStaticLookup(filter: string) {
  return /(dnb|crpe|sti2d|bac|e3c)/.test(filter)
}

function findUuidByExactPath(filter: string) {
  const normalizedFilter = filter
    .replaceAll('\\', '/')
    .replace(/^src\/exercices\//, '')
    .replace(/\.(ts|js)$/, '')

  const uuidToUrl = {
    ...uuidToUrlFR,
    ...uuidToUrlCH,
  } satisfies Record<string, string>

  return Object.entries(uuidToUrl).filter(([, exercicePath]) => {
    const withoutExtension = exercicePath.replace(/\.(ts|js)$/, '')
    const basename = withoutExtension.split('/').pop()
    return (
      withoutExtension === normalizedFilter || basename === normalizedFilter
    )
  })
}

function toFilterFromExercisePath(file: string) {
  return file.replace(/\.(ts|js)$/, '')
}

async function findUuidWithExactFallback(filter: string) {
  const prefixMatches = await findUuid(filter)
  if (prefixMatches.length > 0) return prefixMatches
  return findUuidByExactPath(filter)
}

async function resolveTargets() {
  if (process.env.NIV) {
    const filter = process.env.NIV.replaceAll(' ', '')
    return needsStaticLookup(filter)
      ? await findStatic(filter)
      : await findUuidWithExactFallback(filter)
  }

  const changedFiles = normalizeChangedFiles(process.env.CHANGED_FILES)
  const relevantFiles = [
    ...new Set(changedFiles.filter(isRelevantExerciseFile)),
  ]

  if (relevantFiles.length === 0) return []

  const entries = await Promise.all(
    relevantFiles.map(async (sourceFile) => {
      const exercicePath = sourceFile.replace(/^src\/exercices\//, '')
      const filter = toFilterFromExercisePath(exercicePath)
      const exactMatches = findUuidByExactPath(filter)
      return exactMatches.length > 0
        ? exactMatches
        : await findUuidWithExactFallback(filter)
    }),
  )
  return entries.flat()
}

async function loadExerciseForLatex(
  uuid: string,
): Promise<LoadExerciseForLatexResult> {
  const exercice = await mathaleaLoadExerciceFromUuid(uuid)

  if (!exercice) {
    return {
      status: 'NON_TESTE',
      detail: 'Exercice introuvable.',
    }
  }

  exercice.uuid = uuid

  if (isStaticUuid(uuid) || exercice.typeExercice === 'statique') {
    return {
      status: 'NON_TESTE',
      detail: 'Exercice statique: non teste.',
    }
  }

  if (exercice.typeExercice === 'html') {
    return {
      status: 'NON_TESTE',
      detail: 'Exercice HTML uniquement: export LaTeX non pertinent.',
    }
  }

  if ('seed' in exercice) {
    exercice.seed = DEFAULT_ALEA
    exercice.interactif = false
    exercice.numeroExercice = 1
  }

  return {
    status: 'OK',
    exercice,
  }
}

function shortenLine(line: string) {
  return line.trim().replace(/\s+/g, ' ').slice(0, 100)
}

function lintLatexFragment(
  fragment: LatexFragmentName,
  value: string,
): LintIssue[] {
  const issues: LintIssue[] = []
  const lines = value.split('\n')

  for (const [index, line] of lines.entries()) {
    if (/\\\\\\\\/.test(line)) {
      if (/\\end{tikzpicture}\\\\\\\\/.test(line)) {
        issues.push({
          fragment,
          line: index + 1,
          rule: 'four-consecutive-backslashes-after-tikzpicture',
          excerpt: shortenLine(line),
        })
      } else {
        issues.push({
          fragment,
          line: index + 1,
          rule: 'four-consecutive-backslashes',
          excerpt: shortenLine(line),
        })
      }
    }

    if (/^[ \t]*\\\\/.test(line)) {
      issues.push({
        fragment,
        line: index + 1,
        rule: 'line-starts-with-double-backslash',
        excerpt: shortenLine(line),
      })
    }
  }

  return issues
}

function lintLatexContents(contents: contentsType) {
  return [
    ...lintLatexFragment('content', contents.content),
    ...lintLatexFragment('contentCorr', contents.contentCorr),
  ]
}

function toUrlParamName(paramName: keyof ParamScenario['overrides']) {
  switch (paramName) {
    case 'sup':
      return 's'
    case 'sup2':
      return 's2'
    case 'sup3':
      return 's3'
    case 'sup4':
      return 's4'
    case 'sup5':
      return 's5'
  }
}

function buildExerciseUrl(
  uuid: string,
  exercicePath: string,
  scenarioOverrides: ParamScenario['overrides'],
) {
  const port =
    process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')
  const idPath =
    exercicePath === uuid ? uuid : exercicePath.replace(/\.[^.]+$/, '')
  const url = new URL(`http://localhost:${port}/alea/`)
  url.searchParams.append('uuid', uuid)
  url.searchParams.append('id', idPath)
  url.searchParams.append('alea', DEFAULT_ALEA)

  for (const [paramName, value] of Object.entries(scenarioOverrides)) {
    if (value == null) continue
    url.searchParams.append(
      toUrlParamName(paramName as keyof ParamScenario['overrides']),
      String(value),
    )
  }

  url.searchParams.append('v', 'latex')

  return url.toString()
}

function describeFragment(fragment: LatexFragmentName) {
  if (fragment === 'content') {
    return {
      label: 'Énoncé',
      locationLabel: "l'énoncé",
      sourceHint: 'texte, this.question ou listeQuestions',
      exampleVariable: 'texte',
    }
  }

  return {
    label: 'Correction',
    locationLabel: 'la correction',
    sourceHint: 'texteCorr, this.correction ou listeCorrections',
    exampleVariable: 'texteCorr',
  }
}

function describeRule(rule: LintIssue['rule'], fragment: LatexFragmentName) {
  const { sourceHint, exampleVariable } = describeFragment(fragment)

  if (rule === 'four-consecutive-backslashes-after-tikzpicture') {
    return {
      cause: 'Un <br> a été mis derrière un mathalea2d().',
      action:
        'Pour ajouter un espace après la figure, on ne met pas de <br>, on modifie ymin ou mieux : on utilise fixeBordures et on modifie rymin.',
      example: `${exampleVariable} += \`\\end{tikzpicture}<br>ligne 2\``,
    }
  }

  if (rule === 'four-consecutive-backslashes') {
    return {
      cause:
        'deux retours à la ligne LaTeX ont été produits, souvent par deux <br> trop proches.',
      action: 'supprimer un <br>.',
      example: `${exampleVariable} += \`ligne 1<br>ligne 2\``,
    }
  }

  return {
    cause: `un <br> est probablement placé au début d'une ligne dans ${sourceHint}.`,
    action: 'supprimer le <br> ou le mettre à la fin de la ligne précédente.',
    example: `${exampleVariable} += \`ligne 1<br> ligne 2\``,
  }
}

function formatIssue(issue: LintIssue) {
  const fragment = describeFragment(issue.fragment)
  const rule = describeRule(issue.rule, issue.fragment)

  return [
    `À la ligne ${issue.line} de ${fragment.locationLabel} en sortie LaTeX, on trouve : "${issue.excerpt}"`,
    `Cause probable : ${rule.cause}`,
    `À faire : ${rule.action}`,
    `Exemple: ${rule.example}`,
  ].join('\n')
}

function formatFailingRow(row: LintRow) {
  const issues = (row.issues ?? []).map(formatIssue)
  const ligneIssues = []
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i]
    if (
      issues
        .slice(i + 1)
        .some((other) => other.slice(0, 15) === issue.slice(0, 15))
    )
      continue
    ligneIssues.push(issue)
  }

  const issuesMessage = ligneIssues.join('\n\n')

  return [
    `Exercice : ${row.exercicePath}`,
    `Parametres : ${row.scenario}`,
    `URL : ${buildExerciseUrl(row.uuid, row.exercicePath, row.scenarioOverrides)}`,
    '',
    issuesMessage || row.detail,
  ].join('\n')
}

function formatFailureMessage(failingRows: LintRow[]) {
  const exerciseCount = failingRows.length
  const plural = exerciseCount > 1 ? 'exercices' : 'exercice'

  return [
    `Retours à la ligne LaTeX à corriger dans ${exerciseCount} ${plural}.`,
    '',
    failingRows.map(formatFailingRow).join('\n\n---\n\n'),
  ].join('\n')
}

function printUsage() {
  console.log('[INFO] Aucun filtre NIV ou CHANGED_FILES fourni.')
  console.log('[INFO] Pour tester les retours ligne LaTeX:')
  console.log('  NIV=4C20 pnpm test:e2e:latex_breaks')
  console.log('  NIV=4C20 TEST_PARAM=single pnpm test:e2e:latex_breaks')
  console.log(
    '  NIV=4C20 TEST_PARAM=full TEST_PARAM_MAX=20 pnpm test:e2e:latex_breaks',
  )
  console.log(
    '  CHANGED_FILES="src/exercices/3e/arithmetique/pgcd.ts" pnpm test:e2e:latex_breaks',
  )
}

function printSummary(rows: LintRow[]) {
  const failingRows = rows.filter((row) => row.status === 'KO')

  console.log('')
  console.log('=============================================================')
  console.log('[SUMMARY] LaTeX break lint')
  console.log('=============================================================')
  console.log('| Exercice | UUID | Parametres | Statut | Detail |')
  console.log('| --- | --- | --- | --- | --- |')

  for (const row of rows) {
    console.log(
      `| ${row.exercicePath} | ${row.uuid} | ${row.scenario.replace(/\|/g, '/')} | ${row.status} | ${row.detail.replace(/\|/g, '/')} |`,
    )
  }

  if (failingRows.length > 0) {
    console.log('')
    console.log('[DETAILS_KO]')
    console.log('=============================================================')
    for (const row of failingRows) {
      console.log(formatFailingRow(row))
      console.log(
        '-------------------------------------------------------------',
      )
    }
    console.log('=============================================================')
  }
}

describe('latex break lint', () => {
  test('refuse les doubles retours ligne LaTeX problematiques', async () => {
    let fail = false
    const refEnEchec = new Set<string>()

    if (
      process.env.NIV == null &&
      process.env.CHANGED_FILES == null &&
      process.env.CI !== 'true'
    ) {
      printUsage()
      expect(true).toBe(true)
      return
    }

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
    const rows: LintRow[] = []

    for (const [uuid, exercicePath] of uniqueTargets) {
      const loaded = await loadExerciseForLatex(uuid)
      if (loaded.status !== 'OK') {
        rows.push({
          uuid,
          exercicePath,
          scenario: 'défaut',
          scenarioOverrides: {},
          status: 'NON_TESTE',
          detail: loaded.detail,
        })
        continue
      }

      const scenarios = buildParamScenarios(loaded.exercice, paramLevel)

      for (const scenario of scenarios) {
        const scenarioLoaded = await loadExerciseForLatex(uuid)
        if (scenarioLoaded.status !== 'OK') {
          rows.push({
            uuid,
            exercicePath,
            scenario: scenario.label,
            scenarioOverrides: scenario.overrides,
            status: 'NON_TESTE',
            detail: scenarioLoaded.detail,
          })
          continue
        }

        Object.assign(scenarioLoaded.exercice, scenario.overrides)

        try {
          const latex = new Latex()
          latex.addExercices([scenarioLoaded.exercice])
          const contents = await latex.getContents({
            ...defaultLatexFileInfos,
          })
          const issues = lintLatexContents(contents)
          if (issues.length > 0) {
            refEnEchec.add(exercicePath)
            fail = true
          }

          rows.push({
            uuid,
            exercicePath,
            scenario: scenario.label,
            scenarioOverrides: scenario.overrides,
            status: issues.length > 0 ? 'KO' : 'OK',
            detail:
              issues.length > 0
                ? `${issues.length} probleme(s) de retour ligne LaTeX.`
                : 'Aucun retour ligne LaTeX problematique.',
            issues,
          })
        } catch (error) {
          rows.push({
            uuid,
            exercicePath,
            scenario: scenario.label,
            scenarioOverrides: scenario.overrides,
            status: 'KO',
            detail: `Generation LaTeX impossible: ${String(error)}`,
            issues: [],
          })
        }
      }
    }

    const failingRows = rows.filter((row) => row.status === 'KO')
    printSummary(rows)

    if (refEnEchec.size > 0) {
      console.log(
        `[INFO] ${refEnEchec.size} exercice(s) avec retours ligne LaTeX a corriger: ${[
          ...refEnEchec,
        ].join(', ')}`,
      )
    }
    /* if (failingRows.length > 0) {
      if (process.env.LATEX_BREAKS_VERBOSE === 'true') {
        printSummary(rows)
      }

      throw new Error(formatFailureMessage(failingRows))
    }
      */

    expect(fail).toBe(false)
  })
})
