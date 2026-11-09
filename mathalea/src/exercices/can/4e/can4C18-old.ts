// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f84d1 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Décomposer une fraction'
export const interactifReady = true

export const amcReady = true
export const dateDePublication = '09/09/2023'

/**
 * @author Gilles Mora

 */

export const uuid = 'f84d1'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class DecomposerFractionOld extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { expressionNumerique: true }
  }

  nouvelleVersion() {
    const listeFractions = [
      [8, 7],
      [10, 3],
      [20, 3],
      [11, 4],
      [31, 4],
      [29, 5],
      [27, 5],
      [38, 5],
      [41, 5],
      [11, 6],
      [57, 7],
      [19, 7],
      [29, 7],
      [30, 7],
      [40, 7],
      [50, 7],
      [60, 7],
      [13, 8],
      [35, 8],
      [51, 8],
      [79, 8],
      [7, 2],
      [10, 9],
      [20, 9],
      [49, 9],
      [91, 9],
      [70, 9],
      [80, 9],
      [19, 10],
      [27, 10],
      [73, 10],
      [97, 10],
      [51, 10],
      [13, 11],
      [9, 4],
    ]
    const fraction1 = this.quotaChoice('fraction1', listeFractions)
    const n = fraction1[0]
    const d = fraction1[1]
    const frac = new FractionEtendue(n - Math.trunc(n / d) * d, d)
    this.reponse = `${Math.trunc(n / d)}+${frac.texFractionSimplifiee}`
    this.question = `Écrire $\\dfrac{${n}}{${d}}$ sous la forme de la somme d'un nombre entier et d'une fraction inférieure à 1.`
    if (this.interactif) {
      this.question += `<br> $\\dfrac{${n}}{${d}}=$`
    }
    this.correction = `Le plus grand multiple de $${d}$ inférieur à $${n}$ est $${Math.trunc(n / d) * d}$. <br>
    Ainsi, $\\dfrac{${n}}{${d}}=\\dfrac{${Math.trunc(n / d) * d}}{${d}}+\\dfrac{${n - Math.trunc(n / d) * d}}{${d}}=${miseEnEvidence(this.reponse)}$.`
  }
}
