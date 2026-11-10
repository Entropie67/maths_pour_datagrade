// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 9bfb5 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '9bfb5'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'QCM Bac : analyse, probabilités et suites'
export const dateDePublication = '03/11/2024'
export const dateDeModifImportante = '28/05/2026'

type QcmItem = {
  enonce: string
  reponses: [string, string, string, string]
  correction: string
}

const qcmBac: QcmItem[] = [
  {
    enonce:
      `La solution $f$ de l'équation différentielle $y'=-3y+7$ telle que $f(0)=1$ est la fonction définie sur $\\mathbb{R}$ par${sp()}:`,
    reponses: [
      '$f(x)=-\\dfrac43\\mathrm{e}^{-3x}+\\dfrac73$',
      '$f(x)=\\mathrm{e}^{-3x}$',
      '$f(x)=\\mathrm{e}^{-3x}+\\dfrac73$',
      '$f(x)=-\\dfrac{10}{3}\\mathrm{e}^{-3x}-\\dfrac73$',
    ],
    correction:
      "Les solutions de $y'=-3y+7$ sont de la forme $x\\mapsto K\\mathrm{e}^{-3x}+\\dfrac73$. La condition $f(0)=1$ donne $K+\\dfrac73=1$, donc $K=-\\dfrac43$.",
  },
  {
    enonce:
      `On considère la fonction $g$ définie sur $\\mathbb{R}$ par $g(x)=x^2\\ln\\left(x^2+4\\right)$. Alors $\\displaystyle\\int_0^2 g'(x)\\,\\mathrm{d}x$ vaut, à $10^{-1}$ près${sp()}:`,
    reponses: ['$8{,}3$', '$4{,}9$', '$1{,}7$', '$7{,}5$'],
    correction:
      "D'après le théorème fondamental de l'analyse, $\\displaystyle\\int_0^2 g'(x)\\,\\mathrm{d}x=g(2)-g(0)=4\\ln(8)\\approx 8{,}3$.",
  },
  {
    enonce:
      `Une professeure veut former un groupe de $5$ élèves parmi $31$ élèves. De combien de façons différentes peut-elle former un tel groupe${sp()}?`,
    reponses: [
      '$\\dbinom{31}{5}$',
      '$31^5$',
      '$31\\times30\\times29\\times28\\times27$',
      '$31+30+29+28+27$',
    ],
    correction:
      `L'ordre des élèves ne compte pas${sp()}: il s'agit d'une combinaison de $5$ élèves parmi $31$, soit $\\dbinom{31}{5}$.`,
  },
  {
    enonce:
      `Dans une classe, $20$ élèves ont choisi SES et $11$ élèves ont choisi une autre spécialité. On veut former un groupe de $5$ élèves comportant exactement $3$ élèves ayant choisi SES. Le nombre de groupes possibles est${sp()}:`,
    reponses: [
      '$\\displaystyle\\binom{20}{3}\\times\\binom{11}{2}$',
      '$\\displaystyle\\binom{20}{3}+\\binom{11}{2}$',
      '$\\displaystyle\\binom{20}{3}$',
      '$20^3\\times11^2$',
    ],
    correction:
      'On choisit $3$ élèves parmi les $20$ élèves ayant choisi SES, puis $2$ élèves parmi les $11$ autres. On obtient donc $\\displaystyle\\binom{20}{3}\\times\\binom{11}{2}$.',
  },
  {
    enonce: `Sur l'intervalle $[0;2\\pi]$, l'équation $\\sin(x)=0{,}1$ admet${sp()}:`,
    reponses: [
      'deux solutions',
      'zéro solution',
      'une solution',
      'quatre solutions',
    ],
    correction:
      "La droite d'équation $y=0{,}1$ coupe la courbe de la fonction sinus en deux points sur $[0;2\\pi]$.",
  },
  {
    enonce:
      `On considère la fonction $f$ définie sur $[0;\\pi]$ par $f(x)=x+\\sin(x)$. On admet que $f$ est deux fois dérivable. Alors${sp()}:`,
    reponses: [
      'la fonction $f$ est concave sur $[0;\\pi]$',
      'la fonction $f$ est convexe sur $[0;\\pi]$',
      'la fonction $f$ admet sur $[0;\\pi]$ un unique point d’inflexion',
      'la fonction $f$ admet sur $[0;\\pi]$ exactement deux points d’inflexion',
    ],
    correction:
      "On a $f''(x)=-\\sin(x)\\leqslant0$ sur $[0;\\pi]$. La fonction $f$ est donc concave sur cet intervalle.",
  },
  {
    enonce:
      `Une urne contient cinquante boules numérotées de $1$ à $50$. On tire successivement trois boules sans remise. On ne tient pas compte de l'ordre des numéros. Le nombre de tirages possibles est${sp()}:`,
    reponses: [
      '$\\dfrac{50\\times49\\times48}{1\\times2\\times3}$',
      '$50^3$',
      '$1\\times2\\times3$',
      '$50\\times49\\times48$',
    ],
    correction:
      `Sans tenir compte de l'ordre, on compte les combinaisons de $3$ éléments parmi $50$${sp()}: $\\binom{50}{3}=\\dfrac{50\\times49\\times48}{1\\times2\\times3}$.`,
  },
  {
    enonce:
      `On effectue dix lancers d’une pièce de monnaie. On note la liste ordonnée des dix résultats. Le nombre de listes ordonnées possibles est${sp()}:`,
    reponses: [
      '$2^{10}$',
      '$2\\times10$',
      '$1\\times2\\times3\\times\\cdots\\times10$',
      '$\\dfrac{1\\times2\\times3\\times\\cdots\\times10}{1\\times2}$',
    ],
    correction:
      'Pour chaque lancer, il y a $2$ issues possibles. Pour $10$ lancers ordonnés, il y a donc $2^{10}$ listes possibles.',
  },
  {
    enonce:
      `On effectue $n$ lancers d'une pièce équilibrée. Quelle est la probabilité d'obtenir au plus deux fois pile${sp()}?`,
    reponses: [
      '$\\left(1+n+\\dfrac{n(n-1)}{2}\\right)\\left(\\dfrac12\\right)^n$',
      '$\\dfrac{n(n-1)}{2}$',
      '$\\dfrac{n(n-1)}{2}\\left(\\dfrac12\\right)^n$',
      '$1+n+\\dfrac{n(n-1)}{2}$',
    ],
    correction:
      'Si $X$ désigne le nombre de piles, alors $X$ suit la loi binomiale de paramètres $n$ et $\\dfrac12$. On calcule $P(X\\leqslant2)=P(X=0)+P(X=1)+P(X=2)$.',
  },
  {
    enonce:
      `On considère la fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=x\\mathrm{e}^{x^2-3}$. Une primitive $F$ de $f$ sur $\\mathbb{R}$ est définie par${sp()}:`,
    reponses: [
      '$F(x)=\\dfrac12\\mathrm{e}^{x^2-3}$',
      '$F(x)=2x\\mathrm{e}^{x^2-3}$',
      '$F(x)=\\left(2x^2+1\\right)\\mathrm{e}^{x^2-3}$',
      '$F(x)=\\dfrac12x\\mathrm{e}^{x^2-3}$',
    ],
    correction:
      "En dérivant $F(x)=\\dfrac12\\mathrm{e}^{x^2-3}$, on obtient $F'(x)=\\dfrac12\\times2x\\mathrm{e}^{x^2-3}=x\\mathrm{e}^{x^2-3}$.",
  },
  {
    enonce:
      `On considère la suite $(u_n)$ définie pour tout entier naturel $n$ par $u_n=\\mathrm{e}^{2n+1}$. Cette suite est${sp()}:`,
    reponses: [
      'géométrique de raison $\\mathrm{e}^2$',
      'arithmétique de raison $2$',
      'géométrique de raison $\\mathrm{e}$',
      'convergente vers $\\mathrm{e}$',
    ],
    correction:
      'Pour tout $n$, $u_{n+1}=\\mathrm{e}^{2n+3}=\\mathrm{e}^2\\mathrm{e}^{2n+1}=\\mathrm{e}^2u_n$. La suite est donc géométrique de raison $\\mathrm{e}^2$.',
  },
  {
    enonce:
      `La fonction Python suivante doit renvoyer la plus petite valeur de l'entier $n$ telle que $u_n>10\\,000$, avec $u_0=15$ et $u_{n+1}=1{,}2u_n+12$. La condition correcte de la boucle est${sp()}:`,
    reponses: [
      '$u\\leqslant10\\,000$',
      '$u=10\\,000$',
      '$u>10\\,000$',
      '$n\\leqslant10\\,000$',
    ],
    correction:
      "Tant que $u\\leqslant10\\,000$, le seuil n'est pas atteint et il faut continuer à calculer le terme suivant.",
  },
  {
    enonce:
      `On considère la suite $(u_n)$ définie par $u_0=15$ et $u_{n+1}=1{,}2u_n+12$. On pose $v_n=u_n+60$. La suite $(v_n)$ est${sp()}:`,
    reponses: [
      'géométrique de raison $1{,}2$',
      'décroissante',
      'arithmétique de raison $60$',
      'ni géométrique ni arithmétique',
    ],
    correction:
      'On a $v_{n+1}=u_{n+1}+60=1{,}2u_n+72=1{,}2(u_n+60)=1{,}2v_n$. La suite $(v_n)$ est donc géométrique de raison $1{,}2$.',
  },
  {
    enonce:
      `On considère la suite $(u_n)$ définie pour tout entier naturel $n$ par $u_n=\\dfrac{1+2^n}{3+5^n}$. Cette suite${sp()}:`,
    reponses: [
      'converge vers $0$',
      'diverge vers $+\\infty$',
      'converge vers $\\dfrac25$',
      'converge vers $\\dfrac13$',
    ],
    correction:
      'Le terme dominant au numérateur est $2^n$ et le terme dominant au dénominateur est $5^n$. Comme $\\left(\\dfrac25\\right)^n\\to0$, la suite converge vers $0$.',
  },
  {
    enonce:
      `Soit $f$ la fonction définie sur $]0;+\\infty[$ par $f(x)=x^2\\ln x$. L’expression de $f’$ est${sp()}:`,
    reponses: [
      "$f'(x)=x(2\\ln x+1)$",
      "$f'(x)=2x\\ln x$",
      "$f'(x)=2$",
      "$f'(x)=x$",
    ],
    correction:
      `On dérive le produit $x^2\\ln x$${sp()}: $f'(x)=2x\\ln x+x^2\\times\\dfrac1x=x(2\\ln x+1)$.`,
  },
  {
    enonce:
      `On considère une fonction $h$ continue, strictement croissante sur $\\mathbb{R}$, telle que $h(1)=0$. On note $H$ la primitive de $h$ qui s'annule en $0$. Elle vérifie${sp()}:`,
    reponses: [
      '$H$ est positive sur $]-\\infty~;~0]$',
      '$H$ est croissante sur $]-\\infty~;~1]$',
      '$H$ est négative sur $]-\\infty~;~1]$',
      '$H$ est croissante sur $\\mathbb{R}$',
    ],
    correction:
      'Comme $h(x)<0$ pour $x<1$, la primitive $H$ est décroissante sur $]-\\infty~;~1]$. Pour $x\\leqslant0$, on a donc $H(x)\\geqslant H(0)=0$.',
  },
  {
    enonce:
      `Soit $f$ continue et strictement croissante sur $[a;b]$, avec $a<b$, et telle que $f$ s’annule en $\\alpha$. Dans un algorithme de dichotomie, si $m=\\dfrac{a+b}{2}$ et $f(m)<0$, il faut remplacer${sp()}:`,
    reponses: ['$a$ par $m$', '$b$ par $m$', '$m$ par $a$', '$m$ par $b$'],
    correction:
      'Comme $f$ est croissante et $f(m)<0$, la racine est dans $[m;b]$. Il faut donc remplacer $a$ par $m$.',
  },
  {
    enonce:
      `Une urne contient $10$ boules dont $7$ bleues et $3$ vertes. On effectue trois tirages avec remise. La probabilité d’obtenir exactement deux boules vertes est${sp()}:`,
    reponses: [
      '$\\displaystyle\\binom32\\left(\\dfrac7{10}\\right)\\left(\\dfrac3{10}\\right)^2$',
      '$\\left(\\dfrac7{10}\\right)^2\\times\\dfrac3{10}$',
      '$\\left(\\dfrac3{10}\\right)^2$',
      '$\\displaystyle\\binom{10}{2}\\left(\\dfrac7{10}\\right)\\left(\\dfrac3{10}\\right)^2$',
    ],
    correction:
      'Le nombre de boules vertes suit la loi binomiale de paramètres $3$ et $\\dfrac3{10}$. On calcule $P(X=2)=\\binom32\\left(\\dfrac3{10}\\right)^2\\left(\\dfrac7{10}\\right)$.',
  },
  {
    enonce:
      `Une primitive de la fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=x\\mathrm{e}^x$ est${sp()}:`,
    reponses: [
      '$F(x)=(x-1)\\mathrm{e}^x$',
      '$F(x)=\\dfrac{x^2}{2}\\mathrm{e}^x$',
      '$F(x)=(x+1)\\mathrm{e}^x$',
      '$F(x)=x^2\\mathrm{e}^{x^2}$',
    ],
    correction:
      "En dérivant $F(x)=(x-1)\\mathrm{e}^x$, on obtient $F'(x)=\\mathrm{e}^x+(x-1)\\mathrm{e}^x=x\\mathrm{e}^x$.",
  },
  {
    enonce:
      `On considère la fonction $g$ définie par $g(x)=\\ln\\left(\\dfrac{x-1}{2x+4}\\right)$. La fonction $g$ est définie sur${sp()}:`,
    reponses: [
      '$]-\\infty~;~-2[\\cup]1;+\\infty[$',
      '$\\mathbb{R}$',
      '$]-2;+\\infty[$',
      '$]-2;1[$',
    ],
    correction:
      'Il faut $\\dfrac{x-1}{2x+4}>0$. La fraction est positive lorsque le numérateur et le dénominateur sont de même signe, soit sur $]-\\infty~;~-2[\\cup]1;+\\infty[$.',
  },
  {
    enonce:
      `La fonction $h$ définie sur $\\mathbb{R}$ par $h(x)=(x+1)\\mathrm{e}^x$ est${sp()}:`,
    reponses: [
      'concave sur $]-\\infty~;~-3]$ et convexe sur $[-3~;~+\\infty[$',
      'concave sur $\\mathbb{R}$',
      'convexe sur $\\mathbb{R}$',
      'convexe sur $]-\\infty~;~-3]$ et concave sur $[-3~;~+\\infty[$',
    ],
    correction:
      "On a $h''(x)=(x+3)\\mathrm{e}^x$. Comme $\\mathrm{e}^x>0$, le signe de $h''$ est celui de $x+3$.",
  },
  {
    enonce:
      `Une suite $(u_n)$ est minorée par $3$ et converge vers un réel $\\ell$. On peut affirmer que${sp()}:`,
    reponses: [
      '$\\ell\\geqslant3$',
      '$\\ell=3$',
      'la suite $(u_n)$ est décroissante',
      'la suite $(u_n)$ est constante à partir d’un certain rang',
    ],
    correction:
      'Si $u_n\\geqslant3$ pour tout $n$ et si $(u_n)$ converge vers $\\ell$, alors la limite vérifie $\\ell\\geqslant3$.',
  },
  {
    enonce:
      `La suite $(w_n)$ est définie par $w_1=2$ et, pour tout entier $n\\geqslant1$, $w_{n+1}=\\dfrac1n w_n$. On peut affirmer que${sp()}:`,
    reponses: [
      'la suite $(w_n)$ converge vers $0$',
      'la suite $(w_n)$ est géométrique',
      'la suite $(w_n)$ n’admet pas de limite',
      '$w_5=\\dfrac1{15}$',
    ],
    correction:
      'On obtient $w_n=\\dfrac{2}{(n-1)!}$ pour $n\\geqslant1$, donc $w_n\\to0$ quand $n\\to+\\infty$.',
  },
]

/**
 * Série de QCM de Bac. Chaque question générée est tirée dans une banque, et
 * les propositions sont mélangées par le moteur QCM de MathALÉA.
 *
 * @author Stéphane Guyon
 */
export default class ShuffleQcmBacOld extends ExerciceQcmA {
  versionAleatoire: () => void = () => {
    const qcm = choice(qcmBac)
    this.enonce = qcm.enonce
    this.reponses = [...qcm.reponses]
    this.correction = qcm.correction
  }

  constructor() {
    super()

    this.nbQuestions = 3
    this.nbQuestionsModifiable = true
    this.versionAleatoire()
  }
}
