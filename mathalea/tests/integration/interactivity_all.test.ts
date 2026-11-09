import seedrandom from 'seedrandom'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { mathaleaEnsureAMCCompatibility } from '../../src/lib/amc/amcInference'
import { createURL } from '../../src/lib/createURL'
import { mathaleaHandleExerciceSimple } from '../../src/lib/mathalea'
import { context } from '../../src/modules/context'
import { createSolidesThreeJsMock } from '../e2e/mocks/solidesThreeJs.mock'
import { clearDOM } from './helpers/domSimulator'
import { discoverExercises, loadExercise } from './helpers/exerciseLoader'
import {
  buildParamScenarios,
  resolveParamTestLevel,
} from './helpers/parameterScenarios'
import {
  type SkippedQuestion,
  writeQuestionsSummary,
  writeSkippedQuestionsLogs,
} from './helpers/skippedQuestionsLogger'
import { verifyComparisonOnly } from './helpers/verifier-comparison'
import { verifyKeyboardCoverage } from './helpers/verifier-clavier'
import { verifyDom } from './helpers/verifier-dom'

vi.mock('../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked value'),
}))

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(() => 'mocked value'),
}))

vi.mock('../../src/lib/3d/3d_dynamique/Canvas3DElement', () => ({
  ajouteCanvas3d: vi.fn((args) => `canvas3DElement-mock:${args.length}`),
}))

vi.mock('../../src/lib/3d/3d_dynamique/solidesThreeJs', () =>
  createSolidesThreeJsMock(),
)

vi.mock('../../src/lib/3d/3d_dynamique/patrons3d', () => ({
  generateContent3D: vi.fn((matrice, id) => ({
    type: 'group',
    object: { id, faces: Array.isArray(matrice) ? matrice.length : 0 },
  })),
}))

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, 'ResizeObserver', {
    value: ResizeObserverMock,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(globalThis, 'ResizeObserver', {
    value: ResizeObserverMock,
    writable: true,
    configurable: true,
  })

  window.notify = vi.fn()
  window.notifyLocal = vi.fn()
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  const mockContext: Partial<CanvasRenderingContext2D> = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    rect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    transform: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createPattern: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 }) as TextMetrics),
    getImageData: vi.fn(
      () =>
        ({
          data: new Uint8ClampedArray(0),
          colorSpace: 'srgb',
          height: 0,
          width: 0,
        }) as ImageData,
    ),
    putImageData: vi.fn(),
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    canvas: { width: 300, height: 150 } as HTMLCanvasElement,
  }
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: vi.fn(() => mockContext),
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  clearDOM()
})

const SEEDS = ['ePxF1', 'a2b3c', 'z9y8x']
const filter = process.env.NIV?.replaceAll(' ', '') ?? undefined
const changedFilesEnv = process.env.CHANGED_FILES
const paramLevel = resolveParamTestLevel(process.env.TEST_PARAM)
const skippedQuestions: SkippedQuestion[] = []
const skippedQuestionKeys = new Set<string>()
let comparisonTestedQuestionsCount = 0
let comparisonSkippedQuestionsCount = 0
let domTestedQuestionsCount = 0
let domSkippedQuestionsCount = 0
const eitherTestedQuestionKeys = new Set<string>()

function parseChangedFiles(value: string | undefined): string[] {
  if (!value) return []
  return [
    ...new Set(
      value
        .split('\n')
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ]
}

function isRelevantChangedExerciseFile(filePath: string): boolean {
  return (
    filePath.startsWith('src/exercices/') &&
    !filePath.includes('ressources') &&
    !filePath.includes('apps') &&
    filePath.replace('src/exercices/', '').split('/').length >= 2 &&
    /\.(ts|js)$/.test(filePath)
  )
}

function toExercisePrefix(filePath: string): string {
  return filePath
    .replace(/^src\/exercices\//, '')
    .replace(/\.ts$/, '.')
    .replace(/\.js$/, '.')
    .replaceAll(' ', '')
}

function discoverExercisesFromChangedFiles(
  changedFilesValue: string,
): ReturnType<typeof discoverExercises> {
  const filters = [
    ...new Set(
      parseChangedFiles(changedFilesValue)
        .filter(isRelevantChangedExerciseFile)
        .map(toExercisePrefix),
    ),
  ]

  if (filters.length === 0) return []

  const seen = new Set<string>()
  const merged: ReturnType<typeof discoverExercises> = []

  for (const changedFilter of filters) {
    for (const entry of discoverExercises(changedFilter)) {
      const key = `${entry.uuid}|${entry.filePath}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(entry)
    }
  }

  return merged
}

function questionKey(
  filePath: string,
  seed: string,
  scenarioLabel: string | undefined,
  questionIndex: number,
) {
  return `${filePath}|${seed}|${scenarioLabel ?? ''}|${questionIndex}`
}

function recordSkippedQuestion(entry: SkippedQuestion) {
  const key = [
    entry.filePath,
    entry.scenario ?? '',
    entry.strategy,
    entry.format,
    entry.skipReason,
  ].join('|')
  if (skippedQuestionKeys.has(key)) return
  skippedQuestionKeys.add(key)
  skippedQuestions.push(entry)
}

const exercises =
  filter !== undefined
    ? discoverExercises(filter)
    : changedFilesEnv !== undefined
      ? discoverExercisesFromChangedFiles(changedFilesEnv)
      : discoverExercises()

if (exercises.length === 0) {
  describe('no exercises found', () => {
    it.skip(`No exercises found for filter '${filter ?? 'none'}'`, () => {})
  })
}

afterAll(() => {
  writeSkippedQuestionsLogs(skippedQuestions)
  writeQuestionsSummary({
    comparisonTestedQuestionsCount,
    comparisonSkippedQuestionsCount,
    domTestedQuestionsCount,
    domSkippedQuestionsCount,
    eitherTestedQuestionsCount: eitherTestedQuestionKeys.size,
  })
})

// Group by directory (6e, 5e, etc.) for organized output
const grouped = new Map<string, typeof exercises>()
for (const ex of exercises) {
  const dir = ex.filePath.split('/')[0]
  if (!grouped.has(dir)) grouped.set(dir, [])
  grouped.get(dir)!.push(ex)
}

for (const [dir, entries] of grouped) {
  describe(dir, () => {
    for (const entry of entries) {
      it(`${entry.filePath} — l'interactivité accepte les réponses attendues`, async () => {
        const loaded = await loadExercise(entry)
        if (!loaded) return // Not interactive, skip silently

        const { ExerciseClass, titre } = loaded
        const failures: string[] = []
        let autoCorrectionFoundCount = 0
        const scenarioProbe = new ExerciseClass()
        const scenarios = buildParamScenarios(scenarioProbe, paramLevel)

        for (const seed of SEEDS) {
          for (const scenario of scenarios) {
            // Chaque combinaison doit partir d'un DOM vierge. Une erreur ou
            // une vérification partielle dans la combinaison précédente ne
            // doit pas influencer la suivante.
            clearDOM()
            const exercice = new ExerciseClass()
            if (loaded.amcReady !== undefined) {
              exercice.amcReady = loaded.amcReady
            }
            if (loaded.amcType !== undefined) exercice.amcType = loaded.amcType
            exercice.formatInteractif = loaded.formatInteractif
            exercice.seed = seed
            exercice.numeroExercice = 0
            exercice.interactif = true
            Object.assign(exercice, scenario.overrides)
            seedrandom(seed, { global: true })
            const baseParams: { uuid: string; alea: string; interactif: '1' } =
              { uuid: entry.uuid, alea: seed, interactif: '1' }
            const params = Object.assign(baseParams, scenario.overrides)
            const url = createURL([params]).href.replace(':3000', ':5173')

            try {
              if (exercice.typeExercice === 'simple') {
                mathaleaHandleExerciceSimple(
                  exercice,
                  true,
                  exercice.numeroExercice,
                  seed,
                )
              } else {
                exercice.nouvelleVersion(exercice.numeroExercice)
              }
            } catch (e) {
              failures.push(
                `${url} : Erreur déclenchée lors d'une nouvelleVersion() : ${e instanceof Error ? e.message : e}`,
              )
              continue
            }

            if (exercice.autoCorrection.length === 0) {
              continue
            }
            autoCorrectionFoundCount++

            // Stratégie 1: On passe directement la réponse attendue à la fonction de comparaison (si disponible) sans passer par le DOM.
            const compResults = verifyComparisonOnly(exercice)
            for (const result of compResults) {
              if (result.skipped) {
                comparisonSkippedQuestionsCount++
                recordSkippedQuestion({
                  filePath: entry.filePath,
                  titre,
                  seed,
                  scenario: scenario.label,
                  strategy: 'comparison-only',
                  questionIndex: result.questionIndex,
                  format: result.format,
                  skipReason: result.skipReason ?? 'unknown',
                })
                continue
              }
              comparisonTestedQuestionsCount++
              eitherTestedQuestionKeys.add(
                questionKey(
                  entry.filePath,
                  seed,
                  scenario.label,
                  result.questionIndex,
                ),
              )
              if (!result.isOk) {
                failures.push(
                  `${url} : la fonction de comparaison ${result.verificationFunctionName} (${result.format} - ${JSON.stringify(result.optionsComparaison)}) n'accepte pas les réponses attendues par la question ${result.questionIndex + 1}. Saisie simulée : ${result.simulatedInput}. Réponse attendue : ${result.goodAnswer}. Feedback : ${result.feedback}`,
                )
              }
            }

            // Stratégie 2 : On crée les éléments DOM attendus par la vérification interactive et on vérifie que la correction accepte ces éléments.
            const domResults = verifyDom(exercice)
            for (const result of domResults) {
              if (result.skipped) {
                domSkippedQuestionsCount++
                recordSkippedQuestion({
                  filePath: entry.filePath,
                  titre,
                  seed,
                  scenario: scenario.label,
                  strategy: 'full-dom',
                  questionIndex: result.questionIndex,
                  format: result.format,
                  skipReason: result.skipReason ?? 'unknown',
                })
                continue
              }
              domTestedQuestionsCount++
              eitherTestedQuestionKeys.add(
                questionKey(
                  entry.filePath,
                  seed,
                  scenario.label,
                  result.questionIndex,
                ),
              )
              if (!result.isOk) {
                failures.push(
                  `${url} : la fonction ${result.verificationFunctionName} (${result.format}) n'accepte pas les réponses attendues par la question ${result.questionIndex + 1}. Saisie simulée : ${result.simulatedInput}. Réponse attendue : ${result.goodAnswer}. Feedback : ${result.feedback}`,
                )
              }
            }

            // Stratégie 3 : le clavier assigné à chaque champ MathLive doit
            // permettre de saisir tous les symboles de la réponse attendue
            // (variable, parenthèses, opérateurs...).
            const clavierResults = verifyKeyboardCoverage(exercice)
            for (const result of clavierResults) {
              if (!result.isOk) {
                failures.push(
                  `${url} : le clavier "${result.clavier}" assigné à la question ${result.questionIndex + 1} ne permet pas de saisir : ${result.symbolesManquants.join(', ')} (réponse attendue : ${result.reponse}).`,
                )
              }
            }

            // Stratégie 4 : le passage AMC doit conserver exhaustivement les
            // questions, propositions et statuts des QCM générés en HTML ou
            // construits uniquement pendant la passe AMC.
            const isQcmItem = (
              item: (typeof exercice.autoCorrection)[number],
            ) =>
              Array.isArray(item?.propositions) &&
              item.propositions.length >= 2 &&
              item.propositions.every(
                (proposition) => typeof proposition.statut === 'boolean',
              )
            const qcmItems = exercice.autoCorrection.filter(isQcmItem)
            for (const [qcmIndex, item] of qcmItems.entries()) {
              const textes = (item.propositions ?? []).map((proposition) =>
                String(proposition.texte ?? '').trim(),
              )
              if (new Set(textes).size !== textes.length) {
                failures.push(
                  `${url} : QCM — les propositions générées du bloc ${qcmIndex + 1} contiennent des doublons.`,
                )
              }
            }
            const htmlAmcType = exercice.amcType
            const declaresNativeQcm = ['qcmMono', 'qcmMult'].includes(
              String(htmlAmcType),
            )
            if (qcmItems.length > 0 || declaresNativeQcm) {
              const interactiveAutoCorrection = exercice.autoCorrection.map(
                (item) => ({
                  ...item,
                  propositions: item?.propositions?.map((proposition) => ({
                    ...proposition,
                  })),
                }),
              )
              ;(exercice as any).interactiveAutoCorrectionForAMC =
                interactiveAutoCorrection
              const originalIsHtml = context.isHtml
              const originalIsAmc = context.isAmc
              const originalInteractif = exercice.interactif
              let generatedAmcQcmItems: typeof qcmItems = []
              try {
                // Même pipeline que la page AMC : après la capture interactive,
                // une passe HTML non interactive prépare l'énoncé papier avant
                // la génération AMC avec la même graine.
                context.isHtml = true
                context.isAmc = false
                exercice.interactif = false
                ;(exercice as any).lastCallback = ''
                seedrandom(seed, { global: true })
                if (exercice.typeExercice === 'simple') {
                  mathaleaHandleExerciceSimple(exercice, false)
                } else if (
                  typeof exercice.nouvelleVersionWrapper === 'function'
                ) {
                  exercice.nouvelleVersionWrapper()
                } else {
                  exercice.nouvelleVersion(exercice.numeroExercice)
                }

                context.isHtml = false
                context.isAmc = true
                exercice.interactif = false
                ;(exercice as any).lastCallback = ''
                seedrandom(seed, { global: true })
                if (exercice.typeExercice === 'simple') {
                  mathaleaHandleExerciceSimple(exercice, false)
                } else if (
                  typeof exercice.nouvelleVersionWrapper === 'function'
                ) {
                  exercice.nouvelleVersionWrapper()
                } else {
                  exercice.nouvelleVersion(exercice.numeroExercice)
                }
                generatedAmcQcmItems = exercice.autoCorrection.filter(isQcmItem)
                if (
                  generatedAmcQcmItems.length === 0 &&
                  Array.isArray(exercice.autoCorrectionAMC)
                ) {
                  generatedAmcQcmItems = exercice.autoCorrectionAMC.filter(
                    (item) => isQcmItem(item as any),
                  ) as typeof qcmItems
                }
                mathaleaEnsureAMCCompatibility(exercice)
              } finally {
                context.isHtml = originalIsHtml
                context.isAmc = originalIsAmc
                exercice.interactif = originalInteractif
              }

              const exportedQcmBlocks =
                exercice.amcType === 'AMCHybride'
                  ? (exercice.autoCorrectionAMC ?? []).flatMap((item) =>
                      (item?.propositions ?? []).filter((proposition) =>
                        ['qcmMono', 'qcmMult'].includes(
                          String(proposition.type),
                        ),
                      ),
                    )
                  : ['qcmMono', 'qcmMult'].includes(String(exercice.amcType))
                    ? (exercice.autoCorrectionAMC ?? []).filter((item) =>
                        isQcmItem(item as any),
                      )
                    : []
              const expectedQcmItems =
                qcmItems.length > 0 ? qcmItems : generatedAmcQcmItems
              const explicitlyExpectedQcm = ['qcmMono', 'qcmMult'].includes(
                String(htmlAmcType),
              )
              const inferredQcm =
                htmlAmcType == null &&
                qcmItems.length ===
                  exercice.autoCorrection.filter((item) => item != null).length
              const nativeHybridQcm =
                htmlAmcType === 'AMCHybride' && exportedQcmBlocks.length > 0
              const mustPreserveQcm =
                explicitlyExpectedQcm || inferredQcm || nativeHybridQcm

              if (
                mustPreserveQcm &&
                !['qcmMono', 'qcmMult', 'AMCHybride'].includes(
                  String(exercice.amcType),
                )
              ) {
                failures.push(
                  `${url} : QCM — la passe AMC aboutit à ${String(exercice.amcType)} et perd un QCM attendu.`,
                )
              } else if (mustPreserveQcm) {
                if (expectedQcmItems.length === 0) {
                  failures.push(
                    `${url} : QCM — le type natif ${String(htmlAmcType)} ne produit aucune proposition pendant la passe AMC.`,
                  )
                } else if (exportedQcmBlocks.length === 0) {
                  failures.push(
                    `${url} : QCM — aucun bloc QCM n'est exporté vers AMC.`,
                  )
                }
                for (let qcmIndex = 0; qcmIndex < exportedQcmBlocks.length; qcmIndex++) {
                  const exportedPropositions =
                    exportedQcmBlocks[qcmIndex]?.propositions ?? []
                  if (
                    exportedPropositions.length < 2 ||
                    !exportedPropositions.some((proposition) =>
                      Boolean(proposition.statut),
                    )
                  ) {
                    failures.push(
                      `${url} : QCM — le bloc AMC ${qcmIndex + 1} ne contient pas au moins deux propositions et une bonne réponse : ${JSON.stringify(exportedPropositions)}.`,
                    )
                  }
                }
              }
            }
            clearDOM()
          }
        }

        if (failures.length > 0) {
          for (const failure of failures) {
            expect.soft(false, failure).toBe(true)
          }
        }
      })
    }
  })
}
