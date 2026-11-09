import { afterEach, describe, expect, it, vi } from 'vitest'
import { tick } from 'svelte'
import { createClassComponent } from 'svelte/legacy'
import Exercice from '../../../src/exercices/Exercice'
import QuestionParPage from '../../../src/components/display/eleve/QuestionParPage.svelte'
import { exercicesParams } from '../../../src/lib/stores/generalStore'
import { globalOptions } from '../../../src/lib/stores/globalOptions'

const mocks = vi.hoisted(() => ({ build: vi.fn(), load: vi.fn() }))
vi.mock(
  '../../../src/lib/components/exercisesUtils',
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import('../../../src/lib/components/exercisesUtils')
    >()),
    buildExercisesList: mocks.build,
  }),
)
vi.mock('../../../src/lib/mathalea', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/lib/mathalea')>()),
  mathaleaRenderDiv: vi.fn(),
  mathaleaLoadExerciceFromUuid: mocks.load,
  mathaleaUpdateUrlFromExercicesParams: vi.fn(),
}))
vi.mock('../../../src/modules/loaders', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/modules/loaders')>()),
  loadMathLive: vi.fn(),
}))
vi.mock('../../../src/components/shared/exercice/Exercice.svelte', () => ({
  default: () => {},
}))

class ContextExercise extends Exercice {
  constructor(private version: string) {
    super()
    this.uuid = 'context-test'
    this.seed = 'first'
    this.interactif = true
    this.interactifReady = true
    this.nbQuestions = 2
    this.correctionInteractive = () => 'OK'
  }
  nouvelleVersion() {
    this.consigne = `Consigne ${this.version}.`
    this.introduction = `Introduction ${this.version}.`
    this.consigneCorrection = `Contexte correction ${this.version}.`
    this.listeQuestions = [
      `Question A ${this.version}.`,
      `Question B ${this.version}.`,
    ]
    this.listeCorrections = [
      `Correction A ${this.version}.`,
      `Correction B ${this.version}.`,
    ]
    this.autoCorrection = [
      { formatInteractif: 'custom' },
      { formatInteractif: 'custom' },
    ]
  }
}

let destroy: (() => void) | undefined
afterEach(() => {
  destroy?.()
  destroy = undefined
  document.body.innerHTML = ''
  vi.clearAllMocks()
})

describe('régénération du contexte dans QuestionParPage', () => {
  it('actualise la page ciblée et conserve le contexte et les réponses des autres pages', async () => {
    const original = new ContextExercise('initiale')
    mocks.build.mockReturnValue([Promise.resolve(original)])
    mocks.load.mockResolvedValue(new ContextExercise('nouvelle'))
    exercicesParams.set([{ uuid: original.uuid, alea: original.seed }])
    globalOptions.update((options) => ({
      ...options,
      oneShot: false,
      isCorrectionOnlyOnError: false,
    }))
    const target = document.createElement('div')
    document.body.append(target)
    const component = createClassComponent({
      component: QuestionParPage,
      target,
    })
    destroy = () => component.$destroy()
    await vi.waitFor(() =>
      expect(target.textContent).toContain('Question A initiale.'),
    )
    expect(target.textContent?.match(/Introduction initiale\./g)).toHaveLength(
      1,
    )

    const otherQuestion = original.listeQuestions[1]
    const otherAnswer = original.autoCorrection[1]
    const buttons = () => [...target.querySelectorAll('button')]
    buttons()
      .find((button) => button.textContent?.includes('Vérifier'))!
      .click()
    await vi.waitFor(() =>
      expect(target.textContent).toContain('Contexte correction initiale.'),
    )
    buttons()
      .find((button) => button.textContent?.includes('Recommencer'))!
      .click()
    await vi.waitFor(() =>
      expect(target.textContent).toContain('Introduction nouvelle.'),
    )
    expect(target.textContent).toContain('Question A nouvelle.')
    expect(target.textContent).not.toContain('Introduction initiale.')
    expect(original.listeQuestions[1]).toBe(otherQuestion)
    expect(original.autoCorrection[1]).toBe(otherAnswer)
    expect(original.listeCorrections[1]).toBe('Correction B initiale.')
    expect(original.introduction).toBe('Introduction initiale.')

    // Vérifier aussi le contexte de correction issu du nouveau tirage.
    buttons()
      .find((button) => button.textContent?.includes('Vérifier'))!
      .click()
    await vi.waitFor(() =>
      expect(target.textContent).toContain('Contexte correction nouvelle.'),
    )
    await (
      component as unknown as {
        handleIndexChange: (index: number) => Promise<void>
      }
    ).handleIndexChange(1)
    await tick()
    expect(target.textContent).toContain('Introduction initiale.')
    expect(target.textContent).not.toContain('Introduction nouvelle.')
    expect(target.textContent?.match(/Introduction initiale\./g)).toHaveLength(
      1,
    )
  })
})
