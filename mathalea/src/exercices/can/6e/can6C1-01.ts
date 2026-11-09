import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Rechercher un terme dans une somme'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '2e274'

export const refs = {
  'fr-fr': ['can6C1-01'],
  'fr-ch': ['PR-18'],
}

export default class AdditionATrou extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: '<br>' }
     this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 5, 9)
    const b = this.quotaRandint('b', 6, 9)
    const c = this.quotaRandint('c', 1, 5)
    const d = this.quotaRandint('d', 1, 4)
    this.reponse = d * 10 + b
    this.question = `Compléter : $${c * 10 + a} + \\dots = ${(c + d) * 10 + b + a}$`
    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = `$${c * 10 + a} + \\dots = ${(c + d) * 10 + b + a}$`
    this.correction = `On obtient le nombre cherché par la différence : $${(c + d) * 10 + b + a} - ${c * 10 + a} = ${this.reponse}$.<br>
    L'égalité est donc : $${c * 10 + a} + ${miseEnEvidence(this.reponse)} = ${(c + d) * 10 + b + a}$.`
    this.correction += texteEnCouleur(
      `<br> Mentalement : <br>
    On complète $${c * 10 + a}$ jusqu'à la dizaine la plus proche en ajoutant $${(c + 1) * 10 - (c * 10 + a)}$, on obtient $${(c + 1) * 10}$,
    puis de $${(c + 1) * 10}$ à $${(c + d) * 10 + b + a}$, on ajoute encore $${(c + d) * 10 + b + a - (c + 1) * 10}$. <br>
    Au total
    on a donc ajouté $${(c + 1) * 10 - (c * 10 + a)}$ et  $${(c + d) * 10 + b + a - (c + 1) * 10}$ ce qui donne la réponse $${this.reponse}$.<br>
      `,
      bleuMathalea,
    )
  }
}
