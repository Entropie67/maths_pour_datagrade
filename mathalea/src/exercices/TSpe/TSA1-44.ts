import { createList } from '../../lib/format/lists'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { scriptPython } from '../../lib/outils/scriptPython'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Étudier une suite définie par une fonction homographique'
export const dateDePublication = '31/08/2026'
export const uuid = '87fb7'
export const refs = { 'fr-fr': ['TSA1-44'], 'fr-ch': [] }

/** Adaptation aléatoire du sujet 2 du baccalauréat 2026, Asie, exercice 1. */
export default class SuiteEtFonctionHomographique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
  }

  nouvelleVersion(): void {
    const configurations = combinaisonListes(
      [
        [2, 3],
        [2, 4],
        [3, 3],
        [3, 4],
        [4, 3],
        [4, 4],
        [5, 3],
        [5, 4],
      ],
      this.nbQuestions,
    )
    for (let i = 0; i < this.nbQuestions; i++) {
      const [p, precision] = configurations[i]
      this.ajouteQuestion(p, precision)
    }
    listeQuestionsToContenu(this)
  }

  private ajouteQuestion(p: number, precision: number): void {
    const h = 10 ** -precision
    const rang = Math.ceil((1 / h - 1) / p)
    const pole = new FractionEtendue(p + 1, p).texFraction
    const poleDansLimite = pole.replace('\\dfrac', '\\frac')
    const limite = new FractionEtendue(p - 1, p).texFraction
    const f0 = new FractionEtendue(p, p + 1).texFraction
    const a = p - 1
    const ax = a === 1 ? 'x' : `${a}x`
    const numerateurF = reduireAxPlusB(a, -p)
    const denominateurF = reduireAxPlusB(p, -(p + 1))
    const numerateurSuite = reduireAxPlusB(a, -p, 'u_n')
    const denominateurSuite = reduireAxPlusB(p, -(p + 1), 'u_n')
    const f = `\\dfrac{${numerateurF}}{${denominateurF}}`
    const hTex = texNombre(h, precision)
    const programme = `def seuil(h):
    n = 0
    u = 0
    while u < 1-h:
        n = n+1
        u = (${a}*u-${p})/(${p}*u-${p + 1})
    return n`
    const partieA = texteEnCouleurEtGras('Partie A', 'black')
    const partieB = texteEnCouleurEtGras('Partie B', 'black')
    const tableauVariations = tableauDeVariation({
      tabInit: [
        [
          ['$x$', 2, 20],
          ["$f'(x)$", 2, 30],
          ['$f(x)$', 3, 30],
        ],
        ['$-\\infty$', 25, `$${pole}$`, 25],
      ],
      tabLines: [
        ['Line', 30, '', 10, '+', 20, 'd', 10],
        ['Var', 10, `-/$${limite}$`, 20, '+/$+\\infty$', 10],
      ],
      espcl: 8,
      deltacl: 1.2,
      lgt: 3.5,
      scale: 1,
    })
    const tableauSigneDenominateur = tableauDeVariation({
      tabInit: [
        [
          ['$x$', 2, 20],
          [`$${p}x-${p + 1}$`, 2, 50],
        ],
        ['$-\\infty$', 25, `$${pole}$`, 25, '$+\\infty$', 25],
      ],
      tabLines: [['Line', 30, '', 10, '-', 20, 'z', 20, '+', 10]],
      espcl: 6,
      deltacl: 1,
      lgt: 4,
      scale: 1,
    })

    const questionsPartieA = createList({
      style: 'nombres',
      items: [
        `Étudier les variations de la fonction $f$ sur son ensemble de définition.`,
        `En déduire que, pour tout $x\\in[0\\,;\\,1]$, $f(x)\\in[0\\,;\\,1]$.`,
      ],
    })
    const questionsPartieB = createList({
      style: 'nombres',
      items: [
        `Démontrer que, pour tout $n\\in\\mathbb N$, $0\\leqslant u_n\\leqslant u_{n+1}\\leqslant1$.`,
        `En déduire que $(u_n)$ converge, puis que sa limite est $1$.`,
        `On donne la fonction Python suivante${sp()}:<br>${scriptPython(programme, 7)}<br>
        On saisit cette fonction dans la calculatrice. L'appel $\\mathtt{seuil(${hTex})}$ renvoie $${texNombre(rang)}$. Interpréter cette valeur.`,
        createList({
          style: 'alpha',
          items: [
            `Donner les quatre premiers termes sous forme de fractions irréductibles.`,
            `Conjecturer l'expression de $u_n$ en fonction de $n$ et démontrer cette conjecture.`,
          ],
        }),
      ],
    })
    const enonce = `${partieA}<br><br>On considère la fonction $f$ définie sur $\\left]-\\infty\\,;\\,${pole}\\right[$ par${sp()}: \\[f(x)=${f}\\]
    ${questionsPartieA}<br>
    ${partieB}<br><br>On considère la suite $(u_n)$ définie par${sp()}:
    \\[\\begin{cases}u_0=0\\\\u_{n+1}=\\dfrac{${numerateurSuite}}{${denominateurSuite}},\\quad n\\in\\mathbb N\\end{cases}\\]
    ${questionsPartieB}`

    const termes = [0, 1, 2, 3].map((n) =>
      n === 0
        ? 'u_0=0'
        : `u_{${n}}=${new FractionEtendue(p * n, p * n + 1).texFraction}`,
    )
    const general = `\\dfrac{${p}n}{${p}n+1}`
    const seuil = texNombre(1 - h, precision)
    const correctionsPartieA = createList({
      style: 'nombres',
      items: [
        `$f$ est dérivable sur son domaine de définition.<br><br>
        On reconnaît un quotient $f=\\dfrac{u}{v}$ avec
        $u(x)=${numerateurF}$ et $v(x)=${denominateurF}$.<br><br>
        Ainsi, $u'(x)=${a}$ et $v'(x)=${p}$, donc
        \\[\\begin{aligned}
        f'(x)&=\\dfrac{u'(x)v(x)-u(x)v'(x)}{v(x)^2}\\\\
        &=\\dfrac{${a}(${p}x-${p + 1})-${p}(${ax}-${p})}{(${p}x-${p + 1})^2}\\\\
        &=\\dfrac{1}{(${p}x-${p + 1})^2}.
        \\end{aligned}\\]
        Pour tout $x\\in\\left]-\\infty\\,;\\,${pole}\\right[$, $f'(x)>0$.<br><br>
        La fonction $f$ est donc strictement croissante sur son domaine de définition.<br><br>
        Pour $x\\neq 0$, on factorise le numérateur et le dénominateur par $x$${sp()}:
        \\[f(x)=\\dfrac{x\\left(${a}-\\dfrac{${p}}x\\right)}{x\\left(${p}-\\dfrac{${p + 1}}x\\right)}
        =\\dfrac{${a}-\\dfrac{${p}}x}{${p}-\\dfrac{${p + 1}}x}.\\]
        Comme $\\displaystyle\\lim_{x\\to-\\infty}\\dfrac1x=0$, on obtient
        $\\displaystyle\\lim_{x\\to-\\infty}f(x)=${limite}$.<br><br>
        Étudions maintenant la limite à la borne supérieure du domaine.<br><br>
        D'une part,
        \\[\\lim_{x\\to${poleDansLimite}^-}(${numerateurF})=${a}\\times${pole}-${p}=-\\dfrac1{${p}}<0.\\]
        D'autre part,
        \\[${p}x-${p + 1}>0\\iff x>${pole}.\\]
        On en déduit le tableau de signes du dénominateur${sp()}:<br><br>
        ${tableauSigneDenominateur}<br><br>
        Ainsi, lorsque $x$ tend vers $${pole}$ par valeurs inférieures, le numérateur tend vers $-\\dfrac1{${p}}<0$ et le dénominateur tend vers $0$ par valeurs négatives. Par quotient,
        \\[\\lim_{x\\to${poleDansLimite}^-}f(x)=+\\infty.\\]
        On obtient finalement le tableau de variations suivant${sp()}:<br><br>
        ${tableauVariations}<br><br>
        Ainsi, $${miseEnEvidence('f')}$ ${texteEnCouleurEtGras('est strictement croissante sur')} $${miseEnEvidence(`\\left]-\\infty\\,;\\,${pole}\\right[`)}$.`,
        `Comme $x\\in[0\\,;\\,1]$, on a $0\\leqslant x\\leqslant 1$. Comme $f$ est croissante sur $[0\\,;\\,1]$, on obtient
        \\[f(0)\\leqslant f(x)\\leqslant f(1).\\]
        Or $f(0)=${f0}$ et $f(1)=1$. Ainsi,
        \\[0\\leqslant ${f0}\\leqslant f(x)\\leqslant 1,\\]
        donc $${miseEnEvidence(`f(x)\\in[0\\,;\\,1]`)}$.`,
      ],
    })
    const correctionsPartieB = createList({
      style: 'nombres',
      items: [
        `Nous allons procéder à un raisonnement par récurrence.<br>
        Pour tout entier naturel $n$, on note $\\mathcal P_n$ la propriété${sp()}:
        \\[0\\leqslant u_n\\leqslant u_{n+1}\\leqslant 1.\\]<br>
        ${texteEnCouleurEtGras(`Initialisation${sp()}:`, 'black')}<br><br>
        On a $u_0=0$ et
        \\[u_1=f(u_0)=f(0)=${f0}.\\]
        Comme $0\\leqslant ${f0}\\leqslant 1$, on a
        \\[0\\leqslant u_0\\leqslant u_1\\leqslant 1.\\]
        La propriété $\\mathcal P_0$ est donc vraie.<br><br>
        ${texteEnCouleurEtGras(`Hérédité${sp()}:`, 'black')}<br><br>
        Soit $n\\in\\mathbb N$. Supposons que la propriété $\\mathcal P_n$ est vraie, c'est-à-dire${sp()}:
        \\[0\\leqslant u_n\\leqslant u_{n+1}\\leqslant 1.\\]
        Montrons que la propriété $\\mathcal P_{n+1}$ est vraie, c'est-à-dire${sp()}:
        \\[0\\leqslant u_{n+1}\\leqslant u_{n+2}\\leqslant 1.\\]
        On a${sp()}:
        \\[0\\leqslant u_n\\leqslant u_{n+1}\\leqslant 1.\\]
        Comme $f$ est croissante sur $[0\\,;\\,1]$, les images et les antécédents sont rangés dans le même ordre${sp()}:
        \\[f(0)\\leqslant f(u_n)\\leqslant f(u_{n+1})\\leqslant f(1).\\]
        Or $f(0)=${f0}$, $f(u_n)=u_{n+1}$, $f(u_{n+1})=u_{n+2}$ et $f(1)=1$.<br><br>
        Ainsi,
        \\[0\\leqslant ${f0}\\leqslant u_{n+1}\\leqslant u_{n+2}\\leqslant 1.\\]
        La propriété $\\mathcal P_{n+1}$ est donc vraie. La propriété est héréditaire.<br><br>
        ${texteEnCouleurEtGras(`Conclusion${sp()}:`, 'black')}<br><br>
        La propriété est vraie au rang $0$ et elle est héréditaire. Donc, par récurrence, pour tout entier naturel $n$,
        $${miseEnEvidence(`0\\leqslant u_n\\leqslant u_{n+1}\\leqslant 1`)}$.`,
        `${texteEnCouleurEtGras(`Existence de la limite${sp()}:`, 'black')}<br><br>
        La suite $(u_n)$ est croissante et majorée par $1$. <br>D'après le théorème de convergence monotone, elle converge vers une limite $\\ell$.<br><br>
        De la question précédente, on déduit que${sp()}: $0\\leqslant \\ell\\leqslant1$.<br><br>
        ${texteEnCouleurEtGras(`Valeur de la limite${sp()}:`, 'black')}<br><br>
        ${createList({
          style: 'fleches',
          items: [
            `la suite $(u_n)$ converge vers $\\ell$ ;`,
            `pour tout entier naturel $n$, $u_{n+1}=f(u_n)$ ;`,
            `la fonction $f$ est continue sur $[0\\,;\\,1]$.`,
          ],
        })}
        D'après le théorème du point fixe, la limite $\\ell$ vérifie $f(\\ell)=\\ell$.<br><br>
        On résout l'équation $f(x)=x$${sp()}:
        \\[\\begin{aligned}
        f(x)=x
        &\\iff ${p}x^2-${2 * p}x+${p}=0\\\\
        &\\iff ${p}(x-1)^2=0\\\\
        &\\iff x=1.
        \\end{aligned}\\]
        On en déduit que $\\ell=1$.<br><br>
        Ainsi, $${miseEnEvidence('(u_n)')}$ ${texteEnCouleurEtGras('converge vers')} $${miseEnEvidence(1)}$.`,
        `La fonction renvoie le plus petit rang $n$ tel que $u_n\\geqslant1-${hTex}=${seuil}$.<br><br>
        À la calculatrice, en utilisant le mode «${sp()}Suite${sp()}» ou le module «${sp()}Python${sp()}», on vérifie que $u_{${texNombre(rang - 1)}}<${seuil}$ et $u_{${texNombre(rang)}}\\geqslant${seuil}$.<br><br>
        On a donc atteint le seuil $${seuil}$ pour la première fois au rang $${texNombre(rang)}$.<br><br>
        La valeur de $n$ renvoyée est $${miseEnEvidence(texNombre(rang))}$.`,
        createList({
          style: 'alpha',
          items: [
            `On a $u_0=0$, puis${sp()}:
            \\[\\begin{aligned}
            u_1
            &=\\dfrac{${a}\\times 0-${p}}{${p}\\times 0-${p + 1}}\\\\
            &=\\dfrac{${p}}{${p + 1}},\\\\[1em]
            u_2
            &=\\dfrac{${a}\\times\\dfrac{${p}}{${p + 1}}-${p}}{${p}\\times\\dfrac{${p}}{${p + 1}}-${p + 1}}\\\\
            &=\\dfrac{\\dfrac{-${2 * p}}{${p + 1}}}{\\dfrac{-${2 * p + 1}}{${p + 1}}}\\\\
            &=\\dfrac{${2 * p}}{${2 * p + 1}},\\\\[1em]
            u_3
            &=\\dfrac{${a}\\times\\dfrac{${2 * p}}{${2 * p + 1}}-${p}}{${p}\\times\\dfrac{${2 * p}}{${2 * p + 1}}-${p + 1}}\\\\
            &=\\dfrac{\\dfrac{-${3 * p}}{${2 * p + 1}}}{\\dfrac{-${3 * p + 1}}{${2 * p + 1}}}\\\\
            &=\\dfrac{${3 * p}}{${3 * p + 1}}.
            \\end{aligned}\\]
            Ainsi, $${miseEnEvidence(termes.join(',\\quad '))}$.`,
            `On conjecture que, pour tout entier naturel $n$,
            \\[u_n=${general}.\\]
            Démontrons cette conjecture par récurrence.<br><br>
            Pour tout entier naturel $n$, on note $\\mathcal P_n$ la propriété${sp()}:
            \\[u_n=${general}.\\]<br>
            ${texteEnCouleurEtGras(`Initialisation${sp()}:`, 'black')}<br><br>
            Pour $n=0$, on a
            \\[\\dfrac{${p}\\times 0}{${p}\\times 0+1}=0=u_0.\\]
            La propriété $\\mathcal P_0$ est donc vraie.<br><br>
            ${texteEnCouleurEtGras(`Hérédité${sp()}:`, 'black')}<br><br>
            Soit $n\\in\\mathbb N$. Supposons que la propriété $\\mathcal P_n$ est vraie, c'est-à-dire${sp()}:
            \\[u_n=${general}.\\]
            Montrons que la propriété $\\mathcal P_{n+1}$ est vraie, c'est-à-dire${sp()}:
            \\[u_{n+1}=\\dfrac{${p}(n+1)}{${p}(n+1)+1}.\\]
            D'après la relation de récurrence et l'hypothèse de récurrence,
            \\[\\begin{aligned}
            u_{n+1}
            &=\\dfrac{${numerateurSuite}}{${denominateurSuite}}\\\\
            &=\\dfrac{${a}\\times\\dfrac{${p}n}{${p}n+1}-${p}}{${p}\\times\\dfrac{${p}n}{${p}n+1}-${p + 1}}\\\\
            &=\\dfrac{\\dfrac{-${p}(n+1)}{${p}n+1}}{\\dfrac{-(${p}n+${p + 1})}{${p}n+1}}\\\\
            &=\\dfrac{${p}(n+1)}{${p}n+${p + 1}}\\\\
            &=\\dfrac{${p}(n+1)}{${p}(n+1)+1}.
            \\end{aligned}\\]
            La propriété $\\mathcal P_{n+1}$ est donc vraie. La propriété est héréditaire.<br><br>
            ${texteEnCouleurEtGras(`Conclusion${sp()}:`, 'black')}<br><br>
            La propriété est vraie au rang $0$ et elle est héréditaire. Donc, par récurrence, pour tout entier naturel $n$, $${miseEnEvidence(`u_n=${general}`)}$.`,
          ],
        }),
      ],
    })
    const correction = `${partieA}<br><br>${correctionsPartieA}<br>${partieB}<br><br>${correctionsPartieB}`

    this.listeQuestions.push(enonce)
    this.listeCorrections.push(correction)
  }
}
