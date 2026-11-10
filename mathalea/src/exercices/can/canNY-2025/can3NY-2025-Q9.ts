import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = ''
export const interactifReady = true

export const uuid = 'f08fe'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class calcAvecChiffresPrio extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const b = this.quotaChoice('b', [2, 5, 10, 20, 100, 1000])
    if (this.quotaChoice('choix', [true, false])) {
      this.question = `Quel est le plus grand entier multiple de $${texNombre(b)}$ strictement inférieur à $${texNombre(2025, 0)}$ ?`
      if (2025 % b === 0) {
        this.reponse = texNombre(2025 - b, 0)
        this.correction = `Comme $${texNombre(2025, 0)}$ est lui-même divisible par $${texNombre(b, 0)}$, le plus grand multiple cherché est $${texNombre(2025, 0)}-${texNombre(b, 0)}=${miseEnEvidence(this.reponse)}$.`
      } else {
        this.reponse = texNombre(Math.floor(2025 / b) * b, 0)
        this.correction = `Comme $${texNombre(b, 0)}\\times ${texNombre(Math.floor(2025 / b))} =${texNombre(Math.floor(2025 / b) * b, 0)} < ${texNombre(2025, 0)}$ et
  $ ${texNombre(b, 0)}\\times${texNombre(Math.floor(2025 / b) + 1, 0)}=${texNombre(Math.floor(2025 / b + 1) * b, 0)} > ${texNombre(2025, 0)}$,
  alors le plus grand multiple cherché est $${miseEnEvidence(this.reponse)}$.`

        // EE : Elle est chaude cette correction ci-dessus.... On pourrait la simplifier.
      }
    } else {
      this.question = `Quel est le plus petit entier multiple de $${texNombre(b, 0)}$ strictement supérieur à $${texNombre(2025)}$ ?`
      if (2025 % b === 0) {
        this.reponse = texNombre(2025 + b, 0)
        this.correction = `Comme $${texNombre(2025, 0)}$ est lui-même divisible par $${b}$, le plus petit multiple cherché est $${texNombre(2025, 0)}+${b}=${miseEnEvidence(this.reponse)}$.`
      } else {
        this.reponse = texNombre(Math.ceil(2025 / b) * b, 0)
        this.correction = ` Comme $${texNombre(b)}\\times ${texNombre(Math.ceil(2025 / b) - 1)} =${texNombre(Math.ceil(2025 / b) * b - b, 0)} < ${texNombre(2025, 0)}$ et
        $ ${texNombre(b)}\\times${texNombre(Math.ceil(2025 / b))}=${texNombre(Math.ceil(2025 / b) * b, 0)} > ${texNombre(2025, 0)}$,
        alors le plus petit multiple cherché est $${miseEnEvidence(this.reponse)}$.`
      }
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
