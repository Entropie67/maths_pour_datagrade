import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Simplifier des fractions (cas simples)'
export const interactifReady = true

export const amcReady = true
export const dateDePublication = '07/09/2023'

/**
 * @author Gilles Mora

 */

export const uuid = '471bf'

export const refs = {
  'fr-fr': ['can4C21-04'],
  'fr-ch': ['NR'],
}
export default class SimplifierFractionSimple extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    switch (
      this.quotaChoice('cas', [1, 2, 3]) // 1, 2, 3, 4, 5, 6
    ) {
      case 1:
        {
          const n = randint(-10, 10, 0)
          const d = choice([-1, 1])
          this.reponse = n * d
          this.question = `Écrire le plus simplement possible : $\\dfrac{${n}}{${d}}$.`
          this.correction = `$\\dfrac{${n}}{${d}}=${miseEnEvidence(this.reponse)}$`
        }
        break
      case 2:
        {
          const n = randint(-10, 10, 0)
          const d = n * choice([-1, 1])
          this.reponse = n / d
          this.question = `Écrire le plus simplement possible : $\\dfrac{${n}}{${d}}$.`
          this.correction = `$\\dfrac{${n}}{${d}}=${miseEnEvidence(this.reponse)}$`
        }
        break

      case 3:
        {
          const d = randint(-10, 10, [-1, 0, 1])
          const n = d * choice([-10, 10])
          this.reponse = n / d
          this.question = `Écrire le plus simplement possible : $\\dfrac{${n}}{${d}}$.`
          this.correction = `$\\dfrac{${n}}{${d}}=${miseEnEvidence(this.reponse)}$`
        }
        break
    }
  }
}
