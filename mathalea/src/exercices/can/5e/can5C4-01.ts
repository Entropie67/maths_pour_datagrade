import { bleuMathalea } from '../../../lib/colors'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../../modules/fractions'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer la fraction d’entier'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 */

export const uuid = 'e4b95'

export const refs = {
  'fr-fr': ['can5C4-01', '6N3L-flash1'],
  'fr-ch': [],
}
export default class FractionDEntierQuiVaBien extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', obtenirListeFractionsIrreductibles())
    const c = this.quotaChoice('c', [2, 3, 4, 5, 6])
    const b = a.d * c
    this.reponse = new FractionEtendue(a.n * c, 1).num
    this.question = `Calculer $${a.texFraction}\\times ${b}$ sous la forme d'un entier.`

    this.correction = `$${a.texFraction}\\times ${b}=${miseEnEvidence(a.n * c)}$<br><br>`
    this.correction += `${texteEnCouleur('Mentalement :', bleuMathalea)}<br>`
    if (a.n === 1) {
      this.correction += `${texteEnCouleur('Pour multiplier $' + b + '$ par $' + a.texFraction + '$, on divise $' + b + '$ par $' + a.d + '$ : on obtient $\\dfrac{' + b + '}{' + a.d + '}=' + b / a.d + '$.', bleuMathalea)}<br>`
      this.correction += `${texteEnCouleur('Ainsi $' + a.texFraction + '\\times ' + b + ' = \\dfrac{' + b + '}{' + a.d + '}=' + a.n * c + '$.<br>', bleuMathalea)}`
    } else {
      this.correction += `${texteEnCouleur('Pour multiplier $' + b + '$ par $' + a.texFraction + '$, on commence par diviser  $' + b + '$ par $' + a.d + '$ (car la division «\u00a0tombe juste\u00a0») : on obtient $\\dfrac{' + b + '}{' + a.d + '}=' + b / a.d + '$.', bleuMathalea)}<br>`
      this.correction += `${texteEnCouleur('Puis, on multiplie ce résultat par $' + a.n + '$, ce qui donne : $' + a.n + '\\times ' + b / a.d + '=' + a.n * c + '$.<br>', bleuMathalea)}`
    }
  }
}
