import { miseEnEvidence } from '../../../lib/outils/embellissements'
/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/view.capytale.save.can.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer le double ou la moitié'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '16/11/2021'

/**
 * @author Jean-claude Lhote
 * Date de publication 16/11/2021

 */
export const uuid = '4ba86'

export const refs = {
  'fr-fr': ['canc3C04'],
  'fr-ch': [],
}
export default class DoubleOuBienMoitie extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    let a =
      this.quotaRandint('dizaine', 2, 4) * 10 + this.quotaRandint('unite', 1, 9)
    if (this.quotaChoice('doubleOuMoitie', [true, false])) {
      this.reponse = a << 1
      this.question = `Calculer le double de $ ${a} $.`
      this.correction = `$${a}\\times 2 = ${miseEnEvidence(a << 1)}$`
    } else {
      if (a % 2 === 1) {
        a++
      }
      this.question = `Calculer la moitié de $ ${a} $.`
      this.reponse = a >> 1
      this.correction = `$${a}\\div 2 = ${miseEnEvidence(a >> 1)}$`
    }
  }
}
