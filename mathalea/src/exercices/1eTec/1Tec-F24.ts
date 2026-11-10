import {
  questionVariationsParabole,
  type OptionsQuestionParabole,
} from '../../lib/mathFonctions/tableauVariationsParabole'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Dresser le tableau de variations de $ax^2$ ou $ax^2+c$ à partir de son expression ou de sa courbe'
export const interactifReady = true
export const dateDePublication = '08/10/2026'
export const uuid = 'e0f24'

export const refs = {
  'fr-fr': ['1Tec-F24'],
  'fr-ch': [],
}

const typesDeQuestions: OptionsQuestionParabole[] = [
  { avecC: false, source: 'expression' },
  { avecC: false, source: 'courbe' },
  { avecC: true, source: 'expression' },
  { avecC: true, source: 'courbe' },
]

/**
 * Dresser (ou compléter en interactif) le tableau de variations de $ax^2$ ou
 * $ax^2+c$ à partir de l'expression ou de la courbe de la fonction.
 */
export default class VariationsAxCarrePlusC extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Types de question',
      [
        'Nombres séparés par des tirets :',
        '1 : $ax^2$ à partir de l’expression',
        '2 : $ax^2$ à partir de la courbe',
        '3 : $ax^2+c$ à partir de l’expression',
        '4 : $ax^2+c$ à partir de la courbe',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '5'
  }

  nouvelleVersion() {
    const listeTypes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = listeTypes[i]
      const { texte, texteCorr, cle } = questionVariationsParabole(
        this,
        i,
        typesDeQuestions[type - 1],
      )
      if (this.questionJamaisPosee(i, type, cle)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
