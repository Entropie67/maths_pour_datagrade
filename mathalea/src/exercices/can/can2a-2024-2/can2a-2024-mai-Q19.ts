import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Résoudre une équation produit nul'
export const interactifReady = true

export const uuid = '89zis'
/**
 * Question 19 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ19 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { suiteDeNombres: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    this.reponse = '0;3'
    this.question = 'Solutions de $x(x-3)=0$ :'
    this.correction = `Un produit est nul si et seulement si l'un au moins de ses facteurs est nul.<br>$S=${miseEnEvidence('\\{0\\;;\\;3\\}')}$`
  }
}
