import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import AutoCEtechno2026 from '../../src/exercices/1e/1A-A01-5'
import MetaExercice from '../../src/exercices/MetaExerciceCan'
import {
  addMathaleaQcm,
  MathaleaQcmElement,
} from '../../src/lib/customElements/MathaleaQcm'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../src/lib/customElements/MathaleaCustomElement'
import { listeDeroulanteToQcm } from '../../src/lib/customElements/ListeDeroulanteElement'
import { mathaleaEnsureAMCCompatibility } from '../../src/lib/amc/amcInference'
import {
  exerciceInteractif,
  handleAnswers,
} from '../../src/lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../src/lib/interactif/qcm'
import { setOutputHtml, setOutputLatex } from '../../src/modules/context'
import { interactivityTypeToCustomElementFormat } from '../../src/lib/types'

const propositions = [
  { texte: '$4$', statut: true },
  { texte: '$5$', statut: false },
  { texte: '$6$', statut: false },
]

class SourceModernQcm extends Exercice {
  nouvelleVersion(): void {
    handleAnswers(
      this,
      0,
      {
        qcm: {
          enonce: 'Choisir la réponse correcte.',
          propositions: [
            { texte: 'bonne réponse', statut: true },
            { texte: 'mauvaise réponse', statut: false },
          ],
          options: { radio: true, ordered: true },
        },
      },
      { formatInteractif: 'mathalea-qcm' },
    )
    this.listeQuestions[0] =
      'Source <mathalea-qcm id="mathalea-qcmEx99Q0"></mathalea-qcm>'
    this.listeCorrections[0] = 'Correction source.'
  }
}

function appendQcm(
  exercice: Exercice,
  options: { radio?: boolean; vertical?: boolean } = {},
): MathaleaQcmElement {
  document.body.innerHTML = MathaleaQcmElement.create({
    numeroExercice: exercice.numeroExercice,
    questionIndex: 0,
    propositions,
    ...options,
  })
  return document.querySelector('mathalea-qcm') as MathaleaQcmElement
}

describe('MathaleaQcmElement', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    exercice = new Exercice()
    exercice.numeroExercice = 2
    exercice.autoCorrection[0] = {
      propositions: propositions.map((proposition) => ({ ...proposition })),
      options: {},
    }
  })

  afterEach(() => {
    setOutputHtml()
  })

  it('enregistre le tag dans les registres MathALEA', () => {
    expect(customElements.get('mathalea-qcm')).toBe(MathaleaQcmElement)
    expect(listOfCustomElements).toContain('mathalea-qcm')
    expect(mathaleaCustomElementsRegistry.get('mathalea-qcm')).toBe(
      MathaleaQcmElement,
    )
  })

  it('normalise le format qcm historique pour le dispatch', () => {
    expect(interactivityTypeToCustomElementFormat('qcm')).toBe('mathalea-qcm')
    expect(interactivityTypeToCustomElementFormat('QCM')).toBe('mathalea-qcm')
  })

  it('rend les controles avec les identifiants historiques', () => {
    const qcm = appendQcm(exercice)

    expect(qcm.id).toBe('mathalea-qcmEx2Q0')
    expect(qcm.querySelectorAll('input[type="checkbox"]')).toHaveLength(3)
    expect(qcm.querySelector('#checkEx2Q0R1')).not.toBeNull()
    expect(qcm.querySelector('#labelEx2Q0R1')?.innerHTML).toBe('$5$')
    expect(qcm.querySelector('#resultatCheckEx2Q0')).not.toBeNull()
  })

  it('serialise et restaure les choix selectionnes', () => {
    const qcm = appendQcm(exercice)
    const first = qcm.querySelector('#checkEx2Q0R0') as HTMLInputElement
    const third = qcm.querySelector('#checkEx2Q0R2') as HTMLInputElement

    first.checked = true
    first.dispatchEvent(new Event('change'))
    third.checked = true
    third.dispatchEvent(new Event('change'))
    expect(qcm.value).toBe('[0,2]')

    qcm.value = '[1]'
    expect(first.checked).toBe(false)
    expect(
      (qcm.querySelector('#checkEx2Q0R1') as HTMLInputElement).checked,
    ).toBe(true)
    expect(third.checked).toBe(false)
  })

  it('rend les controles inertes sans perdre la selection', () => {
    const qcm = appendQcm(exercice, { radio: true })
    qcm.value = '[0]'

    qcm.interactivityOn = false

    const selected = qcm.querySelector('#checkEx2Q0R0') as HTMLInputElement
    expect(selected).not.toBeNull()
    expect(selected.checked).toBe(true)
    expect(selected.disabled).toBe(true)
    expect(selected.style.pointerEvents).toBe('none')
    expect(qcm.querySelector('#labelEx2Q0R0')?.getAttribute('for')).toBeNull()
    expect(
      (qcm.querySelector('#labelEx2Q0R0') as HTMLLabelElement).style.cursor,
    ).toBe('default')
  })

  it('peut reactiver un QCM cree sans interactivite', () => {
    document.body.innerHTML = MathaleaQcmElement.create({
      numeroExercice: exercice.numeroExercice,
      questionIndex: 0,
      propositions,
      interactivityOn: false,
    })
    const qcm = document.querySelector('mathalea-qcm') as MathaleaQcmElement
    expect(
      (qcm.querySelector('#checkEx2Q0R0') as HTMLInputElement).disabled,
    ).toBe(true)

    qcm.interactivityOn = true

    const first = qcm.querySelector('#checkEx2Q0R0') as HTMLInputElement
    expect(first).not.toBeNull()
    expect(first.disabled).toBe(false)
    expect(first.style.pointerEvents).toBe('')
    expect(first.tabIndex).toBe(0)
  })

  it('verifie la question et conserve les cles de reponse historiques', () => {
    exercice.autoCorrection[0].formatInteractif = 'mathalea-qcm'
    const qcm = appendQcm(exercice)
    qcm.value = '[0]'

    const result = MathaleaQcmElement.verifQuestion(exercice, 0)

    expect(result).toEqual({
      isOk: true,
      feedback: '',
      score: { nbBonnesReponses: 1, nbReponses: 1 },
    })
    expect(exercice.answers?.Ex2Q0R0).toBe('1')
    expect(exercice.answers?.Ex2Q0R1).toBe('0')
    expect(exercice.answers?.['mathalea-qcmEx2Q0']).toBe('[0]')
    expect(qcm.interactivityOn).toBe(false)
    expect(qcm.querySelector('#resultatCheckEx2Q0')?.textContent).toContain(
      '😎',
    )
  })

  it('hydrate la valeur restaurable pour un dispatch qcm historique', () => {
    exercice.autoCorrection[0].formatInteractif = 'qcm'
    const qcm = appendQcm(exercice)
    qcm.value = '[0]'

    MathaleaQcmElement.verifQuestion(exercice, 0)

    expect(exercice.answers?.Ex2Q0R0).toBe('1')
    expect(exercice.answers?.['mathalea-qcmEx2Q0']).toBe('[0]')
  })

  it('corrige le format qcm historique par le dispatch central', () => {
    exercice.autoCorrection[0].formatInteractif = 'qcm'
    const qcm = appendQcm(exercice)
    qcm.value = '[0]'
    const score = document.createElement('div')
    const button = document.createElement('button')

    const result = exerciceInteractif(exercice, score, button)

    expect(result).toEqual({
      numberOfPoints: 1,
      numberOfQuestions: 1,
      perQuestionIsOk: [true],
    })
    expect(score.textContent).toBe('1 / 1')
    expect(qcm.interactivityOn).toBe(false)
    expect(exercice.answers?.Ex2Q0R0).toBe('1')
    expect(exercice.answers?.['mathalea-qcmEx2Q0']).toBe('[0]')
  })

  it('expose un helper qui renseigne le format interactif', () => {
    const html = addMathaleaQcm(exercice, 0, { radio: true })

    expect(exercice.autoCorrection[0].formatInteractif).toBe('mathalea-qcm')
    expect(html).toContain('<mathalea-qcm')
    expect(html).toContain('radio="true"')
  })

  it('declare un QCM moderne avec handleAnswers et synchronise AMC', () => {
    handleAnswers(
      exercice,
      0,
      {
        qcm: {
          enonce: 'Choisir le nombre pair.',
          correction: 'Un nombre pair est divisible par 2.',
          propositions: [
            { texte: '$4$', statut: true, feedback: 'Oui.' },
            { texte: '$5$', statut: false },
          ],
          options: { radio: true, ordered: true, vertical: false },
        },
      },
      { formatInteractif: 'mathalea-qcm' },
    )

    expect(exercice.autoCorrection[0]).toEqual({
      enonce: 'Choisir le nombre pair.',
      formatInteractif: 'mathalea-qcm',
      options: { radio: true, ordered: true, vertical: false },
      propositions: [
        { texte: '$4$', statut: true, feedback: 'Oui.' },
        { texte: '$5$', statut: false, feedback: undefined },
      ],
    })
    expect(exercice.autoCorrectionAMC?.[0]).toEqual({
      enonce: 'Choisir le nombre pair.',
      options: {
        radio: true,
        ordered: true,
        vertical: false,
        correction: 'Un nombre pair est divisible par 2.',
      },
      propositions: exercice.autoCorrection[0].propositions,
    })

    const html = addMathaleaQcm(exercice, 0)
    expect(html).toContain('numero-exercice="2"')
    expect(html).toContain('question-index="0"')
  })

  it('formate encore les réponses QCM historiques de Capytale', () => {
    expect(
      MathaleaQcmElement.formatStudentAnswer('$20\\,000$', '<mathalea-qcm>'),
    ).toBe('$20\\,000$')
  })

  it('est produit par propositionsQcm en HTML interactif', () => {
    exercice.interactif = true
    exercice.autoCorrection[0].options = { radio: true, vertical: true }

    const qcm = propositionsQcm(exercice, 0)

    expect(qcm.texte).toContain('<mathalea-qcm')
    expect(qcm.texte).not.toContain('<input')
    expect(qcm.texteCorr).toContain('<input type="radio"')
    expect(exercice.autoCorrection[0].formatInteractif).toBe('mathalea-qcm')
    expect(exercice.autoCorrectionAMC?.[0].propositions).toEqual(
      exercice.autoCorrection[0].propositions,
    )

    document.body.innerHTML = qcm.texte
    expect(document.querySelector('#checkEx2Q0R0')).not.toBeNull()
    expect(document.querySelector('#resultatCheckEx2Q0')).not.toBeNull()
  })

  it('conserve la conversion liste deroulante, le rendu et AMC', () => {
    exercice.interactif = true
    listeDeroulanteToQcm(
      exercice,
      0,
      [
        { value: 'somme', label: 'une somme' },
        { value: 'produit', label: 'un produit' },
        { value: 'difference', label: 'une différence' },
      ],
      'produit',
      { ordered: true, vertical: false },
      'Il fallait reconnaître un produit.',
    )

    const qcm = propositionsQcm(exercice, 0)

    expect(qcm.texte).toContain('<mathalea-qcm')
    expect(exercice.autoCorrection[0].formatInteractif).toBe('mathalea-qcm')
    expect(exercice.autoCorrection[0].propositions).toEqual([
      {
        texte: 'une somme',
        statut: false,
        feedback: 'Il fallait reconnaître un produit.',
      },
      { texte: 'un produit', statut: true, feedback: undefined },
      { texte: 'une différence', statut: false, feedback: undefined },
    ])
    expect(exercice.autoCorrectionAMC?.[0].propositions).toEqual(
      exercice.autoCorrection[0].propositions,
    )
  })

  it('convertit aussi une liste deroulante avec des choix texte simples', () => {
    exercice.interactif = true

    listeDeroulanteToQcm(
      exercice,
      0,
      ['addition', 'multiplication', 'soustraction'],
      'multiplication',
      { ordered: true },
    )

    expect(exercice.autoCorrection[0].propositions).toEqual([
      { texte: 'addition', statut: false, feedback: '' },
      { texte: 'multiplication', statut: true, feedback: undefined },
      { texte: 'soustraction', statut: false, feedback: undefined },
    ])
  })

  it('reconstruit les identifiants QCM dans MetaExerciceCan', () => {
    const meta = new MetaExercice([SourceModernQcm, SourceModernQcm])
    meta.numeroExercice = 7
    meta.interactif = true
    meta.sup2 = '1-2'

    meta.nouvelleVersion()

    expect(meta.listeQuestions[0]).toContain('mathalea-qcmEx7Q0')
    expect(meta.listeQuestions[1]).toContain('mathalea-qcmEx7Q1')
    expect(meta.listeQuestions.join('')).not.toContain('mathalea-qcmEx99Q0')
    expect(meta.autoCorrection[1].propositions).toEqual([
      { texte: 'bonne réponse', statut: true, feedback: undefined },
      { texte: 'mauvaise réponse', statut: false, feedback: undefined },
    ])
    expect(meta.autoCorrection[1].options).toMatchObject({
      radio: true,
      ordered: true,
    })
    expect(meta.autoCorrection[1].formatInteractif).toBe('mathalea-qcm')
  })

  it('flèche les QCM historiques agrégés vers mathalea-qcm', () => {
    const meta = new AutoCEtechno2026()
    meta.numeroExercice = 0
    meta.interactif = true
    // Par défaut, la composition est en saisie libre : on demande les QCM.
    meta.sup4 = true

    meta.nouvelleVersion()

    expect(meta.autoCorrection).toHaveLength(8)
    for (const question of meta.autoCorrection) {
      expect(question.formatInteractif).toBe('mathalea-qcm')
      expect(question.propositions?.length).toBeGreaterThan(1)
      expect(question.propositions?.some(({ statut }) => statut)).toBe(true)
    }

    mathaleaEnsureAMCCompatibility(meta)

    expect(meta.amcType).toBe('qcmMono')
    expect(meta.autoCorrectionAMC).toHaveLength(8)
    expect(
      meta.autoCorrectionAMC?.map((question) =>
        question.propositions?.map(({ statut }) => statut),
      ),
    ).toEqual(
      meta.autoCorrection.map((question) =>
        question.propositions?.map(({ statut }) => statut),
      ),
    )
  })

  it('rend une version HTML non interactive avec des lettres', () => {
    exercice.interactif = false

    const qcm = propositionsQcm(exercice, 0, {
      format: 'lettre',
      style: '',
    })

    document.body.innerHTML = qcm.texte
    const element = document.querySelector('mathalea-qcm')
    expect(element).not.toBeNull()
    expect(element?.querySelectorAll('input')).toHaveLength(0)
    expect(element?.textContent).toContain('A.')
    expect(element?.querySelector('.katex')).not.toBeNull()
    expect(element?.textContent).not.toContain('$4$')
  })

  it('conserve le rendu LaTeX historique', () => {
    setOutputLatex()

    const qcm = propositionsQcm(exercice, 0)

    expect(qcm.texte).toContain('\\begin{qcmprop}')
    expect(qcm.texte).not.toContain('mathalea-qcm')
    expect(qcm.texteCorr).toContain('correct={')
    expect(exercice.autoCorrection[0].formatInteractif).toBe('mathalea-qcm')
  })
})
