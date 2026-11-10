import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Connaître les tables de multiplication (phrases)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '24/01/2023'

/**
 * @author Gilles Mora
 *
 */

export const uuid = 'aa8af'

export const refs = {
  'fr-fr': [
    'canc3C15',
    '5N1autoC-flash1',
    '5N3autoA-flash2',
    '5N4autoA-flash2',
  ],
  'fr-ch': [],
}
export default class TablesPhrase extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 3, 9)
    const b = this.quotaRandint('b', 3, 9)
    const c = a * b
    this.reponse = b
    this.question = `Dans $${c}$, combien de fois $${a}$ ?`
    this.correction = `Dans $${c}$, il y a $${miseEnEvidence(b)}$ fois $${a}$ car $${a}\\times ${b}=${c}$.`
  }
}
