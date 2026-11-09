import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Écrire avec un seul quotient'
export const interactifReady = true

export const dateDePublication = '08/12/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/

export const uuid = '05bc2'

export const refs = {
  'fr-fr': ['can2L10-02', '2L13-flash1'],
  'fr-ch': ['NR'],
}
export default class ÉcrireUnQuotient extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsChampTexte = { texteAvant: '<br> ' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    switch (this.quotaChoice('cas', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) {
      case 1:
        {
          const a = randint(1, 9)
          const b = randint(-9, 9, 0)
          this.question = ` Écrire avec un seul quotient : $${rienSi1(b)}x+\\dfrac{${a}}{x}$.`
          this.correction = `$${rienSi1(b)}x+\\dfrac{${a}}{x}=\\dfrac{${rienSi1(b)}x^2}{x}+\\dfrac{${a}}{x}=${miseEnEvidence(`\\dfrac{${rienSi1(b)}x^2+${a}}{x}`)}$`
          this.reponse = [`\\dfrac{${b}x^2+${a}}{x}`]
        }
        break
      case 2:
        {
          const a = randint(1, 9)
          const b = randint(-9, 9, 0)
          this.question = ` Écrire avec un seul quotient : $${rienSi1(b)}x-\\dfrac{${a}}{x}$.`
          this.correction = `$${rienSi1(b)}x-\\dfrac{${a}}{x}=\\dfrac{${rienSi1(b)}x^2}{x}-\\dfrac{${a}}{x}=${miseEnEvidence(`\\dfrac{${rienSi1(b)}x^2-${a}}{x}`)}$`
          this.reponse = [`\\dfrac{${b}x^2-${a}}{x}`]
        }
        break
      case 3:
        {
          const a = randint(1, 9)
          const b = randint(-9, 9, 0)

          this.question = ` Écrire avec un seul quotient : $${rienSi1(b)}x^2-\\dfrac{${a}}{x}$.`
          this.correction = `$${rienSi1(b)}x^2-\\dfrac{${a}}{x}=\\dfrac{${rienSi1(b)}x^3}{x}-\\dfrac{${a}}{x}=${miseEnEvidence(`\\dfrac{${rienSi1(b)}x^3-${a}}{x}`)}$`
          this.reponse = [`\\dfrac{${b}x^3-${a}}{x}`]
        }
        break
      case 4:
        {
          const a = randint(1, 9)
          const b = randint(-9, 9, 0)
          this.question = ` Écrire avec un seul quotient : $${rienSi1(b)}x^2+\\dfrac{${a}}{x}$.`
          this.correction = `$${rienSi1(b)}x^2+\\dfrac{${a}}{x}=\\dfrac{${rienSi1(b)}x^3}{x}+\\dfrac{${a}}{x}=${miseEnEvidence(`\\dfrac{${rienSi1(b)}x^3+${a}}{x}`)}$`
          this.reponse = [`\\dfrac{${b}x^3+${a}}{x}`]
        }
        break
      case 5:
        {
          const a = randint(1, 9)
          const b = randint(-9, 9, 0)
          this.question = ` Écrire avec un seul quotient : $${b}+\\dfrac{${a}}{x}$.`
          this.correction = `$${b}+\\dfrac{${a}}{x}=\\dfrac{${rienSi1(b)}x}{x}+\\dfrac{${a}}{x}=${miseEnEvidence(`\\dfrac{${rienSi1(b)}x+${a}}{x}`)}$`
          this.reponse = [`\\dfrac{${b}x+${a}}{x}`]
        }
        break
      case 6:
        {
          const a = randint(1, 9)
          const b = randint(-9, 9, 0)
          this.question = ` Écrire avec un seul quotient : $${b}-\\dfrac{${a}}{x}$.`
          this.correction = `$${b}-\\dfrac{${a}}{x}=\\dfrac{${rienSi1(b)}x}{x}-\\dfrac{${a}}{x}=${miseEnEvidence(`\\dfrac{${rienSi1(b)}x-${a}}{x}`)}$`
          this.reponse = [`\\dfrac{${b}x-${a}}{x}`]
        }
        break

      case 7:
        {
          const a = randint(1, 9)
          const b = randint(-9, 9, 0)
          this.question = ` Écrire avec un seul quotient : $${b}+\\dfrac{${a}}{x^2}$.`
          this.correction = `$${b}+\\dfrac{${a}}{x^2}=\\dfrac{${rienSi1(b)}x^2}{x^2}+\\dfrac{${a}}{x^2}=${miseEnEvidence(`\\dfrac{${rienSi1(b)}x^2+${a}}{x^2}`)}$`
          this.reponse = [`\\dfrac{${b}x^2+${a}}{x^2}`]
        }
        break
      case 8:
        {
          const a = randint(1, 9)
          const b = randint(-9, 9, 0)
          this.question = ` Écrire avec un seul quotient : $${b}-\\dfrac{${a}}{x^2}$.`
          this.correction = `$${b}-\\dfrac{${a}}{x^2}=\\dfrac{${rienSi1(b)}x^2}{x^2}-\\dfrac{${a}}{x^2}=${miseEnEvidence(`\\dfrac{${rienSi1(b)}x^2-${a}}{x^2}`)}$`
          this.reponse = [`\\dfrac{${b}x^2-${a}}{x^2}`]
        }
        break
      case 9:
        {
          const a = randint(2, 9)
          const b = randint(-9, 9, 0)

          this.question = ` Écrire avec un seul quotient : $${b}+\\dfrac{x}{${a}}$.`
          this.correction = `$${b}+\\dfrac{x}{${a}}=\\dfrac{${a * b}}{${a}}+\\dfrac{x}{${a}}=${miseEnEvidence(`\\dfrac{${a * b}+x}{${a}}`)}$`
          this.reponse = [`\\dfrac{${a * b}+x}{${a}}`]
        }
        break
      case 10:
        {
          const a = randint(2, 9)
          const b = randint(-9, 9, 0)
          this.question = ` Écrire avec un seul quotient : $${b}-\\dfrac{x}{${a}}$.`
          this.correction = `$${b}-\\dfrac{x}{${a}}=\\dfrac{${a * b}}{${a}}-\\dfrac{x}{${a}}=${miseEnEvidence(`\\dfrac{${a * b}-x}{${a}}`)}$`
          this.reponse = [`\\dfrac{${a * b}-x}{${a}}`]
        }
        break
    }
  }
}
