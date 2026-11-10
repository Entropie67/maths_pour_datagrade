import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Factoriser une expression'
export const interactifReady = true

export const dateDePublication = '21/10/2021'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = '55c60'

export const refs = {
  'fr-fr': ['can2L10-05'],
  'fr-ch': [],
}
export default class Factoriser extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsChampTexte = { texteAvant: '<br> ' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const r = this.quotaChoice('r', [2, 3, 5])
    const couplenm = this.quotaChoice('couplenm', [
      [2, 3],
      [3, 4],
      [2, 5],
      [3, 5],
      [4, 5],
      [5, 6],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [3, 8],
      [5, 8],
      [7, 8],
      [2, 9],
      [4, 9],
      [5, 9],
      [7, 9],
      [8, 9],
      [3, 10],
      [7, 10],
      [9, 10],
    ]) // n et m sont premiers entre eux
    const n = couplenm[0]
    const m = couplenm[1]

    const a = this.quotaRandint('a', 1, 9)
    const b = this.quotaRandint('b', 2, 9)
    switch (this.quotaChoice('cas', [1, 2, 3, 4, 5])) {
      case 1:
        this.question = ` Factoriser au maximum  $${n * r}x+${m * r}x^2$.` //
        this.correction = `$${r}x$ est un facteur commun aux deux termes : $${n * r}x$ et $${m * r}x^2$.<br>
         En effet :<br>
         $${n * r}x+${m * r}x^2=\\underbrace{${r}x\\times ${n}}_{${n * r}x} +\\underbrace{${r}x\\times ${m}x}_{${m * r}x^2}=${miseEnEvidence(`${r}x(${n}+${m}x)`)}.$`
        this.reponse = `${r}x(${n}+${m}x)`
        break
      case 2:
        this.question = ` Factoriser  $${r}a+${r}\\times${n}b$.` //
        this.correction = `$${r}$ est un facteur commun aux deux termes : $${r}a$ et $${r}\\times ${n}$.<br>
        Ainsi :<br>
        $${r}a+${r}\\times${n}b=${miseEnEvidence(`${r}(a+${n}b)`)}$`
        this.reponse = `${r}(a+${n}*b)`
        break
      case 3:
        this.question = ` Factoriser  $x\\times ${n}x+x\\times ${m}$.` //
        this.correction = `$x$ est un facteur commun aux deux termes : $x\\times ${n}x$ et $x\\times ${m}$.<br>
        Ainsi :<br>$x\\times ${n}x+x\\times ${m}=${miseEnEvidence(`x(${n}x+${m})`)}$`
        this.reponse = `x(${n}x+${m})`
        break
      case 4:
        this.question = ` Factoriser  $x^2-${a * a}$.` //
        this.correction = `On utilise l'égalité remarquable $a^2-b^2=(a+b)(a-b)$ avec $a=x$ et $b=${a}$.<br>
        $x^2-${a * a}=x^2-${a}^2=${miseEnEvidence(`(x-${a})(x+${a})`)}$`
        this.reponse = `(x-${a})(x+${a})`
        break
      case 5:
        this.question = ` Factoriser  $${b * b}x^2-${a * a}$.` //
        this.correction = `On utilise l'égalité remarquable $a^2-b^2=(a+b)(a-b)$ avec $a=${b}x$ et $b=${a}$.<br>
        $${b * b}x^2-${a * a}=(${b}x)^2-${a}^2=${miseEnEvidence(`(${b}x-${a})(${b}x+${a})`)}$`
        this.reponse = `(${b}x-${a})(${b}x+${a})`
        break
    }
    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
