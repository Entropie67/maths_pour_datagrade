import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un agrandissement/réduction avec fraction'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Gilles Mora
 * Créé pendant l'été 2021

 */
export const uuid = '4a666'

export const refs = {
  'fr-fr': ['can2G1-02'],
  'fr-ch': ['10CTFA1A-5', '10LCFA1A-5', '10LSFA1A-5'],
}
export default class AgrandissementReductionGFraction extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const listeFractions = [
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 6],
      [5, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [1, 8],
      [3, 8],
      [5, 8],
      [7, 8],
      [1, 9],
      [2, 9],
      [4, 9],
      [5, 9],
      [7, 9],
      [8, 9],
      [1, 10],
      [3, 10],
      [7, 10],
      [9, 10],
    ] // Couples de nombres premiers entre eux
    let n, d, fraction
    switch (this.quotaChoice('type', ['a', 'b'])) {
      case 'a':
        fraction = choice(listeFractions)
        n = fraction[0]
        d = fraction[1]

        this.question = `Les longueurs d'un triangle sont multipliées par $\\dfrac{${n}}{${d}}$.<br>
        
        Par quelle fraction est multipliée son aire  ?
        `

        this.reponse = new FractionEtendue(n * n, d * d)
        this.correction = ` Si les longueurs sont multipliées par $k$, les aires sont multipliées par $k^2$.<br>
        Ainsi, l'aire a été multipliée par : $\\left(\\dfrac{${n}}{${d}}\\right)^2=${miseEnEvidence(`\\dfrac{${n * n}}{${d * d}}`)}$.
          `
        break
      case 'b':
        fraction = choice(listeFractions)
        n = fraction[0]
        d = fraction[1]

        this.question = `L'aire d'un parallélogramme a été multipliée par $\\dfrac{${n * n}}{${d * d}}$.<br>

        Par quelle fraction ont été multipliées les longueurs de ses côtés ?
        `

        this.reponse = new FractionEtendue(n, d)
        this.correction = `Si les aires sont multipliées par $k$, les longueurs sont multipliées par $\\sqrt{k}$.<br>
        Ainsi, les longueurs ont été multipliées par  : $\\sqrt{\\dfrac{${n * n}}{${d * d}}}=${miseEnEvidence(`\\dfrac{${n}}{${d}}`)}$.
    <br>`
        break
    }
  }
}
