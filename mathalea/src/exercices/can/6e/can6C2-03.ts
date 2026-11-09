import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Soustraire $10n + 9$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '592c7'

export const refs = {
  'fr-fr': ['can6C2-03', 'CM2N4J-flash2'],
  'fr-ch': [],
}
export default class SoustraireX9 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.consigne = `Calculer${sp()}:`
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 5, 9)
    const b = this.quotaRandint('b', 1, 8)
    const c = this.quotaRandint('c', 1, 4)
    this.reponse = a * 10 + b - c * 10 - 9
    this.question = `$${a * 10 + b} - ${c * 10 + 9}$`
    this.correction = `$${a * 10 + b} - ${c * 10 + 9}= ${miseEnEvidence(this.reponse)}$<br>`
    this.correction += texteEnCouleur(
      `<br> Mentalement${sp()}: <br>
    Soustraire $${c * 10 + 9}$ revient à soustraire $${c * 10 + 10}$, puis à ajouter $1$.<br>
    Ainsi, $${a * 10 + b} - ${c * 10 + 9}=${a * 10 + b} - ${c * 10 + 10}+1=${a * 10 + b - c * 10 - 10}+1=${this.reponse}$.
       `,
      bleuMathalea,
    )
  }
}
