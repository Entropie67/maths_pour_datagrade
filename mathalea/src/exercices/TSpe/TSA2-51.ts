import { createQuestion } from '../../lib/interactif/createQuestion'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Étudier limites et asymptotes d’une fonction rationnelle'
export const dateDePublication = '28/10/2026'

export const uuid = 'eeb2a'
export const refs = {
  'fr-fr': ['TSA2-51', 'TCA2-36'],
  'fr-ch': [],
}

/** Écrit un coefficient devant une lettre, sans le 1 (`-x`, `3x`). */
function termeEnX(coefficient: number): string {
  if (coefficient === 1) return 'x'
  if (coefficient === -1) return '-x'
  return `${coefficient}x`
}

/** Écrit `+\dfrac{r}{den}` ou `-\dfrac{|r|}{den}`. */
function fractionSignee(r: number, den: string): string {
  return `${r > 0 ? '+' : '-'}\\dfrac{${Math.abs(r)}}{${den}}`
}

/** Écrit `+\dfrac{|c|}{x^k}` (ou `-`), et rien si c = 0. */
function fractionEnX(coefficient: number, puissance: number): string {
  if (coefficient === 0) return ''
  const signe = coefficient > 0 ? '+' : '-'
  const den = puissance === 1 ? 'x' : `x^{${puissance}}`
  return `${signe}\\dfrac{${Math.abs(coefficient)}}{${den}}`
}

/**
 * Synthèse sur les limites : f(x) = (m x² + B x + C)/(x - p) avec
 * f(x) = m x + n + r/(x - p). Limites en p, en ±∞, décomposition,
 * asymptote oblique.
 * @author Stéphane Guyon
 */
export default class SyntheseLimitesFonctionRationnelle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.consigne = ''
  }

  nouvelleVersion(): void {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const m = randint(2, 4) * (randint(0, 3) === 0 ? -1 : 1)
      const n = randint(-4, 4, [0])
      const p = randint(-4, 4, [0])
      const r = randint(-3, 3, [0])
      // (m x + n)(x - p) + r = m x² + B x + C
      const B = n - m * p
      const C = r - n * p
      if (B === 0 || C === 0) continue
      if (!this.questionJamaisPosee(i, m, n, p, r)) continue

      const numerateur = new Polynome({
        coeffs: [C, B, m],
        letter: 'x',
      }).toString()
      const denominateur = `x${ecritureAlgebrique(-p)}`
      const pPar = ecritureParentheseSiNegatif(p)
      const forme = `${termeEnX(m)}${ecritureAlgebrique(n)}${fractionSignee(r, denominateur)}`
      const pasDeP = `\\left]-\\infty\\,;\\,${p}\\right[\\cup\\left]${p}\\,;\\,+\\infty\\right[`
      const infini = (positif: boolean) => (positif ? '+\\infty' : '-\\infty')

      // Question 1 : limites en p
      const limiteGauche = infini(r < 0)
      const limiteDroite = infini(r > 0)
      const tableauSigne = tableauDeVariation({
        tabInit: [
          [
            ['$x$', 1.5, 10],
            [`$${denominateur}$`, 1.5, 30],
          ],
          ['$-\\infty$', 20, `$${p}$`, 20, '$+\\infty$', 20],
        ],
        tabLines: [['Line', 30, '', 0, '-', 20, 'z', 10, '+', 20, '', 0]],
        espcl: 2.5,
        lgt: 2,
      })
      const limite = (cote: '-' | '+') =>
        `\\displaystyle\\lim_{x\\to ${pPar}^{${cote}}}f(x)`
      const correction1 = `$\\displaystyle\\lim_{x\\to ${pPar}}(${numerateur})=${m}\\times ${pPar}^2${ecritureAlgebrique(B)}\\times ${pPar}${ecritureAlgebrique(C)}=${r}$<br>
Soit $x\\in \\mathbb{R}$.<br>On résout $${denominateur}>0\\iff x>${p}$.<br>
On en déduit le tableau de signes de $${denominateur}$ :<br>${tableauSigne}<br>
Pour $x<${p}$, on a $${denominateur}<0$, donc $\\displaystyle\\lim_{x\\to ${pPar}^{-}}(${denominateur})=0^-$.<br>
Pour $x>${p}$, on a $${denominateur}>0$, donc $\\displaystyle\\lim_{x\\to ${pPar}^{+}}(${denominateur})=0^+$.<br>
Par quotient, $${limite('-')}=${miseEnEvidence(limiteGauche)}$ et $${limite('+')}=${miseEnEvidence(limiteDroite)}$.<br>
La droite d’équation $x=${p}$ est une ${texteEnCouleurEtGras('asymptote verticale')} à la courbe représentative de $f$.`

      // Question 2 : limites en ±infini
      const limitePlus = infini(m > 0)
      const limiteMoins = infini(m < 0)
      const facteurNumerateur = `${m}${fractionEnX(B, 1)}${fractionEnX(C, 2)}`
      const facteurDenominateur = `1${fractionEnX(-p, 1)}`
      const correction2 = `On obtient une forme indéterminée du type « $\\dfrac{\\infty}{\\infty}$ ».<br>
On factorise le numérateur et le dénominateur par leurs termes de plus haut degré.<br>Soit $x\\neq 0$.<br>
$\\begin{aligned}
f(x)&=\\dfrac{${numerateur}}{${denominateur}}\\\\
&=\\dfrac{x^2\\left(${facteurNumerateur}\\right)}{x\\left(${facteurDenominateur}\\right)}\\\\
&=x\\times\\dfrac{${facteurNumerateur}}{${facteurDenominateur}}.
\\end{aligned}$<br>
D’après les limites de référence, pour tout entier $k\\geqslant 1$, $\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{1}{x^k}=0$.<br>
Par somme puis par quotient, $\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{${facteurNumerateur}}{${facteurDenominateur}}=${m}$.<br>
De plus, $\\displaystyle\\lim_{x\\to+\\infty}x=+\\infty$.<br>
Par produit, $\\displaystyle\\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(limitePlus)}$.<br>
De même, en $-\\infty$ : $\\displaystyle\\lim_{x\\to-\\infty}\\dfrac{1}{x^k}=0$, donc $\\displaystyle\\lim_{x\\to-\\infty}\\dfrac{${facteurNumerateur}}{${facteurDenominateur}}=${m}$.<br>
Comme $\\displaystyle\\lim_{x\\to-\\infty}x=-\\infty$, par produit, $\\displaystyle\\lim_{x\\to-\\infty}f(x)=${miseEnEvidence(limiteMoins)}$.<br>
Les limites en $+\\infty$ et en $-\\infty$ sont infinies : la courbe représentative de $f$ n’admet ${texteEnCouleurEtGras('pas d’asymptote horizontale')}.`

      // Question 3 : décomposition
      const correction3 = `Pour tout $x\\neq ${p}$ :<br>
$ax+b+\\dfrac{c}{${denominateur}}=\\dfrac{(ax+b)(${denominateur})+c}{${denominateur}}=\\dfrac{ax^2+\\left(b${ecritureAlgebriqueSauf1(-p)}a\\right)x+\\left(c${ecritureAlgebriqueSauf1(-p)}b\\right)}{${denominateur}}$.<br>
Par identification avec $f(x)$, on obtient le système :<br>
$\\begin{cases}a=${m}\\\\ b${ecritureAlgebriqueSauf1(-p)}a=${B}\\\\ c${ecritureAlgebriqueSauf1(-p)}b=${C}\\end{cases}
\\iff
\\begin{cases}a=${m}\\\\ b=${B}${ecritureAlgebrique(p)}\\times ${ecritureParentheseSiNegatif(m)}=${n}\\\\ c=${C}${ecritureAlgebrique(p)}\\times ${ecritureParentheseSiNegatif(n)}=${r}\\end{cases}$<br>
Donc, pour tout $x\\neq ${p}$ : $f(x)=${miseEnEvidence(forme)}$.`

      // Question 4 : asymptote oblique
      const correction4 = `Pour tout $x\\neq ${p}$, $g(x)=f(x)-(${termeEnX(m)}${ecritureAlgebrique(n)})=\\dfrac{${r}}{${denominateur}}$.<br>
On a $\\displaystyle\\lim_{x\\to-\\infty}(${denominateur})=-\\infty$ et $\\displaystyle\\lim_{x\\to+\\infty}(${denominateur})=+\\infty$.<br>
Par quotient :<br>
$\\displaystyle\\lim_{x\\to-\\infty}g(x)=${miseEnEvidence('0')}$ et $\\displaystyle\\lim_{x\\to+\\infty}g(x)=${miseEnEvidence('0')}$.<br>
Comme $\\displaystyle\\lim_{x\\to+\\infty}\\left[f(x)-(${termeEnX(m)}${ecritureAlgebrique(n)})\\right]=0$ et $\\displaystyle\\lim_{x\\to-\\infty}\\left[f(x)-(${termeEnX(m)}${ecritureAlgebrique(n)})\\right]=0$, la droite d’équation $y=${termeEnX(m)}${ecritureAlgebrique(n)}$ est une ${texteEnCouleurEtGras('asymptote oblique')} à la courbe représentative de $f$ en $+\\infty$ et en $-\\infty$.`

      createQuestion(this, i, {
        question: `Soit $f$ la fonction définie sur $${pasDeP}$ par $f(x)=\\dfrac{${numerateur}}{${denominateur}}$.`,
        subQuestions: [
          {
            question: `Étudier les limites de $f$ quand $x$ tend vers $${p}$ par valeurs inférieures et par valeurs supérieures.<br>Que peut-on en déduire pour la courbe représentative de $f$ ?`,
            correction: correction1,
          },
          {
            question:
              'Étudier les limites de $f$ en $+\\infty$ et en $-\\infty$. Que peut-on en déduire pour la courbe représentative de $f$ ?',
            correction: correction2,
          },
          {
            question: `Déterminer les trois réels $a$, $b$ et $c$ tels que, pour tout $x\\neq ${p}$ : $f(x)=ax+b+\\dfrac{c}{${denominateur}}$.`,
            correction: correction3,
          },
          {
            question: `Soit $g$ la fonction définie sur $${pasDeP}$ par $g(x)=f(x)-(ax+b)$.<br>Déterminer $\\displaystyle\\lim_{x\\to+\\infty}g(x)$ et $\\displaystyle\\lim_{x\\to-\\infty}g(x)$.<br>Que peut-on en déduire pour la courbe représentative de $f$ ?`,
            correction: correction4,
          },
        ],
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
