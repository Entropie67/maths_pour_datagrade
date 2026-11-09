import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texFractionFromString } from '../../../lib/outils/deprecatedFractions'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une équation du type $ax+b=0$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
  * Créé pendant l'été 2021

*/
export const uuid = '9419f'

export const refs = {
  'fr-fr': ['can3L1-02'],
  'fr-ch': [],
}
export default class EquationAXPlusBEgalZero extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', -5, 5, [0, -1, 1])
    this.reponse = this.quotaRandint('reponse', -9, 9, [-1, 0, 1])
    const b = -a * this.reponse
    this.question = `Donner la solution de l'équation :<br> $${a}x${ecritureAlgebrique(b)}=0$`
    this.correction = `On procède par étapes successives :<br>
    On commence par isoler $${a}x$ dans le membre de gauche en ajoutant
    $${ecritureAlgebrique(-b)}$ dans chacun des membres, puis on divise
    par $${a}$ pour obtenir la solution : <br>
     $\\begin{aligned}
     ${a}x${ecritureAlgebrique(b)}&=0\\\\
    ${a}x&=${ecritureAlgebrique(-b)}\\\\
    x&=${texFractionFromString(-b, a)}\\\\
    x&=${miseEnEvidence(this.reponse)}
    \\end{aligned}$
   `
  }
}
