import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Résoudre une inéquation avec une valeur absolue'
export const interactifReady = true

export const uuid = 'j4pr1'
/**
 * Question 15 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ15 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.optionsDeComparaison = { intervalle: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    this.reponse = ']-1;3['
    this.question =
      "Quel est l'intervalle de l'ensemble des solutions de l'équation $\\rvert x-1 \\rvert < 2$ ?"
    this.correction = `$S=${miseEnEvidence(']-1\\;;\\;3[')}$`
  }
}
