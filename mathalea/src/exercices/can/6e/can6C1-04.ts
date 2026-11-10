import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { randint } from '../../../modules/outils'

import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer le double ou le triple'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = 'c3b5b'

export const refs = {
  'fr-fr': ['can6C1-04', '6P3autoA-7'],
  'fr-ch': [],
}
export default class DoubleOuTriple extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 3)
    const b = randint(1, 9, a)
    const c = a * 10 + b
    if (this.quotaChoice('doubleOuTriple', [true, false])) {
      this.reponse = 3 * c
      this.question = `Quel est le triple de $${c}$ ?`
      this.correction = `Le triple de $${c}$ est $3 \\times ${c}=${miseEnEvidence(3 * c)}$.`
    } else {
      this.reponse = 2 * c
      this.question = `Quel est le double de $${c}$ ?`
      this.correction = `Le double de $${c}$ est $2 \\times ${c}=${miseEnEvidence(2 * c)}$.`
    }
  }
}
