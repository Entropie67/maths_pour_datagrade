import { isEqual, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../../lib/interactif/createQuestion'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Déterminer une borne connaissant la valeur moyenne'
export const dateDePublication = '27/10/2026'
export const uuid = '4b128'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-13'] }

const frac = (num: number, den = 1) => new FractionEtendue(num, den).simplifie()
const pgcd = (x: number, y: number): number =>
  y === 0 ? Math.abs(x) : pgcd(y, x % y)

/** Calcul en mode affiché : en Typst, un aligned en ligne n'aligne pas sa première ligne. */
const bloc = (tex: string) =>
  context.isTypst ? `$$${tex}$$` : `<br>$${tex}$<br>`

const polynome = (coeffs: FractionEtendue[], lettre: string) =>
  Polynome.fromRationalCoefficients(coeffs, lettre)

/** Coefficients entiers, premier coefficient positif, divisés par leur pgcd : [a, b, c] pour ax² + bx + c. */
function trinomeEntier(coeffs: FractionEtendue[]): [number, number, number] {
  const den = coeffs.reduce((d, c) => (d * c.den) / pgcd(d, c.den), 1)
  let [c, b, a] = coeffs.map((x) => (x.num * den) / x.den)
  if (a < 0) [a, b, c] = [-a, -b, -c]
  const g = pgcd(pgcd(a, b), c)
  return [a / g, b / g, c / g]
}

/** Résolution détaillée de ax² + bx + c = 0 par le discriminant (Δ carré parfait). */
function resolution(a: number, b: number, c: number): string {
  const delta = b * b - 4 * a * c
  const r = Math.round(Math.sqrt(delta))
  const solutions = [frac(-b - r, 2 * a), frac(-b + r, 2 * a)]
  return (
    `$\\Delta=${b < 0 ? `(${b})` : b}^2-4\\cdot ${a}\\cdot ${c < 0 ? `(${c})` : c}=${delta}$, d'où ` +
    solutions
      // \frac en ligne : un \dfrac décale la ligne de base en Typst.
      .map(
        (x, k) =>
          `$b_${k + 1}=${x.texFractionSimplifiee.replace('\\dfrac', '\\frac')}$`,
      )
      .join(' et ') +
    '.'
  )
}

/**
 * f(x) = px² + qx + r, valeur moyenne μ(b) sur [0 ; b], puis b tel que μ(b) = m.
 * Le tirage garantit une moyenne entière et une seule solution b > 0.
 */
function tirer() {
  for (;;) {
    const p = choice([0, 0, 1, 1, 2, 3, -1])
    const q = randint(-6, 6)
    const r = randint(-5, 5)
    const b = randint(2, 6)
    if (p === 0 && q === 0) continue
    const f = polynome([frac(r), frac(q), frac(p)], 'x')
    const mu = polynome([frac(r), frac(q, 2), frac(p, 3)], 'b')
    const m = mu.evaluateExact(b)
    if (m.den !== 1) continue
    // μ(b) = m doit avoir une seule solution strictement positive.
    if (p !== 0 && (3 * (r - m.num)) / p > 0) continue
    const F = Polynome.fromRationalCoefficients(f.primitive0().monomes, 'x')
    const Fb = Polynome.fromRationalCoefficients(F.monomes, 'b')
    const [ea, eb, ec] = trinomeEntier([
      frac(r - m.num),
      frac(q, 2),
      frac(p, 3),
    ])
    const trinome = polynome([frac(ec), frac(eb), frac(ea)], 'b').toLatex()
    const debut = `\\mu(b)=${m.num}&\\iff ${mu.toLatex()}=${m.num}`
    const correctionB =
      p === 0
        ? `On résout l'équation $\\mu(b)=${m.num}$ :` +
          bloc(
            `\\begin{aligned}${debut}\\\\&\\iff b=${miseEnEvidence(String(b))}\\end{aligned}`,
          )
        : `On résout l'équation $\\mu(b)=${m.num}$ :` +
          bloc(
            `\\begin{aligned}${debut}\\\\&\\iff ${trinome}=0\\end{aligned}`,
          ) +
          `${resolution(ea, eb, ec)} Comme $b>0$, on retient $b=${miseEnEvidence(String(b))}$.`
    return {
      enonce: `Soit $f\\colon\\mathbb{R}\\to\\mathbb{R}$ la fonction définie par $f(x)=${f.toLatex()}$ et $b>0$ un réel.`,
      mu: mu.toLatex(),
      b,
      correctionA:
        'La valeur moyenne de $f$ sur $[0;b]$ est :' +
        bloc(
          `\\begin{aligned}\\mu(b)&=\\dfrac{1}{b-0}\\int_{0}^{b}f(x)\\,\\mathrm{d}x` +
            `\\\\&=\\dfrac{1}{b}\\left[${F.toLatex()}\\right]_{0}^{b}` +
            `\\\\&=\\dfrac{1}{b}\\left(${Fb.toLatex()}\\right)` +
            `\\\\&=${miseEnEvidence(mu.toLatex())}\\end{aligned}`,
        ),
      m: m.num,
      correctionB,
    }
  }
}

/**
 * Valeur moyenne d'une fonction polynomiale sur [0 ; b] en fonction de b, puis
 * borne b pour laquelle cette valeur moyenne est donnée.
 * @author Nathan Scheinmann
 */
export default class BorneValeurMoyenne extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacingCorr = 2
    this.comment =
      "La fonction est affine ou du second degré. La valeur moyenne $\\mu(b)$ sur $[0;b]$ est donc affine ou du second degré en $b$, et l'équation $\\mu(b)=m$ se résout directement ou avec le discriminant. Le tirage garantit une valeur moyenne entière et une seule solution $b>0$. Chaque question compte deux réponses, donc deux points."
  }

  nouvelleVersion() {
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const t = tirer()
      if (!this.questionJamaisPosee(i, t.enonce)) continue
      createQuestion(this, i, {
        question: t.enonce,
        correction: '',
        subQuestions: [
          {
            question:
              'Exprimer en fonction de $b$ la valeur moyenne $\\mu(b)$ de $f$ sur $[0;b]$.' +
              (this.interactif ? '<br>$\\mu(b)=$ %{0}' : ''),
            answer: { value: t.mu, compare: seq([isEqual()]) },
            field: { keyboard: KeyboardType.clavierDeBaseAvecVariable },
            correction: t.correctionA,
          },
          {
            question:
              `Déterminer $b$ pour que la valeur moyenne de $f$ sur $[0;b]$ soit égale à $${t.m}$.` +
              (this.interactif ? '<br>$b=$ %{0}' : ''),
            answer: { value: String(t.b), compare: seq([isEqual()]) },
            field: { keyboard: KeyboardType.clavierDeBase },
            correction: t.correctionB,
          },
        ],
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
