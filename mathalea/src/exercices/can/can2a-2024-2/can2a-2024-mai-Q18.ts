import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer l'écriture scientifique d'un nombre"
export const interactifReady = true

export const uuid = '7nid3'
/**
 * Question 18 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ18 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = { ecritureScientifique: true }
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: '.' }
  }

  nouvelleVersion() {
    this.reponse = '3,14\\times10^{-2}'
    this.question = 'Écriture scientifique de $0,0314$ :'
    this.correction = `$0,0314 = ${miseEnEvidence('3,14\\times10^{-2}')}$`
  }
}
