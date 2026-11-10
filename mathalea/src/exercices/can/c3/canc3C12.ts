import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec un programme de calcul'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '17/11/2022'

/**
 * @author Gilles Mora

 */

export const uuid = '9e7c7'

export const refs = {
  'fr-fr': ['canc3C12', 'CM1N7C', 'CM2N7B'],
  'fr-ch': [],
}
export default class ProgrammeCalculInverse extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 20)
    const b = this.quotaRandint('b', 2, 5)
    let res = randint(b + 1, 15)
    // Nouveau tirage seulement si la réponse serait négative ou nulle : les autres graines gardent leurs valeurs.
    while (b * res - a <= 0) res = randint(b + 1, 15)
    this.reponse = b * res - a
    this.question = `Je pense à un nombre. J'ajoute $${a}$, puis je divise le résultat par $${b}$ et j'obtiens $${res}$. <br>
      
    Quel est ce nombre ?`
    this.correction = `Le nombre qui, divisé par $${b}$ donne $${res}$ est $${res}\\times ${b}=${res * b}$.<br>
      Le nombre qui, augmenté de $${a}$ donne $${res * b}$ est $${res * b}-${a}=${this.reponse}$.<br>
      Le nombre cherché est donc $${miseEnEvidence(this.reponse)}$.`
  }
}
