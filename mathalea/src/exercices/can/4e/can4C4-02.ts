import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec une factorisation'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '08/12/2025'
/**
 * @author  Gilles Mora
 *
 *
 */

export const uuid = '1cd68'

export const refs = {
  'fr-fr': ['can4C4-02'],
  'fr-ch': [],
}
export default class MultiplierPar extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const a =
      this.quotaRandint('a1', 2, 9) * 100 +
      this.quotaRandint('a2', 7, 9) * 10 +
      this.quotaRandint('a3', 6, 9)
    const b = this.quotaChoice('b', [9, 99, 999])

    this.question = `Calculer $${a}\\times ${b}+${a}$.`
    this.correction = `Le résultat s'obtient avec une factorisation : <br>
    $\\begin{aligned}
    ${a}\\times ${b}+${a}&=${a}\\times ${b}+${a}\\times 1\\\\
    &=${a}\\times(${b}+1)\\\\
    &=${a}\\times ${texNombre(b + 1)}\\\\
    &=${miseEnEvidence(texNombre(a * b + a, 0))}
    \\end{aligned}$`
    this.reponse = a * b + a

    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = `$${a}\\times ${b}+${a}=\\ldots$`
  }
}
