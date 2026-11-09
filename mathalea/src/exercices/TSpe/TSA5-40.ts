import ExerciceVraiFaux from '../ExerciceVraiFaux'

export const uuid = '53f08'
export const refs = {
  'fr-fr': ['TSA5-40', 'TCA4-34'],
  'fr-ch': [],
}

export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Vérifier des affirmations sur les logarithmes'
export const dateDePublication = '1/3/2025'

/*
 * @author Stéphane Guyon
 */
export default class VraiFauxSuites extends ExerciceVraiFaux {
  constructor() {
    super()
    this.nbQuestions = 4
    this.affirmations = [
      {
        texte:
          'La fonction logarithme est strictement croissante sur $[0~;~+\\infty[$.',
        statut: false,
        correction: "Le logarithme n'est pas défini en $0$.",
      },
      {
        texte:
          'Pour tout $a>0$ et $b>0$, on a $\\ln(a+b)=\\ln(a)\\times\\ln(b)$.',
        statut: false,
        correction:
          'Pour tout $a>0$ et $b>0$, on a $\\ln(a\\times b)=\\ln(a)+ln(b)$.',
      },
      {
        texte:
          'La courbe représentative de la fonction logarithme népérien admet une asymptote.',
        statut: true,
        correction:
          "On a $\\displaystyle\\lim_{x\\to0^+}\\ln(x)=-\\infty$, donc la courbe admet une asymptote verticale en $0$.<br>$\\displaystyle\\lim_{x\\to +\\infty}\\ln(x)=+\\infty$, donc la courbe n'admet pas d'asymptote horizontale.",
      },
      {
        texte:
          'Le nombre dérivé de la fonction logarithme népérien en $1$ vaut $1$.',
        statut: true,
        correction:
          'La dérivée de la fonction logarithme népérien est la fonction inverse, donc sa dérivée en $1$ vaut $1$.',
      }, // 4
      {
        texte: '$\\ln(0)=1$',
        statut: false,
        correction:
          "La fonction logarithme n'est pas définie en $0$. On a par contre $\\ln(1)=0$.",
      },
      {
        texte: 'Pour tout réel $x$, on a $\\mathrm{e}^{\\ln(x)}=x$.',
        statut: false,
        correction: "La fonction logarithme n'est définie que pour $x>0$.  ",
      },
      {
        texte: 'Pour tout réel $x$, on a $\\ln(\\mathrm{e}^{x})=x$.',
        statut: true,
        correction:
          'La fonction exponentielle est bien définie sur $\\mathbb{R}$, donc pour tout $x\\in \\mathbb{R}, ~~\\ln(\\mathrm{e}^{x})=x$.  ',
      }, // 7
      {
        texte: '$\\displaystyle\\lim_{x\\to 0^+}\\ln(x)=+\\infty$',
        statut: false,
        correction: '$\\displaystyle\\lim_{x\\to 0^+}\\ln(x)=-\\infty$.  ',
      },
      {
        texte: '$\\displaystyle\\lim_{x\\to 0^+}\\dfrac{\\ln(x)}{x}=0$',
        statut: false,
        correction:
          '$\\displaystyle\\lim_{x\\to 0^+}\\ln(x)=-\\infty$ donc on a une forme $\\dfrac{-\\infty}{0^+}=-\\infty$.  ',
      },
      {
        texte: '$\\displaystyle\\lim_{x\\to 0^+}x\\ln(x)=-\\infty$',
        statut: false,
        correction:
          'Résultat de cours, croissance comparée de $x$ et $\\ln$ en $0$. $\\displaystyle\\lim_{x\\to 0^+}x\\ln(x)=0$.  ',
      }, // 10
      {
        texte:
          'Le logarithme est une fonction strictement positive sur $]0~;~~+\\infty[$.',
        statut: false,
        correction:
          'Le logarithme est une fonction strictement négative sur $]0~;1[$.  ',
      },
      {
        texte:
          'Pour tous les réels $a$ et $b$, on a $\\ln(a\\times b)=\\ln(a)+ln(b)$.',
        statut: false,
        correction:
          "Le logarithme n'est défini que pour les réels strictement positifs. <br>Pour tout $a>0$ et $b>0$, on a $\\ln(a\\times b)=\\ln(a)+ln(b)$.  ",
      }, // 12
      {
        texte:
          'Le logarithme népérien est une fonction concave sur $]~~0;~+\\infty[$.',
        statut: true,
        correction:
          'La dérivée du logarithme népérien $x\\mapsto \\ln x$ est la fonction inverse $x\\mapsto \\dfrac1x$, <br>donc la dérivée seconde est $x\\mapsto -\\dfrac{1}{x^2}$ qui est strictement négative.  ',
      },
      {
        texte:
          'Pour tout $x>0$ et tout entier $n$, on a : $\\left(\\ln(x)\\right)^n=n \\ln(x)$.',
        statut: false,
        correction:
          'Pour tout $x>0$ et tout entier $n$, on a : $\\ln\\left(x^n\\right)=n \\ln(x)$.  ',
      }, // 14

      {
        texte: 'La fonction logarithme népérien est définie sur $\\mathbb{R}$.',
        statut: false,
        correction:
          'La fonction logarithme népérien est définie uniquement sur $]0~;~+\\infty[$.',
      },
      {
        texte: 'La fonction logarithme népérien est une fonction impaire.',
        statut: false,
        correction:
          "La fonction logarithme népérien n'est ni paire ni impaire, car elle n'est définie que pour $x > 0$.",
      }, // 16
      {
        texte:
          'Pour tout $x > 0$, on a $\\ln\\left(\\dfrac{1}{x}\\right) = -\\ln(x)$.',
        statut: true,
        correction: "C'est une propriété directe du logarithme népérien.",
      },
      {
        texte: 'Pour tout $x > 0$, on a $\\ln(x^2) = 2\\ln(x)$.',
        statut: true,
        correction: "C'est une propriété directe du logarithme népérien.",
      },
      {
        texte: 'Pour tout $x > 0$, on a $-\\ln(x) = \\ln(-x)$.',
        statut: false,
        correction:
          "La fonction logarithme népérien n'est pas définie pour les nombres négatifs.",
      }, // 19
      {
        texte:
          'La fonction logarithme népérien est une fonction dérivable sur $]0~;~+\\infty[$.',
        statut: true,
        correction:
          'La fonction logarithme népérien est dérivable sur son domaine de définition, et sa dérivée est $\\dfrac{1}{x}$.',
      },
      {
        texte:
          'Pour tout $x > 0$, on a $\\ln(x) = \\ln\\left(\\dfrac{x}{\\mathrm{e}}\\right) + 1$.',
        statut: true,
        correction:
          'En utilisant les propriétés du logarithme, $\\ln\\left(\\dfrac{x}{\\mathrm{e}}\\right) = \\ln(x) - \\ln(\\mathrm{e}) = \\ln(x) - 1$, donc $\\ln(x) = \\ln\\left(\\dfrac{x}{\\mathrm{e}}\\right) + 1$.',
      },
      {
        texte: '$\\ln(1)=\\mathrm{e}$',
        statut: false,
        correction: '$\\ln(\\mathrm{e})=1$ et $\\ln(1)=0$.',
      }, // 22
    ]
  }
}
