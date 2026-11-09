import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer la somme de décimaux qui se marient'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '11/05/2022'
/**
 * @author  Gilles Mora
 *
 *
 */
export const uuid = '843e1'

export const refs = {
  'fr-fr': ['can5C3-04', '5N2autoA-3'],
  'fr-ch': ['NR'],
}
export default class SommeDecimaux extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    let a, b, c, e, f, g, k
    const choix = this.quotaRandint('choix', 1, 3)
    if (choix === 1) {
      a = randint(1, 9)
      b = randint(1, 9)
      c = randint(1, 9)
      e = randint(1, 9)
      f = randint(1, 9, b)
      g = randint(1, 9)
      k = choice([10, 20])
      this.reponse = arrondi(k + e + f / 10 + g / 100, 2)
      if (choice([true, false])) {
        this.question = `Calculer $${texNombre(a + b / 10 + c / 100, 2)}+${texNombre(e + f / 10 + g / 100, 2)}+${texNombre(k - a - b / 10 - c / 100, 2)}$.`
        this.correction = `$${texNombre(a + b / 10 + c / 100, 2)}+${texNombre(e + f / 10 + g / 100, 2)}+${texNombre(k - a - b / 10 - c / 100, 2)}=
            \\underbrace{${texNombre(a + b / 10 + c / 100, 2)}+${texNombre(k - a - b / 10 - c / 100, 2)}}_{=${k}}+${texNombre(e + f / 10 + g / 100, 2)}=${miseEnEvidence(texNombre(this.reponse, 2))}$`
      } else {
        this.question = `Calculer $${texNombre(e + f / 10 + g / 100, 2)}+${texNombre(a + b / 10 + c / 100, 2)}+${texNombre(k - a - b / 10 - c / 100, 2)}$.`

        this.correction = `$${texNombre(e + f / 10 + g / 100, 2)}+${texNombre(a + b / 10 + c / 100, 2)}+${texNombre(k - a - b / 10 - c / 100, 2)}=
          \\underbrace{${texNombre(a + b / 10 + c / 100, 2)}+${texNombre(k - a - b / 10 - c / 100, 2)}}_{=${k}}+${texNombre(e + f / 10 + g / 100, 2)}=${miseEnEvidence(texNombre(this.reponse, 2))}$`
      }
    }
    if (choix === 2) {
      a = randint(1, 9)
      b = randint(1, 9)
      c = randint(1, 9)
      e = randint(1, 9)
      f = randint(1, 9, b)
      g = randint(1, 9)
      this.reponse = arrondi(1 + f / 10 + g / 100, 2)
      if (choice([true, false])) {
        this.question = `Calculer $${texNombre(f / 10 + g / 100, 2)}+${texNombre(b / 10 + c / 100, 2)}+${texNombre(1 - b / 10 - c / 100, 2)}$.`
        this.correction = `$${texNombre(f / 10 + g / 100, 2)}+${texNombre(b / 10 + c / 100, 2)}+${texNombre(1 - b / 10 - c / 100, 2)}=
        ${texNombre(f / 10 + g / 100, 2)}+\\underbrace{${texNombre(b / 10 + c / 100, 2)}+${texNombre(1 - b / 10 - c / 100, 2)}}_{=1}=${miseEnEvidence(texNombre(this.reponse, 2))}
            $`
      } else {
        this.question = `Calculer $${texNombre(b / 10 + c / 100, 2)}+${texNombre(f / 10 + g / 100, 2)}+${texNombre(1 - b / 10 - c / 100, 2)}$.`

        this.correction = `$${texNombre(b / 10 + c / 100, 2)}+${texNombre(f / 10 + g / 100, 2)}+${texNombre(1 - b / 10 - c / 100, 2)}=
        \\underbrace{${texNombre(b / 10 + c / 100, 2)}+${texNombre(1 - b / 10 - c / 100, 2)}}_{=1}+${texNombre(f / 10 + g / 100, 2)}=${miseEnEvidence(texNombre(this.reponse, 2))}$`
      }
    }
    if (choix === 3) {
      a = randint(1, 9)
      b = randint(1, 9)
      c = randint(1, 9)
      e = randint(1, 9)
      f = randint(1, 9, b)
      g = randint(1, 9)
      k = randint(2, 4)
      this.reponse = arrondi(k + f / 10 + g / 100, 2)
      if (choice([true, false])) {
        this.question = `Calculer $${texNombre(f / 10 + g / 100, 2)}+${texNombre(b / 10 + c / 100, 2)}+${texNombre(k - b / 10 - c / 100, 2)}$.`
        this.correction = `$${texNombre(f / 10 + g / 100, 2)}+${texNombre(b / 10 + c / 100, 2)}+${texNombre(1 - b / 10 - c / 100, 2)}=
        ${texNombre(f / 10 + g / 100, 2)}+\\underbrace{${texNombre(b / 10 + c / 100, 2)}+${texNombre(k - b / 10 - c / 100, 2)}}_{=${k}}=${miseEnEvidence(texNombre(this.reponse, 2))}
            $`
      } else {
        this.question = `Calculer $${texNombre(b / 10 + c / 100, 2)}+${texNombre(f / 10 + g / 100, 2)}+${texNombre(k - b / 10 - c / 100, 2)}$.`

        this.correction = `$${texNombre(b / 10 + c / 100, 2)}+${texNombre(f / 10 + g / 100, 2)}+${texNombre(k - b / 10 - c / 100, 2)}=
        \\underbrace{${texNombre(b / 10 + c / 100, 2)}+${texNombre(k - b / 10 - c / 100, 2)}}_{=${k}}+${texNombre(f / 10 + g / 100, 2)}=${miseEnEvidence(texNombre(this.reponse, 2))}$`
      }
    }
  }
}
