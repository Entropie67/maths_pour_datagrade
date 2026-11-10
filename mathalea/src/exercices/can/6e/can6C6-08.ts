import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre un problème par soustraction/division'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '09/02/2023'

/**
 * @author Gilles Mora
 */

export const uuid = '4a157'

export const refs = {
  'fr-fr': ['can6C6-08'],
  'fr-ch': [],
}
export default class ProblemeSoustractionDivision extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 10)
    const b = this.quotaChoice('b', [50, 100])
    const c = this.quotaRandint('c', 2, 10)
    const d = b / 10
    const res = a * b + c * d
    this.reponse = (res - a * b) / d
    this.question = `Compléter : <br>
    $${a}$ sachets de $${b}$ ballons et $\\ldots$ sachets de $${d}$ ballons contiennent $${texNombre(res, 0)}$ ballons en tout. `
    this.correction = `$${a}$ sachets de $${b}$ ballons contiennent $${a * b}$ ballons.<br>
   Puisque l'on a $${res}$ ballons au total, le nombre de sachets de $${d}$ ballons est donné par $(${res}-${a * b})\\div ${d}=${res - a * b}\\div ${d}=${miseEnEvidence(this.reponse)}$.`
    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = `$${a}$ sachets de $${b}$ ballons et $\\ldots$ sachets de $${d}$ ballons contiennent $${texNombre(res, 0)}$ ballons en tout.`
  }
}
