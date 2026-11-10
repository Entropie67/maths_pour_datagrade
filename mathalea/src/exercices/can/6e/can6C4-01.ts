import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { texteEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Trouver le reste d’une division par $3$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = 'b3aee'

export const refs = {
  'fr-fr': ['can6C4-01', '6N2J-flash2'],
  'fr-ch': [],
}

export default class ResteDivisionPar3 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const b = this.quotaRandint('b', 1, 9)
    const c = this.quotaRandint('c', 0, 9)
    const d = randint(0, 9, [b, c])
    const a = b * 100 + c * 10 + d
    this.reponse = a % 3
    this.question = `Quel est le reste de la division euclidienne de $${a}$ par $3$ ?`
    if (a % 3 === 0) {
      this.correction = `Le reste de la division de $${a}$ par $3$ est $${miseEnEvidence(a % 3)}$.`
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
      Un entier est divisible par $3$ lorsque la somme de ses chiffres est un multiple de $3$.<br>
      La somme des chiffres qui composent $${a}$ est :  $${b}+${c}+${d}=${b + c + d}$.<br>
   $${b + c + d}$ est un mutiple de $3$, donc le reste de la division de $${a}$ par $3$ est $0$.
      `, bleuMathalea)
    }
    if (a % 3 === 1) {
      this.correction = `Le reste de la division de $${a}$ par $3$ est $${miseEnEvidence(a % 3)}$.`
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
      Un entier est divisible par $3$ lorsque la somme de ses chiffres est un multiple de $3$.<br>
      La somme des chiffres qui composent $${a}$ est : $${b}+${c}+${d}=${b + c + d}$.<br>
      $${b + c + d}$ n'est pas un mutiple de $3$. <br>
      En enlevant $1$ unité à $${b + c + d}$, on obtient $${b + c + d - 1}$ qui est un multiple de $3$.<br>
      Cela signifie que $${a}-1=${a - 1}$ est un multiple de $3$.<br>
     Ainsi, le reste de la division de $${a}$ par $3$ est donc $1$.
         `, bleuMathalea)
    }
    if (a % 3 === 2) {
      this.correction = `Le reste de la division de $${a}$ par $3$ est $${miseEnEvidence(a % 3)}$.`
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
      Un entier est divisible par $3$ lorsque la somme de ses chiffres est un multiple de $3$.<br>
      La somme des chiffres qui composent $${a}$ est : $${b}+${c}+${d}=${b + c + d}$.<br>
      $${b + c + d}$ n'est pas un mutiple de $3$. <br>
      En enlevant $2$ unités à $${b + c + d}$, on obtient $${b + c + d - 2}$ qui est un multiple de $3$.<br>
      Cela signifie que $${a}-2=${a - 2}$ est un multiple de $3$.<br>
     Ainsi, le reste de la division de $${a}$ par $3$ est donc $2$.
         `, bleuMathalea)
    }
  }
}
