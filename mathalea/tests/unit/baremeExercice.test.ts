import { beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import { afficheScore } from '../../src/lib/interactif/afficheScore'
import {
  COEFF_BAREME_MAX,
  coeffBaremeExercice,
  normaliseCoeffBareme,
  pointsMaxExercice,
} from '../../src/lib/interactif/baremeExercice'
import {
  toutAUnPoint,
  toutPourUnPoint,
} from '../../src/lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import { setOutputHtml } from '../../src/modules/context'
// Les custom elements doivent être enregistrés pour que le barème sache
// combien de points chaque question peut rapporter.
import '../../src/lib/customElements/FillInTheBlank'
import '../../src/lib/customElements/EchiquierProblemeElement'
import '../../src/lib/customElements/MathaleaMathfield'
import '../../src/lib/customElements/MultiMathfield'
import '../../src/lib/customElements/RelierEtiquettesElement'
import '../../src/lib/customElements/TableauMathlive'

describe('normaliseCoeffBareme', () => {
  it('vaut 1 par défaut', () => {
    expect(normaliseCoeffBareme(undefined)).toBe(1)
    expect(normaliseCoeffBareme('pas un nombre')).toBe(1)
    expect(normaliseCoeffBareme(Number.NaN)).toBe(1)
  })

  it('accepte les nombres et les chaînes de caractères', () => {
    expect(normaliseCoeffBareme(3)).toBe(3)
    expect(normaliseCoeffBareme('4')).toBe(4)
  })

  it('borne le coefficient', () => {
    expect(normaliseCoeffBareme(0)).toBe(1)
    expect(normaliseCoeffBareme(-5)).toBe(1)
    expect(normaliseCoeffBareme(1000)).toBe(COEFF_BAREME_MAX)
  })
})

describe('pointsMaxExercice', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    exercice = new Exercice()
    exercice.numeroExercice = 0
  })

  it('compte un point par question à réponse unique', () => {
    handleAnswers(exercice, 0, { reponse: { value: 12 } })
    handleAnswers(exercice, 1, { reponse: { value: 13 } })

    expect(pointsMaxExercice(exercice)).toBe(2)
  })

  it('ignore les questions sans réponse attendue', () => {
    handleAnswers(exercice, 0, { reponse: { value: 12 } })
    handleAnswers(exercice, 2, { reponse: { value: 13 } })

    expect(pointsMaxExercice(exercice)).toBe(2)
  })

  it("compte un seul point pour un texte à trous corrigé d'un bloc", () => {
    handleAnswers(
      exercice,
      0,
      { champ1: { value: '2' }, champ2: { value: '3' } },
      { formatInteractif: 'fill-in-the-blank' },
    )

    expect(pointsMaxExercice(exercice)).toBe(1)
  })

  it('compte un point par trou avec le barème toutAUnPoint', () => {
    handleAnswers(
      exercice,
      0,
      {
        bareme: toutAUnPoint,
        champ1: { value: '2' },
        champ2: { value: '3' },
        champ3: { value: '4' },
      },
      { formatInteractif: 'fill-in-the-blank' },
    )

    expect(pointsMaxExercice(exercice)).toBe(3)
  })

  it('compte un point par cellule de tableau avec le barème toutAUnPoint', () => {
    handleAnswers(
      exercice,
      0,
      {
        bareme: toutAUnPoint,
        L1C1: { value: '2' },
        L1C2: { value: '3' },
      },
      { formatInteractif: 'tableau-mathlive' },
    )

    expect(pointsMaxExercice(exercice)).toBe(2)
  })

  it('compte un seul point pour un tableau corrigé toutPourUnPoint', () => {
    handleAnswers(
      exercice,
      0,
      {
        bareme: toutPourUnPoint,
        L1C1: { value: '2' },
        L1C2: { value: '3' },
      },
      { formatInteractif: 'tableau-mathlive' },
    )

    expect(pointsMaxExercice(exercice)).toBe(1)
  })

  it('compte un point par lien attendu pour relier-etiquettes', () => {
    handleAnswers(
      exercice,
      0,
      {
        reponse: {
          value: JSON.stringify([
            { gauche: 'G0', droite: 'D0' },
            { gauche: 'G1', droite: 'D1' },
            { gauche: 'G2', droite: 'D2' },
          ]),
        },
      },
      { formatInteractif: 'relier-etiquettes' },
    )

    expect(pointsMaxExercice(exercice)).toBe(3)
  })

  it("compte le barème d'un échiquier de problème depuis la réponse et le HTML de la question", () => {
    const probleme = {
      expectedRows: ['Prix unitaire', 'Masse totale', 'Prix total'],
      expectedColumns: ['Pommes'],
      rowChoices: ['Prix unitaire', 'Masse totale', 'Prix total'],
      columnChoices: ['Pommes'],
      cells: [
        { row: 'Prix unitaire', column: 'Pommes', value: '2 €/kg' },
        { row: 'Masse totale', column: 'Pommes', value: '3 kg' },
        { row: 'Prix total', column: 'Pommes', value: '6 €' },
      ],
      expectedGreyedRows: ['Prix unitaire'],
      expectedGreyedColumns: [],
      expectedStructure: 'colonne',
      expectedOperation: 'multiplication',
    }
    handleAnswers(
      exercice,
      0,
      { reponse: { value: JSON.stringify(probleme) } },
      { formatInteractif: 'echiquier-probleme' },
    )
    exercice.listeQuestions[0] =
      '<echiquier-probleme cell-fill-mode="student" simplification-mode="grey"></echiquier-probleme>'

    expect(pointsMaxExercice(exercice)).toBe(5)
  })

  it("vaut 0 quand l'exercice n'a aucune réponse attendue", () => {
    expect(pointsMaxExercice(exercice)).toBe(0)
    expect(pointsMaxExercice(undefined)).toBe(0)
  })
})

describe('coefficient de barème appliqué au score', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    exercice = new Exercice()
    exercice.numeroExercice = 0
  })

  it('laisse le score inchangé avec le coefficient par défaut', () => {
    expect(coeffBaremeExercice(exercice)).toBe(1)
    const result = afficheScore(exercice, 3, 2)

    expect(result.numberOfPoints).toBe(3)
    expect(result.numberOfQuestions).toBe(5)
  })

  it('multiplie la note obtenue et la note maximale', () => {
    exercice.coeffBareme = 3
    const result = afficheScore(exercice, 3, 2)

    expect(result.numberOfPoints).toBe(9)
    expect(result.numberOfQuestions).toBe(15)
  })

  it('affiche le score multiplié', () => {
    exercice.coeffBareme = 2
    const divScore = document.createElement('div')

    afficheScore(exercice, 4, 1, divScore)

    expect(divScore.innerHTML).toBe('8 / 10')
  })
})
