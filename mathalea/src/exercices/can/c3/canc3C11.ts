import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer la moitié d’un nombre impair'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '13/09/2022'

/**
 * @author Gilles Mora
 *
 */

export const uuid = 'aee7c'

export const refs = {
  'fr-fr': ['canc3C11'],
  'fr-ch': [],
}
export default class CalculMoitieImpair extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 3, 48) * 2 + 1
    this.reponse = a / 2
    this.question = `Calculer la moitié de $${a}$. `
    this.correction = `$${a}\\div 2=${miseEnEvidence(texNombre(this.reponse))}$
         `
  }
}
