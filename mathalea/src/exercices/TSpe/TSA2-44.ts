import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Calculer une limite à partir d’une comparaison ou d’un encadrement'
export const dateDePublication = '09/10/2026'
export const interactifReady = true
export const dateDeModifImportante = '10/10/2026'

export const uuid = 'ea25d'
export const refs = {
  'fr-fr': ['TSA2-44', 'TCA2-44'],
  'fr-ch': [],
}

/**
 * Déduire une limite d'une comparaison affine ou d'un encadrement donné.
 * @author Stéphane Guyon
 */
export default class LimitsByComparisonOrSqueeze extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Théorème utilisé',
      3,
      '1 : Théorème de comparaison\n2 : Théorème des gendarmes\n3 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const types = combinaisonListes(
      this.sup === 1
        ? ['comparison', 'doubleComparison']
        : this.sup === 2
          ? ['squeeze']
          : ['comparison', 'doubleComparison', 'squeeze'],
      this.nbQuestions,
    )
    const signs = combinaisonListes([1, -1], this.nbQuestions)
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      if (types[i] === 'squeeze') {
        const limit = randint(-6, 6, 0)
        const lowerNumerator = randint(1, 4)
        const upperNumerator = lowerNumerator + randint(1, 4)
        const constant = randint(1, 6)
        const direction = choice(['+', '-'])
        const index = `x\\to${direction}\\infty`
        const denominator = `x^2+${constant}`
        const lower = `${limit}+\\dfrac{${lowerNumerator}}{${denominator}}`
        const upper = `${limit}+\\dfrac{${upperNumerator}}{${denominator}}`
        let statement =
          'Soit $f$ une fonction définie sur $\\mathbb R$.<br><br>'
        statement += `Pour tout $x\\in\\mathbb R$, on a $${lower}\\leqslant f(x)\\leqslant ${upper}$.<br><br>`
        if (this.interactif) {
          statement += `$\\displaystyle \\lim_{${index}}f(x)=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierLimitesSimple)}`
        } else {
          statement += `Calculer $\\displaystyle \\lim_{${index}}f(x)$.`
        }
        let correction = `On a $\\displaystyle \\lim_{${index}}(${denominator})=+\\infty$.<br>`
        correction += `Ainsi, $\\displaystyle \\lim_{${index}}\\dfrac{${lowerNumerator}}{${denominator}}=0$ et $\\displaystyle \\lim_{${index}}\\dfrac{${upperNumerator}}{${denominator}}=0$.<br>`
        correction += `On a donc $\\displaystyle \\lim_{${index}}\\left(${lower}\\right)=${limit}$ et $\\displaystyle \\lim_{${index}}\\left(${upper}\\right)=${limit}$.<br>`
        correction += `Comme $${lower}\\leqslant f(x)\\leqslant ${upper}$ pour tout réel $x$, d'après le théorème des gendarmes, $\\displaystyle \\lim_{${index}}f(x)=${miseEnEvidence(limit)}$.`
        if (
          this.questionJamaisPosee(
            i,
            'squeeze',
            limit,
            lowerNumerator,
            upperNumerator,
            constant,
            direction,
          )
        ) {
          handleAnswers(this, i, { reponse: { value: String(limit) } })
          this.listeQuestions[i] = statement
          this.listeCorrections[i] = correction
          i++
        }
        continue
      }
      const slope = signs[i] * randint(1, 6)
      const intercept = randint(-9, 9)
      const bound = new Polynome({
        coeffs: [intercept, slope],
        letter: 'x',
      }).toString()
      const doubleComparison = types[i] === 'doubleComparison'
      const otherIntercept = intercept + (slope > 0 ? 1 : -1) * randint(1, 6)
      const otherBound = new Polynome({
        coeffs: [otherIntercept, slope],
        letter: 'x',
      }).toString()
      const lower = slope > 0 ? bound : otherBound
      const upper = slope > 0 ? otherBound : bound
      const inequality = slope > 0 ? '>' : '<'
      const usefulInequality =
        slope > 0 ? `${bound}\\leqslant f(x)` : `f(x)\\leqslant ${bound}`
      const answer = slope > 0 ? '+\\infty' : '-\\infty'
      let statement =
        'Soit $f$ une fonction définie sur $[0;+\\infty[$.<br><br>'
      statement += doubleComparison
        ? `Pour tout $x\\geqslant 0$, on a $${lower}\\leqslant f(x)\\leqslant ${upper}$.<br><br>`
        : `Pour tout $x\\geqslant 0$, on a $f(x)${inequality}${bound}$.<br><br>`
      if (this.interactif) {
        statement += `$\\displaystyle \\lim_{x\\to+\\infty}f(x)=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierLimitesSimple)}`
      } else {
        statement += 'Calculer $\\displaystyle \\lim_{x\\to+\\infty}f(x)$.'
      }
      let correction = `On a $\\displaystyle \\lim_{x\\to+\\infty}(${bound})=${answer}$.<br>`
      correction += doubleComparison
        ? `L'encadrement donne en particulier $${usefulInequality}$ pour tout $x\\geqslant 0$. Cette seule inégalité suffit pour conclure.<br>`
        : `Pour tout $x\\geqslant 0$, on a $f(x)${inequality}${bound}$.<br>`
      correction += `D'après le théorème de comparaison, $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(answer)}$.`
      if (
        this.questionJamaisPosee(i, types[i], slope, intercept, otherIntercept)
      ) {
        handleAnswers(this, i, { reponse: { value: answer } })
        this.listeQuestions[i] = statement
        this.listeCorrections[i] = correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
