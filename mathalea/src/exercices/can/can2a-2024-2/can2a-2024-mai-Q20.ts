import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer la valeur d'une expression littérale"
export const interactifReady = true

export const uuid = 'hpnia'
/**
 * Question 20 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ20 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: '.' }
  }

  nouvelleVersion() {
    this.reponse = '-4'
    this.question = 'Valeur de $5x - 8$ pour $x=\\dfrac{4}{5}$ :'
    this.correction = `$5\\times\\dfrac{4}{5} - 8 = 4 - 8 = ${miseEnEvidence('-4')}$`
  }
}
