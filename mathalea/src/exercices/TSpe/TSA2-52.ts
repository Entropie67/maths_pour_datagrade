import { createSubQuestions } from '../../lib/interactif/subQuestions'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Étudier un quotient de fonctions exponentielles : limites, asymptotes et variations'
export const dateDePublication = '28/10/2026'

export const uuid = '24dee'
export const refs = {
  'fr-fr': ['TSA2-52'],
  'fr-ch': [],
}

const e = '\\mathrm{e}'

/** Écrit un coefficient devant une expression, sans le 1. */
function coefficientDevant(coefficient: number, expression: string): string {
  return coefficient === 1 ? expression : `${coefficient}${expression}`
}

/** Écrit `-ax` ou `-x`. */
function moinsAx(a: number): string {
  return `-${coefficientDevant(a, 'x')}`
}

/** Écrit `+\dfrac{c}{den}` ou `-\dfrac{|c|}{den}`, et rien si c = 0. */
function fractionSignee(c: number, den: string): string {
  if (c === 0) return ''
  return `${c > 0 ? '+' : '-'}\\dfrac{${Math.abs(c)}}{${den}}`
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b)
}

/**
 * Étude de f(x) = m e^x / g(x) avec g(x) = e^x - (a x + b) :
 * partie A sur la fonction auxiliaire g (variations, signe), partie B sur f
 * (ensemble de définition, limites, asymptotes, dérivée, variations).
 * Le minimum de g, a - a ln(a) - b, est strictement positif : g > 0 sur R.
 * @author Stéphane Guyon
 */
export default class QuotientExponentielLimitesVariations extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.consigne = ''
    this.besoinFormulaireCaseACocher = ['Avec le logarithme népérien', false]
    this.sup = false
  }

  nouvelleVersion(): void {
    // Une question = un problème complet (parties A et B) : les deux parties portent sur la même fonction.
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const m = randint(1, 3)
      let a = 1
      let b = 0
      let minimumNumerique = 0
      // Sans logarithme : g(x) = e^x - x - b ; avec : g(x) = e^x - ax - b, a dans {1, 2, 3}.
      do {
        a = this.sup ? randint(1, 3) : 1
        b = randint(-4, 0)
        minimumNumerique = a - a * Math.log(a) - b
      } while (minimumNumerique < 0.2)
      if (!this.questionJamaisPosee(i, m, a, b)) continue

      const expressionG = `${e}^x${moinsAx(a)}${b === 0 ? '' : ecritureAlgebrique(-b)}`
      const numerateur = coefficientDevant(m, `${e}^x`)
      const f = `\\dfrac{${numerateur}}{${expressionG}}`
      const suiteDeG = `${moinsAx(a)}${b === 0 ? '' : ecritureAlgebrique(-b)}`

      // Points critiques : g'(x) = e^x - a s'annule en ln(a), f'(x) s'annule en x0.
      const lnA = a === 1 ? '0' : `\\ln(${a})`
      const minimumExact = a === 1 ? `${1 - b}` : `${a - b}-${a}\\ln(${a})`
      const numeroX0 = a - b
      const diviseur = pgcd(numeroX0, a)
      const x0 =
        a / diviseur === 1
          ? `${numeroX0 / diviseur}`
          : `\\dfrac{${numeroX0 / diviseur}}{${a / diviseur}}`
      // \frac (et non \dfrac) en exposant et dans le tableau, pour garder une hauteur raisonnable.
      const x0Compact = x0.replace('\\dfrac', '\\frac')
      const eX0 = `${e}^{${x0Compact}}`
      const maximumF = `\\dfrac{${coefficientDevant(m, eX0)}}{${eX0}-${a}}`
      const facteurDerivee = `${numeroX0}${moinsAx(a)}`

      // Partie A
      const tableauG = tableauDeVariation({
        tabInit: [
          [
            ['$x$', 1.5, 10],
            ["$g'(x)$", 1.5, 30],
            ['$g(x)$', 3, 30],
          ],
          ['$-\\infty$', 20, `$${lnA}$`, 20, '$+\\infty$', 20],
        ],
        tabLines: [
          ['Line', 30, '', 0, '-', 20, 'z', 20, '+', 20, '', 0],
          [
            'Var',
            30,
            '+/$+\\infty$',
            30,
            `-/$${minimumExact}$`,
            80,
            '+/$+\\infty$',
            30,
          ],
        ],
        espcl: 10,
        deltacl: 1.5,
        lgt: 4,
        scale: 1,
        hauteurLignes: [15, 15, 30],
      })
      const correctionA1 = `La fonction $g$ est dérivable sur $\\mathbb{R}$ comme somme de fonctions dérivables.<br>
Pour tout réel $x$ : $g'(x)=${miseEnEvidence(`${e}^x-${a}`)}$.`

      const correctionA2 = `${texteGras('Limite en $-\\infty$ :')}<br>
$\\displaystyle\\lim_{x\\to-\\infty}${e}^x=0$ et $\\displaystyle\\lim_{x\\to-\\infty}(${suiteDeG})=+\\infty$ car $-${a}<0$.<br>
Par somme, $\\displaystyle\\lim_{x\\to-\\infty}g(x)=+\\infty$.<br>
${texteGras('Limite en $+\\infty$ :')}<br>
On a une forme indéterminée du type « $+\\infty-\\infty$ ».<br>
Soit $x>0$.<br>
$g(x)=x\\left(\\dfrac{${e}^x}{x}-${a}${fractionSignee(-b, 'x')}\\right)$.<br>
${b === 0 ? '' : `$\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{${-b}}{x}=0$.<br>\n`}Par croissance comparée, $\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{${e}^x}{x}=+\\infty$.<br>
Par somme, $\\displaystyle\\lim_{x\\to+\\infty}\\left(\\dfrac{${e}^x}{x}-${a}${fractionSignee(-b, 'x')}\\right)=+\\infty$.<br>
Comme $\\displaystyle\\lim_{x\\to+\\infty}x=+\\infty$, par produit, $\\displaystyle\\lim_{x\\to+\\infty}g(x)=+\\infty$.<br>
${texteGras("Signe de $g'(x)$ :")}<br>
$\\begin{aligned}
g'(x)>0&\\iff ${e}^x>${a}\\\\
&\\iff x>\\ln(${a})${a === 1 ? '\\\\\n&\\iff x>0' : ''}
\\end{aligned}$<br>
De plus, $g'(${lnA})=0$.<br>
$g(${lnA})=${e}^{${lnA}}${moinsAx(a).replace('x', `\\times ${a === 1 ? '0' : `\\ln(${a})`}`)}${b === 0 ? '' : ecritureAlgebrique(-b)}=${a}${a === 1 ? '' : `-${a}\\ln(${a})`}${b === 0 ? '' : ecritureAlgebrique(-b)}${a === 1 || b === 0 ? '' : `=${minimumExact}`}$${a === 1 ? `, soit $g(0)=${1 - b}$` : `, soit environ $${texNombre(minimumNumerique, 2)}$`}.<br>
${tableauG}`

      const correctionA3 = `D’après le tableau de variation, le minimum de $g$ sur $\\mathbb{R}$ est atteint en $${lnA}$ et vaut $${minimumExact}${a === 1 ? '' : `\\approx ${texNombre(minimumNumerique, 2)}`}$.<br>
Ce minimum est strictement positif : on en déduit que, pour tout réel $x$, $${miseEnEvidence('g(x)>0')}$.`

      // Partie B
      const tableauF = tableauDeVariation({
        tabInit: [
          [
            ['$x$', 1.5, 10],
            ["$f'(x)$", 1.5, 30],
            ['$f(x)$', 3.5, 30],
          ],
          ['$-\\infty$', 20, `$${x0Compact}$`, 20, '$+\\infty$', 20],
        ],
        tabLines: [
          ['Line', 30, '', 0, '+', 20, 'z', 20, '-', 20, '', 0],
          ['Var', 30, '-/$0$', 30, `+/$${maximumF}$`, 100, `-/$${m}$`, 30],
        ],
        espcl: 10,
        deltacl: 1.5,
        lgt: 4,
        scale: 1,
        hauteurLignes: [15, 15, 40],
      })
      const correctionB1 = `Le quotient $f(x)$ existe si et seulement si son dénominateur est non nul, c’est-à-dire si $g(x)\\neq 0$.<br>
D’après la partie A, pour tout réel $x$, $g(x)>0$ : le dénominateur ne s’annule jamais.<br>
Donc $f$ est ${texteGras('définie sur')} $${miseEnEvidence('\\mathbb{R}')}$.`

      const denominateurLimite = `1-${a === 1 ? '' : a}\\dfrac{x}{${e}^x}${fractionSignee(-b, `${e}^x`)}`
      const correctionB2 = `${texteGras('Limite en $-\\infty$ :')}<br>
$\\displaystyle\\lim_{x\\to-\\infty}${numerateur}=0$ et, d’après la partie A, $\\displaystyle\\lim_{x\\to-\\infty}g(x)=+\\infty$.<br>
Par quotient, $\\displaystyle\\lim_{x\\to-\\infty}f(x)=${miseEnEvidence('0')}$.<br>
${texteGras('Limite en $+\\infty$ :')}<br>
On a une forme indéterminée du type « $\\dfrac{\\infty}{\\infty}$ ». On factorise par $${e}^x$ au numérateur et au dénominateur :<br>
$f(x)=\\dfrac{${numerateur}}{${e}^x\\left(${denominateurLimite}\\right)}=\\dfrac{${m}}{${denominateurLimite}}$.<br>
Par croissance comparée, $\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{${e}^x}{x}=+\\infty$, donc $\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{x}{${e}^x}=0$${b === 0 ? '' : `, et $\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{${-b}}{${e}^x}=0$`}.<br>
Par somme puis par quotient, $\\displaystyle\\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(String(m))}$.`

      const correctionB3 = `Comme $\\displaystyle\\lim_{x\\to-\\infty}f(x)=0$, la droite d’équation $y=0$ (l’axe des abscisses) est une ${texteGras('asymptote horizontale')} à la courbe représentative de $f$ en $-\\infty$.<br>
Comme $\\displaystyle\\lim_{x\\to+\\infty}f(x)=${m}$, la droite d’équation $y=${m}$ est une ${texteGras('asymptote horizontale')} à la courbe représentative de $f$ en $+\\infty$.`

      const correctionB4 = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme quotient de fonctions dérivables dont le dénominateur ne s’annule pas.<br>
On pose $u(x)=${numerateur}$ et $v(x)=${expressionG}$. Alors $u'(x)=${numerateur}$ et $v'(x)=${e}^x-${a}$.<br>
$\\begin{aligned}
f'(x)&=\\dfrac{u'(x)v(x)-u(x)v'(x)}{\\left(v(x)\\right)^2}\\\\
&=\\dfrac{${numerateur}\\left(${expressionG}\\right)-${numerateur}\\left(${e}^x-${a}\\right)}{\\left(${expressionG}\\right)^2}\\\\
&=\\dfrac{${numerateur}\\left[\\left(${expressionG}\\right)-\\left(${e}^x-${a}\\right)\\right]}{\\left(${expressionG}\\right)^2}\\\\
&=${miseEnEvidence(`\\dfrac{${numerateur}\\left(${facteurDerivee}\\right)}{\\left(${expressionG}\\right)^2}`)}.
\\end{aligned}$`

      const correctionB5 = `Pour tout réel $x$, $\\left(${expressionG}\\right)^2>0$ et $${e}^x>0$ : $f'(x)$ est du signe de $${facteurDerivee}$.<br>
$${facteurDerivee}>0\\iff x<${x0}$ : $f$ est croissante sur $\\left]-\\infty\\,;\\,${x0}\\right]$ et décroissante sur $\\left[${x0}\\,;\\,+\\infty\\right[$.<br>
$f(${x0})=${maximumF}$ car $${e}^{${x0Compact}}-(${a}\\times ${x0}${b === 0 ? '' : ecritureAlgebrique(b)})=${e}^{${x0Compact}}-${a}$.<br>
${tableauF}`

      const partieA = createSubQuestions(this, i, [
        {
          question: "Calculer, pour tout réel $x$, $g'(x)$.",
          correction: correctionA1,
        },
        {
          question:
            'Dresser le tableau de variation de $g$, en justifiant soigneusement les limites en $-\\infty$ et en $+\\infty$.',
          correction: correctionA2,
        },
        {
          question: 'En déduire le signe de $g(x)$ sur $\\mathbb{R}$.',
          correction: correctionA3,
        },
      ])
      const partieB = createSubQuestions(this, i, [
        {
          question: 'Justifier que $f$ est définie sur $\\mathbb{R}$.',
          correction: correctionB1,
        },
        {
          question:
            'Déterminer la limite de $f$ en $-\\infty$ puis en $+\\infty$.',
          correction: correctionB2,
        },
        {
          question: 'Interpréter graphiquement ces résultats.',
          correction: correctionB3,
        },
        {
          question: `Montrer que, pour tout réel $x$, $f'(x)=\\dfrac{${numerateur}\\left(${facteurDerivee}\\right)}{\\left(${expressionG}\\right)^2}$.`,
          correction: correctionB4,
        },
        {
          question: 'Dresser le tableau de variation de $f$.',
          correction: correctionB5,
        },
      ])
      const titreA = `${texteGras('Partie A : étude d’une fonction auxiliaire')}<br>On considère la fonction $g$ définie sur $\\mathbb{R}$ par $g(x)=${expressionG}$.`
      const titreB = `${texteGras('Partie B : étude de la fonction principale')}<br>On considère la fonction $f$ définie par $f(x)=${f}$.`
      this.listeQuestions[i] =
        `${titreA}${partieA.question}<br>${titreB}${partieB.question}`
      this.listeCorrections[i] =
        `${texteGras('Partie A')}<br>${partieA.correction}<br>${texteGras('Partie B')}<br>${partieB.correction}`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
