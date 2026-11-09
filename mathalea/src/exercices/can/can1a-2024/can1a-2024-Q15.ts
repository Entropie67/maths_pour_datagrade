import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer un terme d'une suite définie par récurrence"
export const interactifReady = true

export const uuid = 'df70c'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class termeSuite extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let a: number
    let b: number
    let u0: number
    if (this.canOfficielle) {
      a = 2
      b = 1
      u0 = 2
      this.reponse = 11
    } else {
      a = randint(-3, 3, [0, 1, -1])
      b = randint(-5, 5, 0)
      u0 = randint(1, 5)
    }
    this.reponse = a ** 2 * u0 + a * b + b
    this.question = `Soit la suite $(u_n)$ définie  par $u_0 = ${u0}$ et pour $n \\in \\mathbb{N}$, 
    $u_{n+1} = ${a}u_n ${ecritureAlgebrique(b)}$.<br>
    $u_2=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `On calcule d'abord $u_1$ : <br>   
      $\\begin{aligned}
      u_1&=${a}\\times u_0 ${ecritureAlgebrique(b)}\\\\
      u_1&=${a}\\times ${ecritureParentheseSiNegatif(u0)} ${ecritureAlgebrique(b)}\\\\
      &=${a * u0 + b}     
      \\end{aligned}$<br>
      On obtient donc pour $u_2$ :<br>
      $\\begin{aligned}
      u_2&=${a}\\times u_1 ${ecritureAlgebrique(b)}\\\\
      u_2&=${a}\\times ${ecritureParentheseSiNegatif(a * u0 + b)} ${ecritureAlgebrique(b)}\\\\
      &=${miseEnEvidence(this.reponse.toFixed(0))}     
      \\end{aligned}$`
    this.canEnonce = `Soit la suite $(u_n)$ définie  par $u_0 = ${u0}$ et pour $n \\in \\mathbb{N}$, 
      $u_{n+1} = ${a}u_n ${ecritureAlgebrique(b)}$.`
    this.canReponseACompleter = '$u_2=\\ldots$'
  }
}
