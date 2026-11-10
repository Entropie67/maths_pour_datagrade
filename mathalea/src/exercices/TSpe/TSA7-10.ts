import ExerciceVraiFaux from '../ExerciceVraiFaux'

export const uuid = 'b144a'
export const refs = {
  'fr-fr': ['TSA7-10', 'TCA5-10'],
  'fr-ch': [],
}

export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Connaître le cours sur les primitives'
export const dateDePublication = '26/03/2025'

/*
 @author Stéphane Guyon
*/
export default class VraiFauxSuites extends ExerciceVraiFaux {
  constructor() {
    super()
    this.nbQuestions = 4
    this.affirmations = [
      {
        texte:
          'Si $F$ est une primitive de $f$ sur $I$, alors $f$ est positive sur $I$ équivaut à $F$ croissante sur $I$.',
        statut: true,
        correction:
          "Vrai car $F'=f$ donc $f\\geqslant 0 \\Leftrightarrow F'\\geqslant 0 \\Leftrightarrow F$ croissante.",
      },
      {
        texte:
          'Si $F$ est une primitive de $f$ sur $I$, alors $f$ est croissante sur $I$ équivaut à $F$ convexe sur $I$.',
        statut: true,
        correction:
          "Vrai car $f$ croissante équivaut à $f'>0$. Or $F'=f$ donc$F''=f'>0$ équivaut à $F$ convexe.",
      },
      {
        texte:
          'Si $f$ est dérivable et convexe sur $I$, alors toute primitive $F$ de $f$ est croissante sur $I$.', // 3
        statut: false,
        correction:
          "Faux. Il n'y a aucun lien entre la convexité de $f$, qui équivaut à $f''(x)>0$ sur $I$ et les variations de $F$.",
      },
      {
        texte:
          'Si $F$ et $G$ sont deux primitives de $f$ sur $I$, alors il existe $k\\in\\mathbb{R}$ tel que $F=G+k$.',
        statut: true,
        correction: "Vrai. Deux primitives diffèrent toujours d'une constante.",
      },
      {
        texte:
          'Si $F$ et $G$ sont deux primitives de $f$ sur $I$, alors il existe $k\\in\\mathbb{R}$ tel que $F=k\\times G$.', // (5)
        statut: false,
        correction:
          "Faux. Deux primitives diffèrent toujours d'une constante additive.",
      },
      {
        texte:
          "Soit $u$ une fonction dérivable et non nulle sur $I$. Une primitive de $\\dfrac{u'}{u}$ sur $I$ est $\\ln u$.",
        statut: false,
        correction:
          "Faux. Il faut que $u$ soit strictement positive sur l'intervalle considéré.",
      },
      {
        texte:
          "Soit $u$ une fonction dérivable et non nulle sur $I$. Une primitive de $u'u$ sur $I$ est $-\\dfrac12 u^2$.",
        statut: false,
        correction:
          "Faux. Une primitive de $u'u$ sur $I$ est $\\dfrac12 u^2$..",
      },
      {
        texte:
          'Soit $u$ une fonction dérivable et non nulle sur $I$. Une primitive de $\\dfrac{1}{u^2}$ sur $I$ est $\\dfrac1u$.', // (9)
        statut: false,
        correction:
          'Faux. Une primitive de $\\dfrac{1}{u^2}$ sur $I$ est $-\\dfrac1u$.',
      },
      {
        texte:
          "Soit $u$ une fonction dérivable sur $I$. Une primitive de $u'u^{n}$ avec $n\\in \\mathbb N^{*}$ sur $I$ est $\\dfrac{1}{n+1}u^{n+1}$.",
        statut: true,
        correction: "Vrai. C'est une formule de cours à connaitre..",
      },
      {
        texte: "La fonction $x\\mapsto e^{-x^2}$ n'admet pas de primitive.",
        statut: false,
        correction:
          "Faux. Aucune primitive de $e^{-x^2}$ ne s'exprime avec les fonctions usuelles mais elle existe bien.",
      },
      {
        texte:
          "L'ensemble des primitives de $x\\mapsto \\cos(x)$ sur $\\mathbb{R}$ est $x\\mapsto \\sin(x)+C ~|~ C\\in\\mathbb{R}$.",
        statut: true,
        correction:
          "Vrai. Toute primitive de $\\cos$ s'écrit bien sous cette forme.",
      },
      {
        texte:
          'Une primitive de $x\\mapsto 4\\cos(2x)$ sur $\\mathbb{R}$ est $x\\mapsto 2\\sin(2x)+1 $.', // (13)
        statut: true,
        correction: "Vrai. $\\left(2\\sin(2x)+1\\right)'= 4\\cos(2x)$.",
      },
      {
        texte:
          "L'ensemble des primitives de $x\\mapsto \\sin(x)$ sur $\\mathbb{R}$ est $x\\mapsto \\cos(x)+C ~|~ C\\in\\mathbb{R}$.",
        statut: false,
        correction:
          'Faux. Les primitives de $\\sin$ sont sous la forme $-\\sin(x)+C\\in\\mathbb{R}$ .',
      },

      {
        texte:
          'La fonction $x\\mapsto \\dfrac{1}{2}\\ln(1+x^2)$ est une primitive de $x\\mapsto \\dfrac{x}{1+x^2}$ sur $\\mathbb{R}$.',
        statut: true,
        correction:
          "Vrai. On le vérifie par dérivation en utilisant $\\ln(u)'=\\dfrac{u'}{u}$.",
      },
      {
        texte:
          'Une primitive de $x\\mapsto x\\,e^{x^2}$ est $x\\mapsto \\dfrac{1}{2}\\,e^{x^2}+C$.', // (16)
        statut: true,
        correction:
          "Vrai. On reconnaît la forme $\\dfrac{1}{2}u'e^u$ avec $u=x^2$.",
      },
      {
        texte:
          'Une primitive sur $]0;+\\infty[$ de $x\\mapsto \\ln(x)$ est $x\\mapsto \\dfrac{1}{x}$.', // (17)
        statut: false,
        correction:
          "Faux. C'est la dérivée de $x\\mapsto \\ln(x)$ qui donne $\\dfrac{1}{x}$.",
      },
      {
        texte:
          "Pour $u>0$, une primitive de $\\dfrac{u'}{u^2}$ est $x\\mapsto -\\dfrac{1}{u(x)}+C$.",
        statut: true,
        correction:
          "Vrai. On vérifie en dérivant : $\\left(-\\dfrac{1}{u}\\right)' = \\dfrac{u'}{u^2}$.",
      },

      {
        texte:
          'Pour $a\\neq 0$, une primitive de $x\\mapsto e^{ax}$ est $x\\mapsto \\dfrac{1}{a}e^{ax} + C$.',
        statut: true,
        correction: 'Vrai. Formule classique obtenue par dérivation.',
      },
      {
        texte:
          'Une primitive de $x\\mapsto \\dfrac{x}{(x^2+1)^2}$ est $x\\mapsto -\\dfrac{1}{2(x^2+1)}+C$.', //
        statut: true,
        correction:
          "Vrai. On reconnaît la forme $-\\dfrac{1}{2}u'u^{-2}$ avec $u=x^2+1$.",
      },
    ]
  }
}
