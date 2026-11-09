import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer la médiane d'une série"
export const interactifReady = true

export const uuid = '4a6gv'
/**
 * Question 8 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ8 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    this.reponse = '10'
    this.question =
      'Médiane de la série ;<br>$15\\;;\\;2\\;;\\;12\\;;\\;10\\;;\\;7$ :'
    this.correction = `Série ordonnée : $2\\;;\\;7\\;;\\;10\\;;\\;12\\;;\\;15$<br>L'effectif total est 5 donc la médiane est la 3e valeur : $${miseEnEvidence('10')}$.`
  }
}
