import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une expression pour une valeur particulière'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Gilles Mora
 * Réference : can4L2-03
 */
export const uuid = 'e75ae'

export const refs = {
  'fr-fr': ['can4L2-03', '2L10-flash1'],
  'fr-ch': [],
}
export default class CalculSubstitution extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, d
    switch (this.quotaRandint('cas', 1, 4)) {
      case 1:
        a = randint(-5, -1)
        b = randint(1, 9)
        d = randint(1, 9)
        this.reponse = a ** 2 + b
        this.question = `Calculer $x^2+${b}$ pour $x=${a}$.`
        this.correction = `$(${a})^2+${b}=${miseEnEvidence(a ** 2 + b)}$.`
        break
      case 2:
        a = randint(2, 7)
        b = randint(1, 9)
        d = randint(1, 9)
        this.reponse = -b + a ** 2
        this.question = `Calculer $-${b}+x^2$ pour $x=${a}$.`
        this.correction = `$-${b}+(${a})^2=${miseEnEvidence(-b + a * a)}$.`
        break
      case 3:
        a = randint(2, 9)
        b = randint(1, 9)
        d = randint(1, 9)
        this.reponse = a - a * a
        this.question = `Calculer $x-x^2$ pour $x=${a}$.`
        this.correction = `$${a}-${a}^2=${miseEnEvidence(a - a ** 2)}$.`
        break
      case 4:
        a = randint(1, 6)
        b = randint(1, 9)
        d = randint(1, 9)
        this.reponse = a ** 2 + a - d
        this.question = `Calculer $x^2+x-${d}$ pour $x=${a}$.`
        this.correction = `$(${a})^2+${a}-${d}=${miseEnEvidence(a ** 2 + a - d)}$.`
        break
    }
  }
}
