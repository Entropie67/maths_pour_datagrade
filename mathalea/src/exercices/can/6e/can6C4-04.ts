import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'

import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Utiliser la division euclidienne'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '04/10/2025'
/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '9fe05'

export const refs = {
  'fr-fr': ['can6C4-04', '6N2K-flash4'],
  'fr-ch': [],
}
export default class ResteDivisionEuclidienne2 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    let a, b, c, d, q, r

    q = this.quotaRandint('q', 11, 15)
    b = this.quotaRandint('b', 8, 11)
    r = randint(1, b - 1)
    a = b * q + r
    this.question = `   En utilisant l'égalité $${a}=(${b}\\times ${q})+${r}$, donner le reste de la division euclidienne de $${a}$ par $${b}$.`
    this.correction = `Puisque $${r}$ est strictement inférieur à $${b}$, le reste est $${miseEnEvidence(r)}$.`
    this.reponse = r
  }
}
