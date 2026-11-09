import { miseEnEvidence } from '../../../lib/outils/embellissements'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Utiliser les priorités opératoires avec des relatifs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '1da2d'

export const refs = {
  'fr-fr': ['can4C1-01'],
  'fr-ch': ['NR'],
}
export default class PrioriteOperatoireEtRelatifs extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a = this.quotaRandint('a', -12, 12, [0])
    const b = this.quotaRandint('b', -4, 4, [-1, 0, 1])
    const c = this.quotaRandint('c', 2, 6)
    if (a > 0 && b > 0) {
      a = -a
    }
    if (this.quotaChoice('booleen', [true, false])) {
      this.question = `Calculer $${a}${ecritureAlgebrique(b)}\\times ${c}$.`
      if (context.isDiaporama) {
        this.question = `$${a}${ecritureAlgebrique(b)}\\times ${c}$`
      }
      this.correction = `La multiplication étant prioritaire sur l'addition, on commence par effectuer le produit $${b}\\times ${ecritureParentheseSiNegatif(c)}=${b * c}$.<br>
      Ainsi, $${a}${ecritureAlgebrique(b)}\\times ${c}=${a}${ecritureAlgebrique(b * c)}=${miseEnEvidence(a + b * c)}$.`
    } else {
      this.question = `Calculer $${a}${ecritureAlgebrique(c)}\\times ${ecritureParentheseSiNegatif(b)}$.`
      if (context.isDiaporama) {
        this.question = `$${a}${ecritureAlgebrique(c)}\\times ${ecritureParentheseSiNegatif(b)}$`
      }
      this.correction = `La multiplication étant prioritaire sur l'addition, on commence par effectuer le produit $${c}\\times ${ecritureParentheseSiNegatif(b)}=${b * c}$.<br>
      Ainsi, $${a}${ecritureAlgebrique(c)}\\times ${ecritureParentheseSiNegatif(b)}=${a}${ecritureAlgebrique(b * c)}=${miseEnEvidence(a + b * c)}$.`
    }
    this.reponse = a + b * c
  }
}
