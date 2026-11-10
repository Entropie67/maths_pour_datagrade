import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une vitesse moyenne'
export const interactifReady = true

export const uuid = 'sn3mk'
/**
 * Question 11 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ11 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    this.reponse = '9'
    this.question =
      'Si je parcours $1,5\\text{ km}$ en $10~\\text{min}$, quelle est ma vitesse moyenne en $\\text{km/h}$ ?'
    this.correction = `$1,5\\text{ km}$ en $10~\\text{min}$ donc $1,5\\text{ km} \\times 6 = 9\\text{ km}$ en une heure.<br>Ma vitesse moyenne est donc de $${miseEnEvidence('9')}~\\text{km/h}$.`
  }
}
