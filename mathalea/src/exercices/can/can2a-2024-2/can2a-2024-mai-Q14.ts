import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer le périmètre d'un carré connaissant son aire"
export const interactifReady = true

export const uuid = 'h4ihm'
/**
 * Question 14 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ14 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' $\\text{cm}$' }
  }

  nouvelleVersion() {
    this.reponse = '28'
    this.question = "Quel est le périmètre d'un carré de $49\\text{ cm}^2$ ?"
    this.correction = `L'aire est de $49\\text{ cm}^2$ donc c'est un carré de $7\\text{ cm}$ de côté.<br> Son périmètre est : $4 \\times 7\\text{ cm} = ${miseEnEvidence('28')}\\text{ cm}$`
  }
}
