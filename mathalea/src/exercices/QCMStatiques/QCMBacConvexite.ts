import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { buildQcmForExercise } from '../../lib/interactif/qcmBuilder'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { spline, type NoeudSpline } from '../../lib/mathFonctions/Spline'
import { shuffle } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
/**
 * @author Stéphane Guyon
 */
export const uuid = 'b7e92'
export const refs = {
  'fr-fr': ['TSA3-40', 'TCA7-40'],
  'fr-ch': [],
}

export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Répondre à des QCM Bac : Convexité'
export const dateDePublication = '31/05/2026'

type Reponse = {
  texte: string | (() => string)
  statut?: boolean
}

type QcmItem = {
  enonce: string | (() => string)
  reponses: Reponse[]
  correction: string
  vertical?: boolean
}

type GraphiqueOptions = {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  pixelsParCm?: number
  courbeXMax?: number
  scale?: number
  yThickDistance?: number
  yUnite?: number
}

function graphique(
  f: (x: number) => number,
  {
    xMin,
    xMax,
    yMin,
    yMax,
    pixelsParCm = 20,
    courbeXMax = xMax,
    scale = 0.95,
    yThickDistance = 1,
    yUnite = 1,
  }: GraphiqueOptions,
  objetsSupplementaires: Array<
    ReturnType<typeof segment> | ReturnType<typeof texteParPosition>
  > = [],
): string {
  const r = repere({
    xMin,
    xMax,
    yMin,
    yMax,
    yUnite,
    xLabelMin: xMin,
    xLabelMax: xMax,
    yLabelMin: yMin,
    yLabelMax: yMax,
    xThickDistance: 1,
    yThickDistance,
    axeXStyle: '->',
    axeYStyle: '->',
    grilleSecondaire: true,
    grilleSecondaireXDistance: 1,
    grilleSecondaireYDistance: 1,
    grilleSecondaireXMin: xMin,
    grilleSecondaireXMax: xMax,
    grilleSecondaireYMin: yMin,
    grilleSecondaireYMax: yMax,
  })

  return mathalea2d(
    {
      xmin: xMin - 0.5,
      xmax: xMax + 0.5,
      ymin: yMin * yUnite - 0.1,
      ymax: yMax * yUnite + 0.25,
      pixelsParCm,
      scale,
      center: !context.isHtml,
      centerLatex: true,
    },
    r,
    courbe(f, {
      repere: r,
      xMin,
      xMax: courbeXMax,
      yMin,
      yMax,
      color: bleuMathalea,
      epaisseur: 2,
    }),
    objetsSupplementaires,
  )
}

function avecGraphique(texte: string, dessin: string): string {
  return `${texte}<br>${dessin}`
}

function graphiqueMini(
  f: (x: number) => number,
  { yMin = -3, yMax = 4 }: { yMin?: number; yMax?: number } = {},
): string {
  return `<span style="display:inline-flex;align-items:flex-start">${graphique(
    f,
    {
      xMin: -2,
      xMax: 4,
      yMin,
      yMax,
      pixelsParCm: 18,
      scale: 0.82,
      yUnite: 0.75,
    },
  )}</span>`
}

function tableauVariationsPolynesie(): string {
  return tableauDeVariation({
    tabInit: [
      [
        ['$x$', 2, 20],
        ["$\\text{variations de } f'$", 3, 80],
      ],
      ['$-2$', 20, '$0$', 20, '$2$', 20],
    ],
    tabLines: [['Var', 10, '+/$1$', 20, '-/$-2$', 20, '+/$-1$', 10]],
    espcl: 3.5,
    deltacl: 0.8,
    lgt: 5,
    scale: 0.9,
  })
}

const graphiqueMars2023G1 = () =>
  graphique(
    (x) => (10 * (x - 1)) / Math.exp(x / 2),
    {
      xMin: 0,
      xMax: 12,
      yMin: -3,
      yMax: 6,
      pixelsParCm: 20,
      yUnite: 0.85,
    },
    [
      segment(0, 4.46 * 0.85, 9, 4.46 * 0.85),
      segment(2, 5.75 * 0.85, 10, -0.82 * 0.85),
      texteParPosition('P', 5.3, 3.6 * 0.85),
    ],
  )

const graphiqueSeptembre2022Sujet1 = () =>
  graphique((x) => (x + 1) * Math.exp(x) * (x - 2), {
    xMin: -6,
    xMax: 2,
    yMin: -6,
    yMax: 4,
    pixelsParCm: 22,
    yUnite: 0.8,
  })

const graphiqueSeptembre2022Sujet2 = () =>
  graphique(
    (x) => (x + 2) * (1 - x) * Math.exp(x / 2),
    {
      xMin: -4,
      xMax: 2,
      yMin: -3,
      yMax: 6,
      pixelsParCm: 24,
      yUnite: 0.8,
    },
    [
      segment(-0.2, 6 * 0.8, 1.6, -3 * 0.8),
      texteParPosition('A', -2.2, -0.5 * 0.8),
      texteParPosition('B', 1.2, -0.5 * 0.8),
      texteParPosition('C', -0.3, 5.3 * 0.8),
    ],
  )

const graphiqueMai2022Metropole = () =>
  graphique((x) => (2 * (x - 2)) / Math.exp(x / 2), {
    xMin: 0,
    xMax: 10,
    yMin: -5,
    yMax: 1,
    pixelsParCm: 22,
    yUnite: 1,
  })

const graphiqueMai2022Etrangers = () =>
  graphique((x) => x ** 3 + 3 * x ** 2 - x - 3, {
    xMin: -3,
    xMax: 1,
    yMin: -4,
    yMax: 4,
    pixelsParCm: 29,
    yUnite: 0.75,
  })

const graphiqueMai2022CourbeF = () =>
  graphique((x) => (3 / 8) * (x ** 3 / 3 - x ** 2 + 8 / 3), {
    xMin: -2,
    xMax: 4,
    yMin: -2,
    yMax: 3,
    pixelsParCm: 25,
    yUnite: 0.8,
  })

const graphiqueMai2022Sujet2 = () =>
  graphique((x) => -(2 * x + 1) * Math.exp(x), {
    xMin: -5,
    xMax: 1,
    yMin: -3,
    yMax: 1,
    pixelsParCm: 26,
    yUnite: 0.9,
  })

const graphiqueJuin2021Asie = () =>
  graphique((x) => 0.1 * x ** 3 - 0.4 * x ** 2 - 1.1 * x + 3, {
    xMin: -3,
    xMax: 6,
    yMin: -3,
    yMax: 5,
    pixelsParCm: 22,
    yUnite: 0.8,
  })

const graphiqueSeptembre2021Metropole = () => {
  const croix = (x: number, y: number) => [
    segment(x - 0.08, y - 0.4, x + 0.08, y + 0.4),
    segment(x - 0.08, y + 0.4, x + 0.08, y - 0.4),
  ]
  const ordonneeC = -20 * Math.exp(-2.5)

  return graphique(
    (x) => (10 * x + 5) * Math.exp(x),
    {
      xMin: -6,
      xMax: 1,
      yMin: -4,
      yMax: 22,
      pixelsParCm: 28,
      courbeXMax: 0.3,
      yThickDistance: 5,
      yUnite: 0.2,
    },
    [
      segment(-0.5, -2.5 * 0.2, 1, 20 * 0.2),
      segment(
        -5.5,
        (ordonneeC + 3 * 10 * Math.exp(-2.5)) * 0.2,
        -1,
        (ordonneeC - 1.5 * 10 * Math.exp(-2.5)) * 0.2,
      ),
      ...croix(0, 5 * 0.2),
      ...croix(1, 20 * 0.2),
      ...croix(-2.5, ordonneeC * 0.2),
      texteParPosition('A', -0.15, 6 * 0.2),
      texteParPosition('B', 0.85, 21 * 0.2),
      texteParPosition('C', -2.65, (ordonneeC - 1) * 0.2),
    ],
  )
}

const graphiqueJanvier2021 = () => {
  const noeuds: NoeudSpline[] = [
    { x: -4, y: 0, deriveeGauche: 2.5, deriveeDroit: 2.5, isVisible: false },
    {
      x: -3.2,
      y: 2.2,
      deriveeGauche: 1.7,
      deriveeDroit: 1.7,
      isVisible: false,
    },
    { x: -2, y: 3.4, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
    {
      x: -1,
      y: 2.2,
      deriveeGauche: -1.7,
      deriveeDroit: -1.7,
      isVisible: false,
    },
    { x: 0, y: 0, deriveeGauche: -2, deriveeDroit: -2, isVisible: false },
    { x: 0.4, y: -1, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
    { x: 1, y: -1.1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
    { x: 1.6, y: -0.7, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
    { x: 2, y: 0, deriveeGauche: 2, deriveeDroit: 2, isVisible: false },
    { x: 2.5, y: 1.5, deriveeGauche: 2, deriveeDroit: 2, isVisible: false },
    { x: 3, y: 2, deriveeGauche: 0.9, deriveeDroit: 0.9, isVisible: false },
    { x: 3.5, y: 2.4, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
    { x: 4, y: 2, deriveeGauche: -1.2, deriveeDroit: -1.2, isVisible: false },
  ]
  const r = repere({
    xMin: -4,
    xMax: 4,
    yMin: -1.5,
    yMax: 3.5,
    xLabelMin: -4,
    xLabelMax: 4,
    yLabelMin: -1,
    yLabelMax: 3,
    xThickDistance: 1,
    yThickDistance: 1,
    axeXStyle: '->',
    axeYStyle: '->',
    grilleSecondaire: true,
    grilleSecondaireXDistance: 1,
    grilleSecondaireYDistance: 1,
    grilleSecondaireXMin: -4,
    grilleSecondaireXMax: 4,
    grilleSecondaireYMin: -1,
    grilleSecondaireYMax: 3,
  })

  return mathalea2d(
    {
      xmin: -4.5,
      xmax: 4.5,
      ymin: -2,
      ymax: 4,
      pixelsParCm: 24,
      scale: 0.95,
      center: !context.isHtml,
      centerLatex: true,
    },
    r,
    spline(noeuds).courbe({ color: bleuMathalea, epaisseur: 2 }),
  )
}

const qcmConvexite: QcmItem[] = [
  {
    enonce:
      "On considère la fonction $f$ définie sur l'intervalle $[0~;~\\pi]$ par $f(x)=x+\\sin(x)$.<br>On admet que $f$ est deux fois dérivable.",
    reponses: [
      { texte: "La fonction $f$ est convexe sur l'intervalle $[0~;~\\pi]$" },
      {
        texte: "La fonction $f$ est concave sur l'intervalle $[0~;~\\pi]$",
        statut: true,
      },
      {
        texte:
          "La fonction $f$ admet sur l'intervalle $[0~;~\\pi]$ un unique point d'inflexion",
      },
      {
        texte:
          "La fonction $f$ admet sur l'intervalle $[0~;~\\pi]$ exactement deux points d'inflexion",
      },
    ],
    correction:
      `On a $f'(x)=1+\\cos(x)$ puis $f''(x)=-\\sin(x)$. Or $\\sin(x)\\geqslant0$ sur $[0~;~\\pi]$, donc $f''(x)\\leqslant0$${sp()}: $f$ est concave.`,
  },
  {
    enonce:
      `La fonction $h$ définie sur $\\mathbb{R}$ par $h(x)=(x+1)\\mathrm{e}^{x}$ est${sp()}:`,
    reponses: [
      { texte: 'concave sur $\\mathbb{R}$' },
      { texte: 'convexe sur $\\mathbb{R}$' },
      {
        texte: 'convexe sur $]-\\infty~;~-3]$ et concave sur $[-3~;~+\\infty[$',
      },
      {
        texte: 'concave sur $]-\\infty~;~-3]$ et convexe sur $[-3~;~+\\infty[$',
        statut: true,
      },
    ],
    correction:
      "On a $h''(x)=(x+3)\\mathrm{e}^x$. Comme $\\mathrm{e}^x>0$, le signe de $h''$ est celui de $x+3$.",
  },
  {
    enonce: () =>
      avecGraphique(
        `La courbe $\\mathcal{C}$ ci-dessous représente une fonction $f$ définie et deux fois dérivable sur $]0~;~+\\infty[$. On sait que${sp()}:<br><br>- le maximum de la fonction $f$ est atteint au point d'abscisse $3$ ;<br>- le point $P$ d'abscisse $5$ est l'unique point d'inflexion de la courbe $\\mathcal{C}$.<br><br>On peut affirmer que${sp()}:`,
        graphiqueMars2023G1(),
      ),
    reponses: [
      {
        texte: "pour tout $x\\in]0~;~5[$, $f(x)$ et $f'(x)$ sont de même signe",
      },
      {
        texte:
          "pour tout $x\\in]5~;~+\\infty[$, $f(x)$ et $f'(x)$ sont de même signe",
      },
      {
        texte:
          "pour tout $x\\in]0~;~5[$, $f'(x)$ et $f''(x)$ sont de même signe",
      },
      {
        texte:
          "pour tout $x\\in]5~;~+\\infty[$, $f(x)$ et $f''(x)$ sont de même signe",
        statut: true,
      },
    ],
    correction:
      "Pour $x>5$, la courbe est au-dessus de l'axe et elle est convexe. Ainsi $f(x)>0$ et $f''(x)>0$.",
  },
  {
    enonce:
      `On considère la fonction $h$ définie sur $\\mathbb{R}$ par${sp()}:<br>$h(x)=(4x-16)\\mathrm{e}^{2x}$.<br>On note $\\mathcal{C}_h$ la courbe représentative de $h$ dans un repère orthogonal.<br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: '$h$ est convexe sur $\\mathbb{R}$.' },
      {
        texte: "$\\mathcal{C}_h$ possède un point d'inflexion en $x=3$.",
        statut: true,
      },
      { texte: '$h$ est concave sur $\\mathbb{R}$.' },
      {
        texte: "$\\mathcal{C}_h$ possède un point d'inflexion en $x=3{,}5$.",
      },
    ],
    correction:
      "On a $h''(x)=16(x-3)\\mathrm{e}^{2x}$. Comme $\\mathrm{e}^{2x}>0$, $h''$ change de signe en $x=3$.",
  },
  {
    enonce: () =>
      avecGraphique(
        "On considère une fonction $f$ définie et deux fois dérivable sur $\\mathbb{R}$.<br><br>On appelle $\\mathcal{C}$ sa représentation graphique.<br><br>On désigne par $f''$ la dérivée seconde de $f$.<br><br>On a représenté sur le graphique ci-contre la courbe de $f''$, notée $\\mathcal{C}''$.",
        graphiqueSeptembre2022Sujet1(),
      ),
    reponses: [
      { texte: "$\\mathcal{C}$ admet un unique point d'inflexion ;" },
      { texte: '$f$ est convexe sur $[-1~;~2]$.' },
      {
        texte: '$f$ est convexe sur $]-\\infty~;~-1]$ et sur $[2~;~+\\infty[$.',
        statut: true,
      },
      { texte: '$f$ est convexe sur $\\mathbb{R}$.' },
    ],
    correction:
      "La courbe de $f''$ est au-dessus de l'axe sur $]-\\infty~;~-1]$ et sur $[2~;~+\\infty[$. Donc $f$ y est convexe.",
  },
  {
    enonce: () =>
      avecGraphique(
        "On considère une fonction $f$ deux fois dérivable sur l'intervalle $[-4~;~2]$.<br><br>On donne ci-dessous la courbe représentative $\\mathcal{C}'$ de la fonction dérivée $f'$ dans un repère du plan.",
        graphiqueSeptembre2022Sujet2(),
      ) + `La fonction $f$ est${sp()}:`,
    reponses: [
      { texte: 'La fonction $f$ est concave sur $[-2~;~1]$ ;' },
      { texte: 'La fonction $f$ est convexe sur $[-4~;~0]$ ;', statut: true },
      { texte: 'La fonction $f$ est convexe sur $[-2~;~1]$ ;' },
      { texte: 'La fonction $f$ est convexe sur $[0~;~2]$.' },
    ],
    correction:
      "$f$ est convexe là où $f'$ est croissante. Sur le graphique, $f'$ est croissante sur $[-4~;~0]$.",
  },
  {
    enonce: () =>
      avecGraphique(
        "On considère une fonction $f$ deux fois dérivable sur l'intervalle $[-4~;~2]$.<br><br>On donne ci-dessous la courbe représentative $\\mathcal{C}'$ de la fonction dérivée $f'$ dans un repère du plan. On donne les points B$(1~;~0)$ et C$(0~;~5)$.",
        graphiqueSeptembre2022Sujet2(),
      ) +
      `On admet que la droite (BC) est la tangente à la courbe $\\mathcal{C}'$ au point B.<br>Quelle égalité ou inégalité peut-on affirmer${sp()}?`,
    reponses: [
      { texte: "$f'(1)<0$" },
      { texte: "$f'(1)=5$" },
      { texte: "$f''(1)>0$" },
      { texte: "$f''(1)=-5$", statut: true },
    ],
    correction:
      "$f''(1)$ est le coefficient directeur de la tangente à $\\mathcal{C}'$ en B. La droite $(BC)$ a pour pente $\\dfrac{0-5}{1-0}=-5$.",
  },
  {
    enonce:
      `Soit la fonction $g$ définie pour tout réel $x$ strictement positif par${sp()}:<br>$g(x)=x\\ln(x)-x^2$.<br><br>On note $\\mathcal{C}_g$ sa courbe représentative dans un repère du plan.`,
    reponses: [
      { texte: 'La fonction $g$ est convexe sur $]0~;~+\\infty[$.' },
      { texte: 'La fonction $g$ est concave sur $]0~;~+\\infty[$.' },
      {
        texte:
          "$\\mathcal{C}_g$ admet exactement un point d'inflexion sur $]0~;~+\\infty[$.",
        statut: true,
      },
      {
        texte:
          "$\\mathcal{C}_g$ admet exactement deux points d'inflexion sur $]0~;~+\\infty[$.",
      },
    ],
    correction:
      "$g''(x)=\\dfrac1x-2=\\dfrac{1-2x}{x}$. Sur $]0~;~+\\infty[$, $g''$ change de signe en $x=\\dfrac12$.",
  },
  {
    enonce:
      `On considère la fonction $h$ définie sur l'intervalle $]0~;~2]$ par${sp()}:<br>$h(x)=x^2(1+2\\ln(x))$.<br><br>On note $\\mathcal{C}_h$ sa courbe représentative dans un repère du plan.<br><br>On admet que $h$ est deux fois dérivable et que, pour tout réel $x\\in]0~;~2]$${sp()}:<br>$h'(x)=4x(1+\\ln(x))$.<br><br>Sur l'intervalle $]0~;~2]$, le nombre de points d'inflexion de la courbe $\\mathcal{C}_h$ est égal à${sp()}:`,
    reponses: [
      { texte: '$0$' },
      { texte: '$1$', statut: true },
      { texte: '$2$' },
      { texte: '$3$' },
    ],
    correction:
      `$h''(x)=4(2+\\ln(x))$. Cette dérivée seconde s'annule en $x=\\mathrm{e}^{-2}$ et change de signe${sp()}: il y a un unique point d'inflexion.`,
  },
  {
    enonce: () =>
      avecGraphique(
        `On donne ci-contre la représentation graphique $\\mathcal{C}_{f'}$ de la fonction dérivée $f'$ d'une fonction $f$ définie sur $\\mathbb{R}$.<br><br>On peut affirmer que la fonction $f$ est${sp()}:`,
        graphiqueMai2022Metropole(),
      ),
    reponses: [
      { texte: 'La fonction $f$ est concave sur $]0~;~+\\infty[$ ;' },
      { texte: 'La fonction $f$ est convexe sur $]0~;~+\\infty[$ ;' },
      { texte: 'La fonction $f$ est convexe sur $[0~;~2]$ ;', statut: true },
      { texte: 'La fonction $f$ est convexe sur $[2~;~+\\infty[$.' },
    ],
    correction:
      "$f$ est convexe là où $f'$ est croissante. D'après la courbe, $f'$ est croissante sur $[0~;~2]$.",
  },
  {
    enonce: () =>
      avecGraphique(
        `On considère une fonction $f$ définie et dérivable sur $[-2~;~2]$. Le tableau de variations de la fonction $f'$ dérivée de la fonction $f$ sur l'intervalle $[-2~;~2]$ est donné par${sp()}:`,
        tableauVariationsPolynesie(),
      ) + `La fonction $f$ est${sp()}:`,
    reponses: [
      { texte: 'convexe sur $[-2~;~-1]$' },
      { texte: 'concave sur $[0~;~1]$' },
      { texte: 'convexe sur $[-1~;~2]$' },
      { texte: 'concave sur $[-2~;~0]$', statut: true },
    ],
    correction:
      "$f'$ décroît sur $[-2~;~0]$, donc $f''\\leqslant0$ sur cet intervalle et $f$ y est concave.",
  },
  {
    enonce: () =>
      avecGraphique(
        `Soit $f$ une fonction deux fois dérivable sur l'intervalle $[-3~;~1]$. On donne ci-dessous la représentation graphique de sa fonction dérivée seconde $f''$.<br><br>On peut alors affirmer que${sp()}:`,
        graphiqueMai2022Etrangers(),
      ),
    reponses: [
      { texte: '$f$ est convexe sur $[-1~;~1]$' },
      { texte: '$f$ est concave sur $[-2~;~0]$' },
      { texte: "$f'$ est décroissante sur $[-2~;~0]$" },
      { texte: "$f'$ admet un maximum en $x=-1$", statut: true },
    ],
    correction:
      `On lit $f''>0$ avant $x=-1$ puis $f''<0$ après $x=-1$. Ainsi $f'$ croît puis décroît${sp()}: elle admet un maximum en $x=-1$.`,
  },
  {
    enonce: () =>
      avecGraphique(
        `Dans un repère, on a tracé ci-contre la courbe représentative d'une fonction $f$ définie et deux fois dérivable sur $[-2~;~4]$.<br><br>Parmi les courbes suivantes, laquelle représente la fonction $f''$, dérivée seconde de $f$${sp()}?`,
        graphiqueMai2022CourbeF(),
      ),
    reponses: [
      { texte: () => graphiqueMini((x) => x - 1), statut: true },
      { texte: () => graphiqueMini((x) => 1 - x) },
      { texte: () => graphiqueMini((x) => (x * (x - 2)) / 3) },
      { texte: () => graphiqueMini((x) => (x - 1) ** 2 / 2) },
    ],
    correction:
      "La courbe est celle d'une fonction de type cubique avec un changement de convexité en $x=1$. Sa dérivée seconde est affine, croissante et s'annule en $1$.",
    vertical: false,
  },
  {
    enonce:
      `Soit $g$ la fonction définie sur $\\mathbb{R}$ par $g(x)=x^{1000}+x$.<br><br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: 'la fonction $g$ est concave sur $\\mathbb{R}$.' },
      { texte: 'la fonction $g$ est convexe sur $\\mathbb{R}$.', statut: true },
      { texte: "la fonction $g$ possède exactement un point d'inflexion." },
      { texte: "la fonction $g$ possède exactement deux points d'inflexion." },
    ],
    correction:
      "$g''(x)=1000\\times999x^{998}\\geqslant0$ sur $\\mathbb{R}$. La fonction $g$ est donc convexe.",
  },
  {
    enonce: () =>
      avecGraphique(
        "On considère une fonction $f$ définie et deux fois dérivable sur $\\mathbb{R}$.<br><br>La courbe de sa fonction dérivée $f'$ est donnée ci-dessous. On admet que $f'$ admet un maximum en $-\\dfrac{3}{2}$.",
        graphiqueMai2022Sujet2(),
      ) + `On peut affirmer que${sp()}:`,
    reponses: [
      {
        texte: '$f$ est convexe sur $]-\\infty~;~-\\dfrac32[$',
        statut: true,
      },
      { texte: '$f$ est convexe sur $]-\\infty~;~-\\dfrac12[$' },
      {
        texte: "$\\mathcal{C}_f$ n'admet pas de point d'inflexion.",
      },
      { texte: '$f$ est concave sur $]-\\infty~;~-\\dfrac12[$' },
    ],
    correction:
      "$f'$ est croissante avant $-\\dfrac32$, puis décroissante après. Donc $f$ est convexe sur $]-\\infty~;~-\\dfrac32[$.",
  },
  {
    enonce: () =>
      avecGraphique(
        "On considère une fonction $f$ définie et deux fois dérivable sur $\\mathbb{R}$.<br><br>La courbe de sa fonction dérivée $f'$ est donnée ci-dessous. On admet que $f'$ admet un maximum en $-\\dfrac{3}{2}$.",
        graphiqueMai2022Sujet2(),
      ) + `La dérivée seconde $f''$ de la fonction $f$ vérifie${sp()}:`,
    reponses: [
      {
        texte:
          "$f''(x)\\geqslant0$ pour $x\\in\\left]-\\infty~;~-\\dfrac12\\right[$",
      },
      { texte: "$f''(x)\\geqslant0$ pour $x\\in[-2~;~-1]$" },
      { texte: "$f''\\left(-\\dfrac32\\right)=0$", statut: true },
      { texte: "$f''(-3)=0$" },
    ],
    correction:
      "La tangente à la courbe de $f'$ est horizontale en son maximum d'abscisse $-\\dfrac32$. Ainsi $f''(-\\dfrac32)=0$.",
  },
  {
    enonce: () =>
      avecGraphique(
        "Le graphique ci-contre donne la représentation graphique $\\mathcal{C}_f$ dans un repère orthogonal d'une fonction $f$ définie et deux fois dérivable sur $\\mathbb{R}$.<br>Le point C est le point de la courbe $\\mathcal{C}_f$ ayant pour abscisse $-2{,}5$.",
        graphiqueSeptembre2021Metropole(),
      ) +
      `On admet que la dérivée seconde de la fonction $f$ est définie sur $\\mathbb{R}$ par${sp()}:<br>$f''(x)=(10x+25)\\mathrm{e}^x$.<br><br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: 'La fonction $f$ est convexe sur $\\mathbb{R}$' },
      { texte: 'La fonction $f$ est concave sur $\\mathbb{R}$' },
      {
        texte: "Le point C est l'unique point d'inflexion de $\\mathcal{C}_f$",
        statut: true,
      },
      { texte: "$\\mathcal{C}_f$ n'admet pas de point d'inflexion" },
    ],
    correction:
      "Comme $\\mathrm{e}^x>0$, le signe de $f''$ est celui de $10x+25$, qui s'annule en $x=-\\dfrac52$ et change de signe.",
  },
  {
    enonce: () =>
      avecGraphique(
        "On donne ci-dessous la courbe $\\mathcal{C}_{f''}$ représentant la fonction dérivée seconde $f''$ d'une fonction $f$ définie et deux fois dérivable sur l'intervalle $[-3{,}5~;~6]$.",
        graphiqueJuin2021Asie(),
      ) + `On peut affirmer que${sp()}:`,
    reponses: [
      { texte: 'La fonction $f$ est convexe sur $[-3~;~3]$.' },
      {
        texte: "La fonction $f$ admet trois points d'inflexion.",
        statut: true,
      },
      {
        texte:
          "La fonction dérivée $f'$ de $f$ est décroissante sur $[0~;~2]$.",
      },
    ],
    correction:
      "Les points d'inflexion correspondent aux abscisses où $f''$ change de signe. Le graphique montre trois intersections avec changement de signe.",
  },
  {
    enonce:
      `Soit $f$ la fonction définie pour tout nombre réel $x$ de l'intervalle $]0~;~+\\infty[$ par${sp()}:<br>$f(x)=\\dfrac{\\mathrm{e}^{2x}}{x}$.<br><br>On donne l'expression de la dérivée seconde $f''$ de $f$, définie sur l'intervalle $]0~;~+\\infty[$ par${sp()}:<br>$f''(x)=\\dfrac{2\\mathrm{e}^{2x}(2x^2-2x+1)}{x^3}$.<br><br>La fonction $f$${sp()}:`,
    reponses: [
      { texte: 'est concave sur $]0~;~+\\infty[$' },
      { texte: 'est convexe sur $]0~;~+\\infty[$', statut: true },
      { texte: 'est concave sur $]0~;~\\dfrac12]$' },
      {
        texte: "est représentée par une courbe admettant un point d'inflexion",
      },
    ],
    correction:
      "Sur $]0~;~+\\infty[$, $\\mathrm{e}^{2x}>0$, $x^3>0$ et $2x^2-2x+1>0$. Donc $f''(x)>0$.",
  },
  {
    enonce: () =>
      avecGraphique(
        `On suppose que $g$ est une fonction dérivable sur l'intervalle $[-4~;~4]$.<br>On donne ci-contre la représentation graphique de sa fonction dérivée $g'$.<br><br>On peut affirmer que${sp()}:`,
        graphiqueJanvier2021(),
      ),
    reponses: [
      { texte: '$g$ admet un maximum en $-2$.' },
      { texte: "$g$ est croissante sur l'intervalle $[1~;~2]$." },
      { texte: "$g$ est convexe sur l'intervalle $[1~;~2]$.", statut: true },
      { texte: '$g$ admet un minimum en $0$.' },
    ],
    correction:
      "$g$ est convexe là où $g'$ est croissante. Sur le graphique, $g'$ est croissante sur $[1~;~2]$.",
  },
]

/**
 * Série statique de QCM de Bac sur la convexité.
 *
 * @author Stéphane Guyon
 */
export default class QcmConvexiteStatique extends Exercice {
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

    const nbQuestions = Math.min(this.nbQuestions, qcmConvexite.length)
    const questions = shuffle(qcmConvexite).slice(0, nbQuestions)

    for (const [index, qcm] of questions.entries()) {
      const qcmData = buildQcmForExercise(this, index, {
        question: `${
          typeof qcm.enonce === 'function' ? qcm.enonce() : qcm.enonce
        }`,
        correction: qcm.correction,
        propositions: qcm.reponses.map((reponse) => ({
          texte:
            typeof reponse.texte === 'function'
              ? reponse.texte()
              : reponse.texte,
          statut: reponse.statut ?? false,
        })),
        options: {
          vertical: qcm.vertical ?? false,
          ordered: true,
        },
      })

      this.listeQuestions[index] = qcmData.question
      this.listeCorrections[index] = qcmData.correction
    }
  }
}
