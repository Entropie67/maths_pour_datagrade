import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une équation du type $ax+b=c$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
  * Créé pendant l'été 2021

*/
export const uuid = 'cb6b3'

export const refs = {
  'fr-fr': ['can3L1-03', '2L21-flash1'],
  'fr-ch': [],
}
export default class EquationAXPlusBEgalC extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', -5, 5, [0, -1, 1])
    this.reponse = this.quotaRandint('reponse', -9, 9, [-1, 0, 1])
    const c = this.quotaRandint('c', -9, 9, [0])
    const b = c - a * this.reponse
    this.question = `Donner la solution de l'équation : <br>$${a}x${ecritureAlgebrique(b)}=${c}$`
    this.correction = `On procède par étapes successives :<br>
    On commence par isoler $${a}x$ dans le membre de gauche en ajoutant
    $${ecritureAlgebrique(-b)}$ dans chacun des membres, puis on divise
    par $${a}$ pour obtenir la solution : <br>
     $\\begin{aligned}
     ${a}x${ecritureAlgebrique(b)}&=${c}\\\\
    ${a}x&=${c}${ecritureAlgebrique(-b)}\\\\
    ${a}x&=${c - b}\\\\
    x&=\\dfrac{${c - b}}{${a}}\\\\
    x&=${this.reponse}
    \\end{aligned}$<br>
    La solution de l'équation est : $${miseEnEvidence(this.reponse)}$.
    `
  }
}
