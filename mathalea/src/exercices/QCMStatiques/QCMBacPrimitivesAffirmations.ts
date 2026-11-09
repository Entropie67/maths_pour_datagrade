import { context } from '../../modules/context'
import { courbe } from '../../lib/2d/Courbe'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import Exercice from '../Exercice'

/**
 * @author Stéphane Guyon
 */
export const uuid = 'f9d2a'
export const refs = {
  'fr-fr': ['TSA7-32'],
  'fr-ch': [],
}
export const titre =
  'Répondre à des affirmations Bac sur les primitives, équations différentielles et intégration'
export const dateDePublication = '07/06/2026'

type AffirmationItem = {
  enonce: string | (() => string)
  correction: string
}

function correctionAvecConclusion(correction: string): string {
  const estVraie = correction.startsWith('Vraie.<br>')
  const estFausse = correction.startsWith('Fausse.<br>')
  if (!estVraie && !estFausse) return correction

  const corps = correction.replace(/^(Vraie|Fausse)\.<br>/, '')
  const verdict = estVraie ? 'vraie' : 'fausse'
  return `${corps}<br><br>Conclusion : l’affirmation est ${texteEnCouleurEtGras(verdict)}.`
}

function enonceAvecConsigne(enonce: string): string {
  const consigne = 'Déterminer si l’affirmation suivante est vraie ou fausse : '
  const positionConsigne = enonce.indexOf(consigne)
  if (positionConsigne === -1) return enonce

  const contexte = enonce.slice(0, positionConsigne)
  const affirmation = enonce
    .slice(positionConsigne + consigne.length)
    .replace(/^([a-zàâäéèêëîïôöùûüç])/iu, (lettre) =>
      lettre.toLocaleUpperCase('fr-FR'),
    )

  return `${contexte}<br><br>${texteEnCouleurEtGras('Déterminer si l’affirmation suivante est vraie ou fausse :', 'black')}<br>${affirmation}`
}

function graphiqueCarreEtAire(): string {
  const r = repere({
    xMin: -0.5,
    xMax: 4,
    yMin: 0,
    yMax: 10,
    xLabelMin: 0,
    xLabelMax: 4,
    yLabelMin: 0,
    yLabelMax: 10,
    xThickDistance: 1,
    yThickDistance: 1,
    axeXStyle: '->',
    axeYStyle: '->',
    grilleSecondaire: true,
    grilleSecondaireXDistance: 1,
    grilleSecondaireYDistance: 1,
    grilleSecondaireXMin: 0,
    grilleSecondaireXMax: 4,
    grilleSecondaireYMin: 0,
    grilleSecondaireYMax: 10,
  })
  const aire = polygone(
    [
      pointAbstrait(0, 0),
      pointAbstrait(0.4, 0.16),
      pointAbstrait(0.8, 0.64),
      pointAbstrait(1.2, 1.44),
      pointAbstrait(1.6, 2.56),
      pointAbstrait(2, 4),
      pointAbstrait(2.4, 5.76),
      pointAbstrait(2.8, 7.84),
      pointAbstrait(3, 9),
      pointAbstrait(3, 0),
    ],
    'gray',
  )
  aire.couleurDeRemplissage = ['gray', 'gray']
  aire.opaciteDeRemplissage = 0.25

  const carre = polygone(
    [
      pointAbstrait(0, 0),
      pointAbstrait(3, 0),
      pointAbstrait(3, 3),
      pointAbstrait(0, 3),
    ],
    bleuMathalea,
  )
  carre.epaisseur = 2

  return mathalea2d(
    {
      xmin: -0.5,
      xmax: 4.5,
      ymin: -0.5,
      ymax: 10.5,
      pixelsParCm: 22,
      scale: 0.8,
      center: !context.isHtml,
      centerLatex: true,
    },
    r,
    aire,
    carre,
    courbe((x) => x ** 2, {
      repere: r,
      xMin: -0.2,
      xMax: 3.2,
      yMin: 0,
      yMax: 10,
      color: 'red',
      epaisseur: 2,
    }),
    latex2d('A', -0.2, -0.25, { color: bleuMathalea }),
    latex2d('B', 3.1, -0.25, { color: bleuMathalea }),
    latex2d('C', 3.15, 3.15, { color: bleuMathalea }),
    latex2d('D', -0.25, 3.15, { color: bleuMathalea }),
  )
}

const affirmationsPrimitives: AffirmationItem[] = [
  {
    enonce:
      'On considère l’équation différentielle $(E) :\\, y\' = \\dfrac32 y + 2$ d’inconnue $y$, fonction définie et dérivable sur $\\R$.Déterminer si l’affirmation suivante est vraie ou fausse : il existe une fonction constante solution de l’équation différentielle $(E)$.',
    correction:
      'Vraie.<br>Soit $g$ la fonction constante définie sur $\\R$ par $g(x) = K$, avec $K \\in \\R$ ; alors $g\'(x) = 0$.<br>$g$ est donc solution de l’équation différentielle si $g\'(x) = \\dfrac32g(x) + 2 \\iff 0 = \\dfrac32 \\times K + 2 \\iff \\dfrac32K = - 2 \\iff K= - \\dfrac43$.',
  },
  {
    enonce:
      'On considère l’équation différentielle $(E) :\\, y\' = \\dfrac32 y + 2$. Dans un repère orthonormé, on note $\\mathcal{C}_f$ la courbe représentative de la fonction $f$ solution de $(E)$ telle que $f(0) = 0$.Déterminer si l’affirmation suivante est vraie ou fausse : la tangente au point d’abscisse $1$ de $\\mathcal{C}_f$ a pour coefficient directeur $2 \\mathrm{e}^{\\frac32}$.',
    correction:
      'Vraie.<br>Les solutions de $(E)$ sont définies sur $\\R$ par $f(x) = K\\mathrm{e}^{\\frac32 x} - \\dfrac43$.<br>En particulier la fonction $f_1$ telle que $f_1(0) = 0$ vérifie $K\\mathrm{e}^{0} - \\dfrac43 = 0$, donc $K = \\dfrac43$ et $f_1(x) = \\dfrac43\\mathrm{e}^{\\frac32 x} - \\dfrac43$.<br>Puisque $f_1$ est une solution de $(E)$, on a $f\'_1(1) = \\dfrac32f_1(1) + 2 = \\dfrac32\\left(\\dfrac43\\mathrm{e}^{\\frac32} - \\dfrac43\\right) + 2 = 2\\mathrm{e}^{\\frac32}$.<br>Le nombre dérivé en $1$ est égal à la pente de la tangente à la courbe représentative de $f_1$ au point d’abscisse $1$.',
  },
  {
    enonce:
      'On considère la fonction $k$ définie et continue sur $\\R$ par $k(x) = 1 + 2\\mathrm{e}^{-x^2 + 1}$.Déterminer si l’affirmation suivante est vraie ou fausse : il existe une primitive de la fonction $k$ décroissante sur $\\R$.',
    correction:
      'Fausse.<br>Toute primitive $K$ de la fonction $k$ a pour dérivée $k$. Or, pour tout réel $X$, on a $\\mathrm{e}^{X}>0$. Donc pour tout réel $x$, on a $\\mathrm{e}^{-x^2 + 1}>0$, donc $1+2\\mathrm{e}^{-x^2 + 1}>0$, et donc $k(x)>0$.<br>La primitive $K$ a donc une dérivée toujours strictement positive, donc elle est strictement croissante sur $\\R$.',
  },
  {
    enonce:
      'On considère l’équation différentielle $(E): 3y\' + y = 1$ et la fonction $g$ définie sur $\\R$ par $g(x) = 4\\mathrm{e}^{- \\frac13 x} + 1$.Déterminer si l’affirmation suivante est vraie ou fausse : la fonction $g$ est solution de l’équation différentielle $(E)$ avec $g(0) = 5$.',
    correction:
      'Vraie.<br>$g(x) = 4\\mathrm{e}^{- \\frac13 x} + 1$ donc $g(0)=4\\mathrm{e}^{0} + 1=4+1=5$.<br>$g$ est dérivable sur $\\R$ et $g\'(x)= 4\\times \\left (-\\dfrac{1}{3}\\right )\\mathrm{e}^{-\\frac{1}{3}x} = -\\dfrac{4}{3}\\mathrm{e}^{-\\frac{1}{3}x}$.<br>Donc $3g\'(x)+g(x)= 3\\times \\left ( -\\dfrac{4}{3}\\mathrm{e}^{-\\frac{1}{3}x}\\right ) + \\left ( 4\\mathrm{e}^{-\\frac{1}{3}x} +1 \\right )=1$.<br>Donc la fonction $g$ est solution de l’équation différentielle $(E)$.',
  },
  {
    enonce:
      'Déterminer si l’affirmation suivante est vraie ou fausse : une intégration par parties permet d’obtenir $\\displaystyle\\int_0^1 x\\mathrm{e}^{-x}\\:\\mathrm{d}x = 1 - 2\\mathrm{e}^{-1}$.',
    correction:
      'Vraie.<br>En prenant $u(x)=x$ et $v\'(x)=\\mathrm{e}^{-x}$, on a $u\'(x)=1$ et $v(x)=-\\mathrm{e}^{-x}$.<br>Cela donne par intégration par parties : $\\displaystyle\\int_0^1 x\\mathrm{e}^{-x}\\:\\mathrm{d}x = \\left[- x \\mathrm{e}^{-x}\\right]_0^1 - \\displaystyle\\int_0^1 - \\mathrm{e}^{-x}\\:\\mathrm{d}x = \\left[- x \\mathrm{e}^{-x} - \\mathrm{e}^{-x}\\right]_0^1 = 1 - 2\\mathrm{e}^{- 1}$.',
  },
  {
    enonce:
      'On considère la fonction $f$ définie sur $\\R$ par $f(x)=5 x \\mathrm{e}^{-x}$.Déterminer si l’affirmation suivante est vraie ou fausse : la fonction $f$ est solution sur $\\R$ de l’équation différentielle $(E)$ : $y\'+y=5 \\mathrm{e}^{-x}$.',
    correction:
      'Vraie.<br>On a $f\'(x) = 5\\mathrm{e}^{-x} - 5x\\mathrm{e}^{-x} = \\mathrm{e}^{-x}(5 - 5x) = 5\\mathrm{e}^{-x}(1 - x)$.<br>$f\'(x) + f(x) = 5\\mathrm{e}^{-x}(1 - x) + 5x\\mathrm{e}^{-x} = 5\\mathrm{e}^{-x}$, donc $f$ vérifie l’équation différentielle $(E)$.',
  },
  {
    enonce:
      'On considère la fonction $f$ définie sur $]0~;~+\\infty[$ par $f(x) = x \\ln x$.Déterminer si l’affirmation suivante est vraie ou fausse : la fonction $f$ est une solution sur $]0~;~ +\\infty[$ de l’équation différentielle $xy\' - y = x$.',
    correction:
      'Vraie.<br>$f$ est dérivable sur $]0~;~+\\infty[$ comme produit de fonctions dérivables sur cet intervalle et pour tout réel $x$ strictement positif, $f\'(x) = 1 \\times \\ln(x) + x\\times \\dfrac{1}{x}= \\ln(x) + 1$.<br>Donc $xf\'(x) - f(x)= x \\left(\\ln(x) + 1\\right) - x\\ln(x) = x$.<br>Conclusion : $f$ est bien solution sur $]0~;~+\\infty[$ de l’équation différentielle $xy\' - y = x$.',
  },
  {
    enonce:
      'Soit $(E)$ l’équation différentielle $y\' - 2 y= - 6 x + 1$.Déterminer si l’affirmation suivante est vraie ou fausse : la fonction $f$ définie sur $\\R$ par $f(x)=\\mathrm{e}^{2 x}-6 x + 1$ est une solution de l’équation différentielle $(E)$.',
    correction:
      'Fausse.<br>Dérivons la fonction $f$ : $\\forall x \\in \\R, f\'(x) = 2\\mathrm{e}^{2x} - 6$.<br>Donc $\\forall x\\in \\R, f\'(x) - 2f(x) = \\big(2\\mathrm{e}^{2x} - 6\\big) - 2\\big(\\mathrm{e}^{2x} - 6x + 1\\big)=12x -8$.<br>Ainsi, $f\' - 2f$ est la fonction $x \\longmapsto 12x - 8$, qui est différente de la fonction $x \\longmapsto -6x + 1$, donc $f$ n’est pas une solution de l’équation différentielle $(E)$.',
  },
  {
    enonce:
      'On considère l’équation différentielle $(E) : - 2y\' + 3y = \\sin x + 8\\cos x$ et la fonction $f$ définie sur $\\R$ par $f(x) = 2\\cos x - \\sin x$.Déterminer si l’affirmation suivante est vraie ou fausse : la fonction $f$ est solution de l’équation différentielle $(E)$.',
    correction:
      'Vraie.<br>$f(x)=2\\cos\\left (x\\right )- \\sin\\left (x\\right )$, donc $f\'(x)= -2\\sin\\left (x\\right ) - \\cos\\left (x\\right )$.<br>Donc $- 2f\'(x) + 3f(x) = -2\\left ( -2\\sin\\left (x\\right ) - \\cos\\left (x\\right )\\right ) +3 \\left (2\\cos\\left (x\\right )- \\sin\\left (x\\right ) \\right ) = \\sin\\left (x\\right ) +8\\cos\\left (x\\right )$.<br>Donc la fonction $f$ est solution de l’équation différentielle $-2y\' +3y = \\sin\\left (x\\right ) +8\\cos\\left (x\\right )$.',
  },
  {
    enonce:
      'Soit $f$ la fonction définie sur $\\R$ par $f(x)=x \\mathrm{e}^{-2 x}$.Déterminer si l’affirmation suivante est vraie ou fausse : la fonction $f$ est une solution sur $\\R$ de l’équation différentielle $y\'+2 y=\\mathrm{e}^{-2 x}$.',
    correction:
      'Vraie.<br>$f\'(x)+2f(x)= \\left (-2x+1\\right )\\mathrm{e}^{-2x} +2x\\mathrm{e}^{-2x} = -2x\\mathrm{e}^{-2x} +\\mathrm{e}^{-2x}+2x\\mathrm{e}^{-2x}=\\mathrm{e}^{-2x}$.',
  },
  {
    enonce:
      'Soit $f$ la fonction définie sur $\\R$ par $f(x)=x \\mathrm{e}^{-2 x}$.Déterminer si l’affirmation suivante est vraie ou fausse : l’aire du domaine délimité par la courbe $\\mathcal{C}_{f}$, l’axe des abscisses et les droites d’équation $x=0$ et $x=1$ est égale à $\\dfrac{1}{4}-\\dfrac{3 \\mathrm{e}^{-2}}{4}$.',
    correction:
      'Vraie.<br>L’aire du domaine est égale à $\\mathcal{A} = \\displaystyle\\int_{0}^{1}f(x) \\mathrm{d} x = \\displaystyle \\int_{0}^{1} x \\mathrm{e}^{-2x} \\mathrm{d} x$.<br>On utilise une intégration par parties avec $u(x)=x$ et $v\'(x)=\\mathrm{e}^{-2x}$, donc $u\'(x)=1$ et $v(x)= -\\dfrac{1}{2} \\mathrm{e}^{-2x}$.<br>$\\mathcal{A}= \\displaystyle \\int_{0}^{1} x \\mathrm{e}^{-2x} \\mathrm{d} x = \\left [- \\dfrac{x\\mathrm{e}^{-2x} }{2} \\right ]_{0}^{1}- \\left [ \\dfrac{1}{4}\\mathrm{e}^{-2x} \\right ]_{0}^{1}= \\dfrac{1}{4} - \\dfrac{3\\mathrm{e}^{-2}}{4}$.',
  },
  {
    enonce:
      'On considère la fonction $F$ définie sur $]0~;~+\\infty[$ par $F(x) = (2x + 1)\\ln (x)$.Déterminer si l’affirmation suivante est vraie ou fausse : la fonction $F$ est une primitive de la fonction $f$ définie sur $]0~;~+\\infty[$ par $f(x) = \\dfrac2x$.',
    correction:
      'Fausse.<br>$\\forall x\\in ]0~;~+\\infty[, F\'(x) = \\dfrac{2 x \\ln x+2 x+1}{x}$, en particulier $F\'(1) = \\dfrac{3}{2}$ et $f(1) = 2$. $f$ n’est pas la dérivée de $F$. Ainsi on montre que $F$ n’est pas une primitive de $f$.',
  },
  {
    enonce:
      'On considère la fonction $g$ définie sur $\\R$ par $g(t) = 45\\mathrm{e}^{0,06t} + 20$.Déterminer si l’affirmation suivante est vraie ou fausse : la fonction $g$ est l’unique solution de l’équation différentielle $(E_1) : y\' + 0,06y = 1,2$ vérifiant $g(0) = 65$.',
    correction:
      'Fausse.<br>$g(0) = 45 \\times \\mathrm{e}^{0} +20 = 65$.<br>$\\forall t \\in \\R, g\'(t) +0,06\\times g(t) = 45\\times 0,06\\times \\mathrm{e}^{0,06t} + 0,06\\times\\left(45\\times\\mathrm{e}^{0,06t}+20\\right) = 5,4\\times\\mathrm{e}^{0,06t}+1,2$.<br>$g$ n’est pas solution de $(E_1)$.',
  },
  {
    enonce:
      'On considère l’équation différentielle $(E_2) : y\' - y = 3\\mathrm{e}^{0,4x}$ où $y$ est une fonction positive de la variable réelle $x$, définie et dérivable sur $\\R$.Déterminer si l’affirmation suivante est vraie ou fausse : les solutions de l’équation $(E_2)$ sont des fonctions convexes sur $\\R$.',
    correction:
      'Vraie.<br>Soit $y$ une solution positive de $(E_2)$. On peut écrire $\\forall x \\in \\R, y\'(x) = y(x) + 3\\mathrm{e}^{0,4x}$. Comme $\\forall x \\in \\R, y(x)\\geqslant 0$ et $3\\mathrm{e}^{0,4x}\\geqslant 0$, alors $\\forall x \\in \\R, y\'(x)\\geqslant 0$.<br>On dérive l’équation différentielle : $\\forall x \\in \\R, y\'\'(x) = y\'(x) + 1,2\\mathrm{e}^{0,4x}$. Comme $\\forall x \\in \\R, y\'(x)\\geqslant 0$ et $1,2\\mathrm{e}^{0,4x}\\geqslant 0$, alors $\\forall x \\in \\R, y\'\'(x)\\geqslant 0$.<br>$\\forall x \\in \\R, y\'\'(x)\\geqslant 0$ donc $y$ est convexe sur $\\R$.',
  },
  {
    enonce: () =>
      `Dans le repère orthonormé ci-dessous, on a représenté la fonction carré, notée $f$, ainsi que le carré ABCD de côté $3$.<br>${graphiqueCarreEtAire()}Déterminer si l’affirmation suivante est vraie ou fausse : la zone hachurée et le carré ABCD ont la même aire.`,
    correction:
      'Vraie.<br>En effet, le carré ABCD a un côté de 3 unités de longueurs, donc son aire est de $3^2 = 9$ unités d’aire.<br>Par ailleurs, la zone hachurée est délimitée par l’axe des abscisses, la courbe représentant la fonction carré et les droites d’équation $x = 0$ et $x=3$. La fonction carré étant positive, l’aire, en unités d’aire, est égale à l’intégrale $\\displaystyle \\int_{0}^{3} x^2 ~\\mathrm{d} x = \\left[\\dfrac{1}{3}x^3\\right]_0^3 = 9$.<br>Les deux zones ont donc bien la même aire, de 9 unités d’aire.',
  },
  {
    enonce:
      'On considère l’intégrale $J = \\displaystyle\\int_1^2 x \\ln (x)\\,\\mathrm{d}x$.Déterminer si l’affirmation suivante est vraie ou fausse : une intégration par parties permet d’obtenir $J = \\dfrac{7}{11}$.',
    correction:
      'Fausse.<br>Pour tout $x$ dans $[1~;~2]$, on pose $u(x) = \\dfrac{1}{2}x^2$ et $v(x) = \\ln(x)$, donc $u\'(x) = x$ et $v\'(x) = \\dfrac{1}{x}$.<br>On a alors $J = \\displaystyle\\int_{1}^{2} x\\ln(x) ~\\mathrm{d}x = 2\\ln(2) - \\dfrac{3}{4} \\approx 0,63629$.<br>Or $\\dfrac{7}{11} \\approx 0,63636$, donc $J \\neq \\dfrac{7}{11}$.',
  },
  {
    enonce:
      'Sur $\\R$, on considère l’équation différentielle $(E) : y\' = 2y - \\mathrm{e}^x$.Déterminer si l’affirmation suivante est vraie ou fausse : la fonction $f$ définie sur $\\R$ par $f(x) = \\mathrm{e}^x + \\mathrm{e}^{2x}$ est solution de l’équation différentielle $(E)$.',
    correction:
      'Vraie.<br>D’une part, $f$ est dérivable sur $\\R$ et, pour tout $x$ réel, on a $f\'(x) = \\mathrm{e}^{x} + 2\\mathrm{e}^{2x}$.<br>D’autre part, pour tout réel $x$, on a $2f(x) - \\mathrm{e}^{x} = 2\\left(\\mathrm{e}^{x} + \\mathrm{e}^{2x}\\right) - \\mathrm{e}^{x} = \\mathrm{e}^{x} + 2\\mathrm{e}^{2x}$.<br>On constate donc que, pour tout $x$ réel, on a $f\'(x) = 2f(x) - \\mathrm{e}^{x}$. Autrement dit, la fonction $f$ vérifie l’équation différentielle $(E)$.',
  },
  {
    enonce:
      'Soit $f$ la fonction définie sur $\\R$ par $f(x) = (6x + 5)\\mathrm{e}^{3x}$ et $F$ la fonction définie sur $\\R$ par $F(x) = (2x + 1)\\mathrm{e}^{3x} + 4$.Déterminer si l’affirmation suivante est vraie ou fausse : $F$ est la primitive de $f$ sur $\\R$ qui prend la valeur $5$ quand $x = 0$.',
    correction:
      'Vraie.<br>La fonction $F$ est définie et dérivable sur $\\R$ et sur cet intervalle : $F\'(x) = 2\\mathrm{e}^{3x} + 3(2x + 1)\\mathrm{e}^{3x} = \\mathrm{e}^{3x}(2 + 6x + 3) = (6x + 5)\\mathrm{e}^{3x} = f(x)$.<br>D’autre part $F(0) = 1\\mathrm{e}^{0} + 4 = 1 + 4 = 5$.<br>$F$ est donc la primitive de $f$ sur $\\R$ qui prend la valeur 5 quand $x = 0$.',
  },
  {
    enonce:
      'On considère la suite $(I_n)$ définie pour tout entier naturel $n$ par $I_n = \\displaystyle\\int_1^{\\mathrm{e}} [\\ln (x)]^n\\,\\mathrm{d}x$.Déterminer si l’affirmation suivante est vraie ou fausse : pour tout entier naturel $n$, $I_{n+1} = \\mathrm{e} - (n + 1) I_n$.',
    correction:
      'Vraie.<br>$I_{n+1} = \\displaystyle\\int_1^{\\mathrm{e}} \\left [\\ln (x)\\right ]^{n+1}\\mathrm{d} x$.<br>On calcule $I_{n+1}$ au moyen d’une intégration par parties. On pose $u\'(x)=1$ donc $u(x)=x$, et $v(x)= \\left [\\ln\\left (x\\right )\\right] ^{n+1}$ donc $v\'(x)=\\left (n+1\\right ) \\times \\dfrac{1}{x} \\times \\left [\\ln\\left (x\\right )\\right ]^n$.<br>$I_{n+1}= \\left [ x\\times \\left [\\ln\\left (x\\right )\\right ]^{n+1}\\right ]_{1}^{\\mathrm{e}} - \\left (n+1\\right ) \\displaystyle\\int_{1}^{\\mathrm{e}} \\left [\\ln\\left (x\\right )\\right ]^{n} \\mathrm{d} x = \\mathrm{e} - \\left (n+1\\right ) I_n$.',
  },
  {
    enonce:
      'On considère la fonction $f$ définie sur $]0 ~;~ +\\infty [$ par $f(x)=x \\ln(x)$.Déterminer si l’affirmation suivante est vraie ou fausse : $\\displaystyle\\int_{1}^{\\mathrm{e}} f(x) \\,\\mathrm{d} x=\\dfrac{\\mathrm{e}^{2}+1}{4}$.',
    correction:
      'Vraie.<br>On calcule $\\displaystyle\\int_{1}^{\\mathrm{e}} f(x) \\mathrm{d} x = \\displaystyle\\int_{1}^{\\mathrm{e}} x\\,\\ln(x) \\mathrm{d} x$ en faisant une intégration par parties.<br>On pose $u\'(x)=x$ et $v(x)=\\ln(x)$, donc $u(x)=\\dfrac{x^2}{2}$ et $v\'(x)=\\dfrac{1}{x}$.<br>$\\displaystyle\\int_{1}^{\\mathrm{e}} x\\,\\ln(x) \\mathrm{d} x = \\left [\\dfrac{x^2}{2}\\times \\ln(x) \\right ]_{1}^{\\mathrm{e}}- \\left [ \\dfrac{x^2}{4} \\right ]_{1}^{\\mathrm{e}} = \\dfrac{\\mathrm{e}^2}{4}+\\dfrac{1}{4}=\\dfrac{\\mathrm{e}^2+1}{4}$.',
  },
]

/**
 * Série statique d'affirmations de Bac sur les primitives, les équations
 * différentielles et l'intégration.
 *
 * @author Stéphane Guyon
 */
export default class QcmPrimitivesAffirmations extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = true
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const nbQuestions = Math.min(
      this.nbQuestions,
      affirmationsPrimitives.length,
    )
    const questions = shuffle(affirmationsPrimitives).slice(0, nbQuestions)

    for (const [index, affirmation] of questions.entries()) {
      this.listeQuestions[index] =
        typeof affirmation.enonce === 'function'
          ? enonceAvecConsigne(affirmation.enonce())
          : enonceAvecConsigne(affirmation.enonce)
      this.listeCorrections[index] = correctionAvecConclusion(
        affirmation.correction,
      )
    }
  }
}
