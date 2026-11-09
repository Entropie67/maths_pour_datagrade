import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer une limite avec des racines carrées'
export const dateDePublication = '10/10/2026'
export const interactifReady = true
export const uuid = '8a568'
export const refs = { 'fr-fr': ['TSA2-37'], 'fr-ch': [] }

/**
 * Limites de sommes et de différences de racines carrées.
 * @author Stéphane Guyon
 */
export default class LimitesQuantiteConjuguee extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup2 = 1
    this.besoinFormulaire2Numerique = [
      'Opération',
      3,
      '1 : Différence\n2 : Somme\n3 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const types = combinaisonListes([1, 2], this.nbQuestions)
    const operations = combinaisonListes(
      Number(this.sup2) === 1
        ? ['-']
        : Number(this.sup2) === 2
          ? ['+']
          : ['-', '+'],
      this.nbQuestions,
    )
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      const affine = types[i] === 1
      const operation = operations[i]
      const sign = choice([-1, 1])
      const a = affine ? sign * randint(1, 6) : 1
      const c = a
      const b = randint(-9, 9, 0)
      const d = randint(-9, 9, [0, b])
      const direction = sign > 0 ? '+' : '-'
      const index = `x\\to${direction}\\infty`
      const first = affine
        ? reduireAxPlusB(a, b)
        : `x^2${ecritureAlgebrique(b)}`
      const second = affine
        ? reduireAxPlusB(c, d)
        : `x^2${ecritureAlgebrique(d)}`
      const sum = `\\sqrt{${first}}+\\sqrt{${second}}`
      const expression = `\\sqrt{${first}}${operation}\\sqrt{${second}}`
      const answer = operation === '+' ? '+\\infty' : '0'

      let domain: string
      if (affine) {
        const firstBound = new FractionEtendue(-b, a).texFractionSimplifiee
        const secondBound = new FractionEtendue(-d, c).texFractionSimplifiee
        const bound =
          sign > 0
            ? -b / a >= -d / c
              ? firstBound
              : secondBound
            : -b / a <= -d / c
              ? firstBound
              : secondBound
        domain = sign > 0 ? `[${bound};+\\infty[` : `]-\\infty;${bound}]`
      } else {
        const threshold = Math.max(-b, -d)
        if (threshold <= 0) {
          domain = '\\mathbb R'
        } else {
          const root = Number.isInteger(Math.sqrt(threshold))
            ? `${Math.sqrt(threshold)}`
            : `\\sqrt{${threshold}}`
          domain = `]-\\infty;-${root}]\\cup[${root};+\\infty[`
        }
      }
      let correction = `Par calcul de limite d’une fonction composée, $\\displaystyle\\lim_{${index}}\\sqrt{${first}}=+\\infty$ et $\\displaystyle\\lim_{${index}}\\sqrt{${second}}=+\\infty$.<br>`
      if (operation === '+') {
        correction += 'Par somme, la limite vaut donc $+\\infty$.<br>'
      } else {
        const numerator = affine ? reduireAxPlusB(a - c, b - d) : `${b - d}`
        correction += `On obtient une forme indéterminée $\\infty-\\infty$.<br>
        Soit $x\\in D_f$.<br>
        $\\begin{aligned}
        f(x)&=\\sqrt{${first}}-\\sqrt{${second}}\\\\
        &=\\left(\\sqrt{${first}}-\\sqrt{${second}}\\right)\\times\\dfrac{${sum}}{${sum}}\\qquad\\text{On multiplie et on divise par la quantité conjuguée.}\\\\
        &=\\dfrac{(\\sqrt{${first}})^2-(\\sqrt{${second}})^2}{${sum}}\\qquad\\text{car }(a-b)(a+b)=a^2-b^2\\\\
        &=\\dfrac{(${first})-(${second})}{${sum}}\\\\
        &=\\dfrac{${affine ? `${reduireAxPlusB(a, b)}${c < 0 ? '+' : ''}${reduireAxPlusB(-c, -d)}` : `x^2${ecritureAlgebrique(b)}-x^2${ecritureAlgebrique(-d)}`}}{${sum}}\\\\
        &=\\dfrac{${numerator}}{${sum}}.
        \\end{aligned}$<br>`
        correction += `On a $\\displaystyle\\lim_{${index}}\\sqrt{${first}}=+\\infty$ et $\\displaystyle\\lim_{${index}}\\sqrt{${second}}=+\\infty$.<br>Par somme, $\\displaystyle\\lim_{${index}}\\left(${sum}\\right)=+\\infty$.<br>`
        correction += `Le numérateur est constant. Par quotient, $\\displaystyle\\lim_{${index}}\\dfrac{${b - d}}{${sum}}=0$.<br>`
      }

      correction += `Ainsi, $\\displaystyle\\lim_{${index}}f(x)=${miseEnEvidence(answer)}$.`
      let question = `Soit $f$ la fonction définie sur $D_f=${domain}$ par $f(x)=${expression}$.<br>Calculer $\\displaystyle\\lim_{${index}}f(x)$.`
      if (this.interactif) {
        question += `<br>$\\displaystyle\\lim_{${index}}f(x)=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierLimites)}`
      }
      if (this.questionJamaisPosee(i, expression, direction)) {
        handleAnswers(this, i, { reponse: { value: answer } })
        this.listeQuestions[i] = question
        this.listeCorrections[i] = correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
