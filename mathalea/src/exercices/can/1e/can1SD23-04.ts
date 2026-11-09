import { questionVariationsParabole } from '../../../lib/mathFonctions/tableauVariationsParabole'
import { listeQuestionsToContenu } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Dresser le tableau de variations de $ax^2+c$ à partir de son expression'
export const interactifReady = true
export const dateDePublication = '08/10/2026'
export const uuid = '0f480'

export const refs = {
  'fr-fr': ['can1SD23-04'],
  'fr-ch': [],
}

/**
 * Dresser (ou compléter en interactif) le tableau de variations de $ax^2+c$ à partir de l'expression de la fonction.
 */
export default class VariationsAxCarrePlusCExpression extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const { texte, texteCorr, cle } = questionVariationsParabole(this, i, {
        avecC: true,
        source: 'expression',
      })
      if (this.questionJamaisPosee(i, cle)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
