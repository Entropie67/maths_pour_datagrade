// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid ed8da continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un multiple'
export const interactifReady = true

export const dateDePublication = '17/04/2023'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = 'ed8da'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PlusGrandMultipleOld extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 16)
    const b = this.quotaRandint('b', 2, 9)
    const c = this.quotaRandint('c', 31, 91)
    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3])) {
      case 1:
        this.question = `Quel est le plus grand entier  à deux chiffres divisible par $${a}$ ?`
        this.correction = `Cela revient à chercher le plus grand multiple de $${a}$  inférieur à $100$.<br>`
        if (100 % a === 0) {
          this.reponse = 100 - a
          this.correction += `Comme $100$ est divisible par $${a}$, le plus grand multiple cherché est $100-${a}=${miseEnEvidence(this.reponse)}$.`
        } else {
          this.reponse = Math.floor(100 / a) * a
          this.correction += ` Comme $${a}\\times ${Math.floor(100 / a)}=${Math.floor(100 / a) * a} < 100$ et
        $ ${a}\\times ${Math.floor(100 / a) + 1}=${(Math.floor(100 / a) + 1) * a} > 100$,
        alors le plus grand multiple cherché est $${miseEnEvidence(this.reponse)}$.`
        }
        break
      case 2:
        this.question = `Quel est le plus grand entier multiple de $${b}$  inférieur à $${c}$ ?`

        if (c % b === 0) {
          this.reponse = c - b
          this.correction = `Comme $${c}$ est divisible par $${b}$, le plus grand multiple cherché est $${c}-${b}=${miseEnEvidence(this.reponse)}$.`
        } else {
          this.reponse = Math.floor(c / b) * b
          this.correction = ` Comme $${b}\\times ${Math.floor(c / b)} =${Math.floor(c / b) * b} < ${c}$ et
        $ ${b}\\times${Math.floor(c / b) + 1}=${Math.floor(c / b + 1) * b} > ${c}$,
        alors le plus grand multiple cherché est $${miseEnEvidence(this.reponse)}$.`
        }
        break

      case 3:
        this.question = `Quel est le plus petit entier multiple de $${b}$  supérieur à $${c}$ ?`

        if (c % b === 0) {
          this.reponse = c + b
          this.correction = `Comme $${c}$ est divisible par $${b}$, le plus petit multiple cherché est $${c}+${b}=${miseEnEvidence(this.reponse)}$.`
        } else {
          this.reponse = Math.ceil(c / b) * b
          this.correction = ` Comme $${b}\\times ${Math.ceil(c / b) - 1} =${Math.ceil(c / b) * b - b} < ${c}$ et
        $ ${b}\\times${Math.ceil(c / b)}=${Math.ceil(c / b) * b} > ${c}$,
        alors le plus petit multiple cherché est $${miseEnEvidence(this.reponse)}$.`
        }
        break
    }
  }
}
