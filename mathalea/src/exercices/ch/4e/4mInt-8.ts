import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { courbe } from '../../../lib/2d/Courbe'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { repere } from '../../../lib/2d/reperes'
import { latex2d } from '../../../lib/2d/textes'
import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
    ecritureAlgebrique,
    ecritureParentheseSiNegatif,
    reduireAxPlusB,
    rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { numAlpha } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Calculer l'aire d'un domaine délimité par deux courbes"
export const dateDePublication = '18/09/2026'
export const uuid = '7b0fb'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-8'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Familles de fonctions',
      items: [
        { nom: 'paraboles', label: 'Parabole et droite ou parabole' },
        { nom: 'cubique', label: 'Cubique et parabole' },
        { nom: 'trigo', label: 'Sinus et cosinus' },
        { nom: 'racine', label: 'Racine carrée' },
        { nom: 'expLn', label: 'Exponentielle et logarithme' },
      ],
    },
    {
      type: 'case',
      nom: 'pointsDonnes',
      label: "Donner les abscisses respectives des points d'intersection",
      defaut: false,
    },
  ],
}

type Borne = { valeur: number; tex: string }

/** Un intervalle entre deux points d'intersection consécutifs, avec l'intégrale de la différence positive. */
type Morceau = {
  a: Borne
  b: Borne
  haut: 'f' | 'g'
  /** Justification du signe de f - g, phrase avec ses propres $, par exemple « $f(1)-g(1)=3>0$ ». */
  justification: string
  integrandeTex: string
  primitiveTex: string
  /** F(b)-F(a) écrit avec les valeurs, puis éventuellement simplifié. */
  evaluationTex: string
  valeurTex: string
  valeur: number
  /** Valeur exacte lorsqu'elle est rationnelle, pour sommer les morceaux. */
  valeurExacte?: FractionEtendue
}

type Tirage = {
  fTex: string
  gTex: string
  f: (x: number) => number
  g: (x: number) => number
  racines: Borne[]
  /** Résolution de f(x) = g(x) jusqu'aux solutions, vide si l'équation n'est pas résoluble algébriquement. */
  resolutionTex: string
  /** Vrai quand les abscisses respectives des points d'intersection doivent toujours être données. */
  pointsToujoursDonnes?: boolean
  morceaux: Morceau[]
  aireTex: string
  fenetre: { xMin: number; xMax: number; yMin: number; yMax: number }
  xLabels?: { valeur: number; texte: string }[]
  /** Abscisse à partir de laquelle tracer les courbes (racine carrée, logarithme). */
  debutTrace?: number
}

/** Les bornes d'une intégrale sont en indice : \dfrac y est illisible. */
const enIndice = (tex: string) => tex.replaceAll('\\dfrac', '\\frac')

/** Écrit q·symbole pour un rationnel q : 0, \sqrt{3}, -2\sqrt{3}, \dfrac{3\sqrt{3}}{2}… */
function termeTex(q: FractionEtendue, symbole: string): string {
  const r = q.simplifie()
  if (r.valeurDecimale === 0) return '0'
  const signe = r.valeurDecimale < 0 ? '-' : ''
  const num = Math.abs(r.num)
  const den = Math.abs(r.den)
  const numerateur = `${num === 1 ? '' : num}${symbole}`
  return den === 1
    ? `${signe}${numerateur}`
    : `${signe}\\dfrac{${numerateur}}{${den}}`
}

/** Écrit qπ pour un rationnel q : 0, \pi, -2\pi, \dfrac{3\pi}{2}… */
const piTex = (q: FractionEtendue) => termeTex(q, '\\pi')

/** Somme de termes déjà signés : a + (-b) s'écrit a - b. */
const sommeTex = (...termes: string[]) =>
  termes
    .filter((terme) => terme !== '0')
    .join('+')
    .replaceAll('+-', '-') || '0'

const differenceTex = (fb: string, fa: string) =>
  `${fb}-${fa.startsWith('-') ? `\\left(${fa}\\right)` : fa}`

const frac = (num: number, den = 1) => new FractionEtendue(num, den).simplifie()

/** Valeur exacte d'un polynôme à coefficients entiers ou rationnels en un rationnel. */
function evaluePolynomeExact(p: Polynome, x: FractionEtendue): FractionEtendue {
  return p.monomes
    .reduce<FractionEtendue>(
      (somme, coefficient, j) =>
        somme.sommeFraction(
          (coefficient instanceof FractionEtendue
            ? coefficient
            : frac(Number(coefficient))
          ).produitFraction(x.puissanceFraction(j)),
        ),
      frac(0),
    )
    .simplifie()
}

const borneRationnelle = (q: FractionEtendue): Borne => ({
  valeur: q.valeurDecimale,
  tex: q.simplifie().texFractionSimplifiee,
})

/**
 * Morceau [a ; b] pour des fonctions polynomiales : `diff` est f - g, dont le
 * signe sur ]a ; b[ est lu au milieu de l'intervalle.
 */
function morceauPolynomial(
  diff: Polynome,
  a: FractionEtendue,
  b: FractionEtendue,
): Morceau {
  const milieu = a.sommeFraction(b).diviseFraction(frac(2)).simplifie()
  const signe = evaluePolynomeExact(diff, milieu)
  const haut = signe.valeurDecimale > 0 ? 'f' : 'g'
  // Coefficients en fractions pour que la primitive s'écrive avec des fractions et non des décimaux.
  const integrande = new Polynome({
    coeffs: diff.monomes.map((c) =>
      frac(haut === 'f' ? Number(c) : -Number(c)),
    ),
    useFraction: true,
  })
  const primitive = integrande.primitive0()
  const fb = evaluePolynomeExact(primitive, b)
  const fa = evaluePolynomeExact(primitive, a)
  const valeur = fb.differenceFraction(fa).simplifie()
  const m = milieu.texFractionSimplifiee
  return {
    a: borneRationnelle(a),
    b: borneRationnelle(b),
    haut,
    justification: `$f\\left(${m}\\right)-g\\left(${m}\\right)=${signe.texFractionSimplifiee}${haut === 'f' ? '>' : '<'}0$`,
    integrandeTex: integrande.toLatex(),
    primitiveTex: primitive.toLatex(),
    evaluationTex: differenceTex(
      fb.texFractionSimplifiee,
      fa.texFractionSimplifiee,
    ),
    valeurTex: valeur.texFractionSimplifiee,
    valeur: valeur.valeurDecimale,
    valeurExacte: valeur,
  }
}

/** Somme exacte de morceaux rationnels, écrite en fraction. */
const sommeRationnelle = (morceaux: Morceau[]) =>
  morceaux
    .reduce(
      (somme, morceau) => somme.sommeFraction(morceau.valeurExacte ?? frac(0)),
      frac(0),
    )
    .simplifie().texFractionSimplifiee

const coefficientsPetits = (p: Polynome, max: number) =>
  p.monomes.every((c) => Math.abs(Number(c)) <= max)

/** Polynôme à coefficients entiers, sans zéros inutiles en tête (toLatex les écrirait « +4x »). */
function polynome(coeffs: number[]): Polynome {
  const copie = [...coeffs]
  while (copie.length > 1 && copie[copie.length - 1] === 0) copie.pop()
  return new Polynome({ coeffs: copie })
}

/** Recrée un polynôme à coefficients entiers issu d'un calcul, débarrassé des zéros en tête. */
const entier = (p: Polynome) => polynome(p.monomes.map(Number))

/**
 * Fenêtre verticale contenant entièrement f et g sur [a ; b] (les régions
 * ombrées), arrondie aux entiers : au-delà, les courbes sont tronquées.
 */
function fenetreY(
  f: (x: number) => number,
  g: (x: number) => number,
  a: number,
  b: number,
) {
  let yMin = -1
  let yMax = 1
  for (let x = a; x <= b + 1e-9; x += (b - a) / 200) {
    yMin = Math.min(yMin, f(x), g(x))
    yMax = Math.max(yMax, f(x), g(x))
  }
  return { yMin: Math.floor(yMin) - 1, yMax: Math.ceil(yMax) + 1 }
}

/** f - g = k(x - r1)(x - r2) : une seule région, résolution par le discriminant. */
function tirerParaboles(): Tirage {
  let k: number
  let r1: number
  let r2: number
  // Aire |k|(r2 - r1)³/6 d'au moins 1,5 pour qu'elle soit visible sur la figure.
  do {
    k = choice([-2, -1, 1, 2])
    r1 = randint(-3, 1)
    r2 = Math.min(3, r1 + randint(1, 4))
  } while ((Math.abs(k) * (r2 - r1) ** 3) / 6 < 1.5)
  const diff = polynome([k * r1 * r2, -k * (r1 + r2), k])
  let g: Polynome
  let f: Polynome
  // Ni f ni g ne doit être constante (droite horizontale, voire l'axe des abscisses).
  do {
    g = polynome([randint(-3, 3), randint(-3, 3), randint(-1, 1)])
    f = entier(g.add(diff))
  } while (g.deg < 1 || f.deg < 1)
  const [c, b, a] = diff.monomes.map(Number)
  const delta = b * b - 4 * a * c
  const racineDelta = Math.abs(k) * (r2 - r1)
  const morceau = morceauPolynomial(diff, frac(r1), frac(r2))
  const facteur = (r: number) =>
    r === 0 ? 'x' : `\\left(x${ecritureAlgebrique(-r)}\\right)`
  const resolutionTex =
    `$f(x)=g(x)\\iff ${f.toLatex()}=${g.toLatex()}\\iff ${diff.toLatex()}=0$.<br>` +
    `Le discriminant de ce trinôme est $\\Delta=${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${delta}$, d'où $\\sqrt{\\Delta}=${racineDelta}$ et<br>` +
    `$x_1=\\dfrac{${-b}-${racineDelta}}{${2 * a}}=${(-b - racineDelta) / (2 * a)}$ ou $x_2=\\dfrac{${-b}+${racineDelta}}{${2 * a}}=${(-b + racineDelta) / (2 * a)}$.<br>` +
    `On a donc $${diff.toLatex()}=${rienSi1(k)}${facteur(r1)}${facteur(r2)}$ et les solutions sont $x=${r1}$ et $x=${r2}$.`
  const xMin = r1 - 2
  const xMax = r2 + 2
  return {
    fTex: f.toLatex(),
    gTex: g.toLatex(),
    f: f.fonction,
    g: g.fonction,
    racines: [frac(r1), frac(r2)].map(borneRationnelle),
    resolutionTex,
    morceaux: [morceau],
    aireTex: morceau.valeurTex,
    fenetre: { xMin, xMax, ...fenetreY(f.fonction, g.fonction, r1, r2) },
  }
}

/** f - g = k·x·(q1x - p1)(q2x - p2) : deux régions, factorisation par x puis trinôme. */
function tirerCubique(): Tirage {
  const racinesNegatives = [
    [-3, 1],
    [-2, 1],
    [-1, 1],
    [-3, 2],
    [-1, 2],
  ]
  const racinesPositives = [
    [1, 1],
    [2, 1],
    [3, 1],
    [3, 2],
    [1, 2],
  ]
  for (;;) {
    const [p1, q1] = choice(racinesNegatives)
    const [p2, q2] = choice(racinesPositives)
    if (q1 === 2 && q2 === 2) continue
    const k = choice([-2, -1, 1, 2])
    // (q1x - p1)(q2x - p2), puis multiplication par kx.
    const trinome = polynome([p1 * p2, -(p1 * q2 + p2 * q1), q1 * q2])
    const kTrinome = trinome.multiply(k)
    const diff = kTrinome.multiply(polynome([0, 1]))
    const g = polynome([randint(-4, 4), randint(-4, 4), randint(-3, 3, [0])])
    const f = entier(g.add(diff))
    if (!coefficientsPetits(diff, 12) || !coefficientsPetits(f, 12)) continue
    const r1 = frac(p1, q1)
    const r2 = frac(p2, q2)
    const morceaux = [
      morceauPolynomial(diff, r1, frac(0)),
      morceauPolynomial(diff, frac(0), r2),
    ]
    // Aire d'au moins 1,5 pour qu'elle soit visible sur la figure, qui doit rester lisible.
    if (morceaux[0].valeur + morceaux[1].valeur < 1.5) continue
    const fenetre = fenetreY(
      f.fonction,
      g.fonction,
      r1.valeurDecimale,
      r2.valeurDecimale,
    )
    if (fenetre.yMax - fenetre.yMin > 20) continue
    const facteur = (p: number, q: number) =>
      `\\left(${reduireAxPlusB(q, -p)}\\right)`
    const resolutionTex =
      `$f(x)=g(x)\\iff ${f.toLatex()}=${g.toLatex()}\\iff ${diff.toLatex()}=0\\iff x\\left(${kTrinome.toLatex()}\\right)=0\\iff ${rienSi1(k)}x${facteur(p1, q1)}${facteur(p2, q2)}=0$.<br>` +
      `Un produit est nul si et seulement si l'un de ses facteurs est nul : les solutions sont $x=${r1.texFractionSimplifiee}$, $x=0$ et $x=${r2.texFractionSimplifiee}$.`
    const xMin = Math.floor(r1.valeurDecimale) - 1
    const xMax = Math.ceil(r2.valeurDecimale) + 1
    return {
      fTex: f.toLatex(),
      gTex: g.toLatex(),
      f: f.fonction,
      g: g.fonction,
      racines: [r1, frac(0), r2].map(borneRationnelle),
      resolutionTex,
      morceaux,
      aireTex: sommeRationnelle(morceaux),
      fenetre: { xMin, xMax, ...fenetre },
    }
  }
}

/** Étiquettes des multiples non nuls de π/2 dans [xMin ; xMax]. */
function etiquettesPi(xMin: number, xMax: number) {
  const labels: { valeur: number; texte: string }[] = []
  for (let n = Math.ceil((2 * xMin) / Math.PI); n <= (2 * xMax) / Math.PI; n++)
    if (n !== 0)
      labels.push({
        valeur: (n * Math.PI) / 2,
        texte: enIndice(piTex(frac(n, 2))),
      })
  return labels
}

const bornePi = (q: FractionEtendue): Borne => ({
  valeur: q.valeurDecimale * Math.PI,
  tex: piTex(q),
})

/** Sinus ou cosinus contre une constante, ou l'un contre l'autre : région entre deux intersections consécutives. */
function tirerTrigo(): Tirage {
  const k = randint(1, 3)
  const kTex = rienSi1(k)
  const type = choice(['sin', 'cos', 'sinCos'])
  const demiK = frac(k, 2).texFractionSimplifiee
  const racine3 = (q: FractionEtendue) => termeTex(q, '\\sqrt{3}')
  const aireRacine3 = sommeTex(racine3(frac(k)), piTex(frac(-k, 3)))
  const valeurRacine3 = k * Math.sqrt(3) - (k * Math.PI) / 3
  if (type === 'sin') {
    const racines = [bornePi(frac(1, 6)), bornePi(frac(5, 6))]
    return {
      fTex: `${kTex}\\sin(x)`,
      gTex: demiK,
      f: (x) => k * Math.sin(x),
      g: () => k / 2,
      racines,
      resolutionTex:
        `$f(x)=g(x)\\iff ${kTex}\\sin(x)=${demiK}\\iff \\sin(x)=\\dfrac{1}{2}\\iff x=\\dfrac{\\pi}{6}+2n\\pi$ ou $x=\\dfrac{5\\pi}{6}+2n\\pi$, avec $n\\in\\mathbb{Z}$.<br>` +
        `Deux points d'intersection consécutifs ont pour abscisses $\\dfrac{\\pi}{6}$ et $\\dfrac{5\\pi}{6}$.`,
      morceaux: [
        {
          a: racines[0],
          b: racines[1],
          haut: 'f',
          justification: `$f\\left(\\dfrac{\\pi}{2}\\right)=${k}>${demiK}=g\\left(\\dfrac{\\pi}{2}\\right)$`,
          integrandeTex: `${kTex}\\sin(x)-${demiK}`,
          primitiveTex: `-${kTex}\\cos(x)-${termeTex(frac(k, 2), 'x')}`,
          evaluationTex: `\\left(${sommeTex(racine3(frac(k, 2)), piTex(frac(-5 * k, 12)))}\\right)-\\left(${sommeTex(racine3(frac(-k, 2)), piTex(frac(-k, 12)))}\\right)`,
          valeurTex: aireRacine3,
          valeur: valeurRacine3,
        },
      ],
      aireTex: aireRacine3,
      fenetre: {
        xMin: -1,
        xMax: 2 * Math.PI + 0.5,
        yMin: -k - 0.5,
        yMax: k + 0.5,
      },
      xLabels: etiquettesPi(-1, 2 * Math.PI + 0.5),
    }
  }
  if (type === 'cos') {
    const racines = [bornePi(frac(-1, 3)), bornePi(frac(1, 3))]
    return {
      fTex: `${kTex}\\cos(x)`,
      gTex: demiK,
      f: (x) => k * Math.cos(x),
      g: () => k / 2,
      racines,
      resolutionTex:
        `$f(x)=g(x)\\iff ${kTex}\\cos(x)=${demiK}\\iff \\cos(x)=\\dfrac{1}{2}\\iff x=\\dfrac{\\pi}{3}+2n\\pi$ ou $x=-\\dfrac{\\pi}{3}+2n\\pi$, avec $n\\in\\mathbb{Z}$.<br>` +
        `Deux points d'intersection consécutifs ont pour abscisses $-\\dfrac{\\pi}{3}$ et $\\dfrac{\\pi}{3}$.`,
      morceaux: [
        {
          a: racines[0],
          b: racines[1],
          haut: 'f',
          justification: `$f(0)=${k}>${demiK}=g(0)$`,
          integrandeTex: `${kTex}\\cos(x)-${demiK}`,
          primitiveTex: `${kTex}\\sin(x)-${termeTex(frac(k, 2), 'x')}`,
          evaluationTex: `\\left(${sommeTex(racine3(frac(k, 2)), piTex(frac(-k, 6)))}\\right)-\\left(${sommeTex(racine3(frac(-k, 2)), piTex(frac(k, 6)))}\\right)`,
          valeurTex: aireRacine3,
          valeur: valeurRacine3,
        },
      ],
      aireTex: aireRacine3,
      fenetre: {
        xMin: -Math.PI - 0.5,
        xMax: Math.PI + 0.5,
        yMin: -k - 0.5,
        yMax: k + 0.5,
      },
      xLabels: etiquettesPi(-Math.PI - 0.5, Math.PI + 0.5),
    }
  }
  const racines = [bornePi(frac(1, 4)), bornePi(frac(5, 4))]
  const kRacine2 = termeTex(frac(k), '\\sqrt{2}')
  const aire = termeTex(frac(2 * k), '\\sqrt{2}')
  return {
    fTex: `${kTex}\\sin(x)`,
    gTex: `${kTex}\\cos(x)`,
    f: (x) => k * Math.sin(x),
    g: (x) => k * Math.cos(x),
    racines,
    resolutionTex:
      `$f(x)=g(x)\\iff ${kTex}\\sin(x)=${kTex}\\cos(x)$. Comme $\\cos(x)=0$ entraîne $\\sin(x)=\\pm1\\neq0$, on peut diviser par $\\cos(x)$ : ` +
      `$f(x)=g(x)\\iff \\tan(x)=1\\iff x=\\dfrac{\\pi}{4}+n\\pi$, avec $n\\in\\mathbb{Z}$.<br>` +
      `Deux points d'intersection consécutifs ont pour abscisses $\\dfrac{\\pi}{4}$ et $\\dfrac{5\\pi}{4}$.`,
    morceaux: [
      {
        a: racines[0],
        b: racines[1],
        haut: 'f',
        justification: `$f\\left(\\dfrac{\\pi}{2}\\right)=${k}>0=g\\left(\\dfrac{\\pi}{2}\\right)$`,
        integrandeTex: `${kTex}\\sin(x)-${kTex}\\cos(x)`,
        primitiveTex: `-${kTex}\\cos(x)-${kTex}\\sin(x)`,
        evaluationTex: `${kRacine2}-\\left(-${kRacine2}\\right)`,
        valeurTex: aire,
        valeur: 2 * k * Math.SQRT2,
      },
    ],
    aireTex: aire,
    fenetre: {
      xMin: -0.5,
      xMax: 2 * Math.PI + 0.5,
      yMin: -k - 0.5,
      yMax: k + 0.5,
    },
    xLabels: etiquettesPi(-0.5, 2 * Math.PI + 0.5),
  }
}

/** √x contre x/k ou x² : résolution par élévation au carré. */
function tirerRacine(): Tirage {
  const type = choice(['droite', 'droite', 'carre'])
  const k = type === 'droite' ? randint(1, 3) : 1
  const b = k * k
  const gTex = type === 'carre' ? 'x^2' : k === 1 ? 'x' : `\\dfrac{x}{${k}}`
  const g = type === 'carre' ? (x: number) => x * x : (x: number) => x / k
  const primitiveG =
    type === 'carre'
      ? '\\dfrac{x^3}{3}'
      : k === 1
        ? '\\dfrac{x^2}{2}'
        : `\\dfrac{x^2}{${2 * k}}`
  const valeurG = type === 'carre' ? frac(1, 3) : frac(k ** 3, 2)
  const valeurF = type === 'carre' ? frac(2, 3) : frac(2 * k ** 3, 3)
  const aire = valeurF.differenceFraction(valeurG).simplifie()
  const carreG = k === 1 ? 'x^2' : `\\dfrac{x^2}{${k * k}}`
  const resolutionTex =
    type === 'carre'
      ? `$f(x)=g(x)\\iff \\sqrt{x}=x^2$. Les deux membres étant positifs, cette équation équivaut à $x=x^4\\iff x\\left(1-x^3\\right)=0\\iff x=0$ ou $x^3=1$, c'est-à-dire $x=0$ ou $x=1$.<br>Les solutions sont $x=0$ et $x=1$.`
      : `$f(x)=g(x)\\iff \\sqrt{x}=${gTex}$. Pour $x\\geqslant 0$, les deux membres sont positifs et cette équation équivaut à $x=${carreG}\\iff ${k === 1 ? 'x-x^2' : `${k * k}x-x^2`}=0\\iff x\\left(${k * k}-x\\right)=0\\iff x=0$ ou $x=${b}$.<br>Les solutions sont $x=0$ et $x=${b}$.`
  const quart = frac(k * k, 4).texFractionSimplifiee
  const xMin = -1
  const xMax = b + 1
  return {
    fTex: '\\sqrt{x}',
    gTex,
    f: (x) => Math.sqrt(x),
    g,
    racines: [frac(0), frac(b)].map(borneRationnelle),
    resolutionTex,
    morceaux: [
      {
        a: borneRationnelle(frac(0)),
        b: borneRationnelle(frac(b)),
        haut: 'f',
        justification:
          type === 'carre'
            ? `$f\\left(\\dfrac{1}{4}\\right)=\\dfrac{1}{2}>\\dfrac{1}{16}=g\\left(\\dfrac{1}{4}\\right)$`
            : `$f\\left(${quart}\\right)=${frac(k, 2).texFractionSimplifiee}>${frac(k, 4).texFractionSimplifiee}=g\\left(${quart}\\right)$`,
        integrandeTex: `\\sqrt{x}-${gTex}`,
        primitiveTex: `\\dfrac{2}{3}x\\sqrt{x}-${primitiveG}`,
        evaluationTex: `\\left(${valeurF.texFractionSimplifiee}-${valeurG.texFractionSimplifiee}\\right)`,
        valeurTex: aire.texFractionSimplifiee,
        valeur: aire.valeurDecimale,
      },
    ],
    aireTex: aire.texFractionSimplifiee,
    fenetre: {
      xMin,
      xMax,
      yMin: -1,
      yMax: Math.ceil(Math.max(Math.sqrt(xMax), g(xMax))),
    },
    debutTrace: 0,
  }
}

/** Exponentielle ou logarithme contre la corde : intersections admises. */
function tirerExpLn(): Tirage {
  const k = randint(1, 3)
  const kTex = rienSi1(k)
  /** k·expr/2 : expr/2, (expr) ou 3(expr)/2 ; sans parenthèses lorsque le terme est seul. */
  const surDeux = (expr: string, seul = false) =>
    k === 2
      ? seul
        ? expr
        : `\\left(${expr}\\right)`
      : `\\dfrac{${k === 1 ? expr : `${k}\\left(${expr}\\right)`}}{2}`
  const aire = surDeux('3-\\mathrm{e}', true)
  const valeur = (k * (3 - Math.E)) / 2
  if (choice([true, false])) {
    return {
      fTex: `${kTex}\\mathrm{e}^{x}`,
      gTex: `${kTex}\\left(\\mathrm{e}-1\\right)x+${k}`,
      f: (x) => k * Math.exp(x),
      g: (x) => k * (Math.E - 1) * x + k,
      racines: [frac(0), frac(1)].map(borneRationnelle),
      resolutionTex: '',
      pointsToujoursDonnes: true,
      morceaux: [
        {
          a: borneRationnelle(frac(0)),
          b: borneRationnelle(frac(1)),
          haut: 'g',
          justification: `$g\\left(\\dfrac{1}{2}\\right)=${surDeux('\\mathrm{e}+1', true)}>${kTex}\\sqrt{\\mathrm{e}}=f\\left(\\dfrac{1}{2}\\right)$ (la corde est au-dessus de la courbe d'une fonction convexe)`,
          integrandeTex: `${kTex}\\left(\\mathrm{e}-1\\right)x+${k}-${kTex}\\mathrm{e}^{x}`,
          primitiveTex: `${surDeux('\\mathrm{e}-1')}x^2+${kTex}x-${kTex}\\mathrm{e}^{x}`,
          evaluationTex: `\\left(${surDeux('\\mathrm{e}-1')}+${k}-${kTex}\\mathrm{e}\\right)-\\left(-${k}\\right)=${surDeux('\\mathrm{e}-1')}+${2 * k}-${kTex}\\mathrm{e}`,
          valeurTex: aire,
          valeur,
        },
      ],
      aireTex: aire,
      fenetre: {
        xMin: -1.5,
        xMax: 2,
        yMin: -1,
        yMax: Math.ceil(k * Math.E) + 1,
      },
    }
  }
  const e: Borne = { valeur: Math.E, tex: '\\mathrm{e}' }
  return {
    fTex: `${kTex}\\ln(x)`,
    gTex: `\\dfrac{${kTex}\\left(x-1\\right)}{\\mathrm{e}-1}`,
    f: (x) => k * Math.log(x),
    g: (x) => (k * (x - 1)) / (Math.E - 1),
    racines: [borneRationnelle(frac(1)), e],
    resolutionTex: '',
    pointsToujoursDonnes: true,
    morceaux: [
      {
        a: borneRationnelle(frac(1)),
        b: e,
        haut: 'f',
        justification: `$f(2)=${kTex}\\ln(2)>\\dfrac{${k}}{\\mathrm{e}-1}=g(2)$ (la courbe d'une fonction concave est au-dessus de sa corde)`,
        integrandeTex: `${kTex}\\ln(x)-\\dfrac{${kTex}\\left(x-1\\right)}{\\mathrm{e}-1}`,
        primitiveTex: `${k === 1 ? 'x\\ln(x)-x' : `${k}\\left(x\\ln(x)-x\\right)`}-\\dfrac{${kTex}\\left(x-1\\right)^2}{2\\left(\\mathrm{e}-1\\right)}`,
        evaluationTex: `\\left(0-${surDeux('\\mathrm{e}-1')}\\right)-\\left(-${k}\\right)=${k}-${surDeux('\\mathrm{e}-1')}`,
        valeurTex: aire,
        valeur,
      },
    ],
    aireTex: aire,
    fenetre: { xMin: -0.5, xMax: Math.E + 1.5, yMin: -k - 1, yMax: k + 1 },
    debutTrace: 0.01,
  }
}

const TIRAGES: Record<string, () => Tirage> = {
  paraboles: tirerParaboles,
  cubique: tirerCubique,
  trigo: tirerTrigo,
  racine: tirerRacine,
  expLn: tirerExpLn,
}

/** Courbes de f et g avec les régions comprises entre elles ombrées. */
function figure(t: Tirage): string {
  const { xMin, xMax, yMin, yMax } = t.fenetre
  // Figure d'au plus 12 cm sur 7 cm, avec au plus une dizaine de graduations par axe.
  const xUnite = Math.min(2, 12 / (xMax - xMin))
  const yUnite = Math.min(1.5, 7 / (yMax - yMin))
  const pasY = Math.ceil((yMax - yMin) / 10)
  const r = repere({
    xMin,
    xMax,
    yMin,
    yMax,
    xUnite,
    yUnite,
    grille: false,
    xThickListe: t.xLabels?.map((label) => label.valeur),
    xLabelListe: t.xLabels,
    xLabelEcart: t.xLabels ? 0.6 : 0.5,
    xThickMax: xMax - 0.3,
    xLabelMax: xMax - 0.3,
    yThickDistance: pasY,
    yLabelDistance: pasY,
    yThickMax: yMax - 0.3,
    yLabelMax: yMax - 0.3,
  })
  const debut = t.debutTrace ?? xMin
  const pas = (xMax - debut) / 300
  const cf = courbe(t.f, { repere: r, color: 'blue', step: pas, xMin: debut })
  const cg = courbe(t.g, { repere: r, color: 'red', step: pas, xMin: debut })
  const regions = t.morceaux.map((morceau) => {
    const points = []
    const n = 60
    const largeur = morceau.b.valeur - morceau.a.valeur
    for (let j = 0; j <= n; j++) {
      const x = morceau.a.valeur + (largeur * j) / n
      points.push(pointAbstrait(x * xUnite, t.f(x) * yUnite))
    }
    for (let j = n; j >= 0; j--) {
      const x = morceau.a.valeur + (largeur * j) / n
      points.push(pointAbstrait(x * xUnite, t.g(x) * yUnite))
    }
    const region = polygone(points, 'none')
    region.couleurDeRemplissage = colorToLatexOrHTML('gray')
    region.opaciteDeRemplissage = 0.4
    region.epaisseur = 0
    return region
  })
  // Chaque étiquette est posée sur sa courbe, le plus à droite possible dans la fenêtre, à l'écart de l'autre.
  // L'étiquette doit rester dans la fenêtre et à l'écart des axes.
  const dansFenetre = (x: number, y: number) =>
    y > yMin + 0.6 / yUnite &&
    y < yMax - 0.6 / yUnite &&
    Math.abs(x * xUnite) > 0.6 &&
    Math.abs(y * yUnite) > 0.6
  const positionLabel = (
    h: (x: number) => number,
    eviter?: [number, number],
  ) => {
    for (let x = xMax - 0.5 / xUnite; x > debut; x -= 0.1 / xUnite) {
      const y = h(x)
      const loin =
        eviter === undefined ||
        Math.hypot((x - eviter[0]) * xUnite, (y - eviter[1]) * yUnite) > 1.2
      if (dansFenetre(x, y) && loin) return [x, y] as [number, number]
    }
    return [xMax - 0.5 / xUnite, yMax - 0.4 / yUnite] as [number, number]
  }
  const positionF = positionLabel(t.f)
  const positionG = positionLabel(t.g, positionF)
  // L'étiquette est décalée en haut à droite du point de la courbe pour ne pas la chevaucher.
  const etiquette = (nom: string, [x, y]: [number, number], color: string) =>
    latex2d(`\\mathcal{C}_${nom}`, x * xUnite + 0.35, y * yUnite + 0.3, {
      color,
    })
  const labels = [
    etiquette('f', positionF, 'blue'),
    etiquette('g', positionG, 'red'),
  ]
  return mathalea2d(
    {
      xmin: xMin * xUnite - 0.5,
      xmax: xMax * xUnite + 0.5,
      ymin: yMin * yUnite - 0.7,
      ymax: yMax * yUnite + 0.5,
      pixelsParCm: 40,
      scale: 1,
      center: true,
      centerLatex: true,
    },
    r,
    ...regions,
    cf,
    cg,
    ...labels,
  )
}

/** @author Nathan Scheinmann */
export default class AireEntreDeuxCourbes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacingCorr = 3
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const familles = repartitionPonderee(
      shuffle(params.liste('familles')),
      this.nbQuestions,
      shuffle(params.declares('familles')),
    )
    const pointsDonnes = params.case('pointsDonnes')
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const famille = familles[i]
      const t = TIRAGES[famille]()
      if (!this.questionJamaisPosee(i, t.fTex, t.gTex)) continue
      const aire = t.morceaux.reduce((somme, m) => somme + m.valeur, 0)
      const arrondi = texNombre(Math.round(aire * 10) / 10, 1)
      const donner = pointsDonnes || t.pointsToujoursDonnes
      const abscisses = t.racines.map((racine) => `$${racine.tex}$`)
      const listeAbscisses = `${abscisses.slice(0, -1).join(', ')} et ${abscisses.at(-1)}`
      let texte =
        `Soient $f(x)=${t.fTex}$ et $g(x)=${t.gTex}$ deux fonctions.` +
        (donner
          ? `<br>On admet que les courbes de $f$ et de $g$ se coupent aux points d'abscisses ${listeAbscisses}.`
          : '') +
        '<br>' +
        (donner
          ? ''
          : `${numAlpha(0)}Résoudre l'équation $f(x)=g(x)$.<br>${numAlpha(1)}`) +
        `Calculer l'aire $\\mathcal{A}$ du domaine ombré représenté ci-dessous. Donner la valeur arrondie au dixième d'unité d'aire.<br>${figure(t)}`
      if (this.interactif)
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
            texteAvant: '$\\mathcal{A}\\approx$',
            texteApres: "unités d'aire",
          })
      handleAnswers(this, i, { reponse: { value: arrondi } })
      const positions = t.morceaux
        .map((m) => {
          const [haut, bas] = m.haut === 'f' ? ['f', 'g'] : ['g', 'f']
          return `sur $\\left[${m.a.tex};${m.b.tex}\\right]$, la courbe de $${haut}$ est au-dessus de celle de $${bas}$ car ${m.justification}`
        })
        .join(' et ')
      const bornes = (m: Morceau) =>
        `_{${enIndice(m.a.tex)}}^{${enIndice(m.b.tex)}}`
      const integrales = t.morceaux
        .map(
          (m) =>
            `\\int${bornes(m)}\\left(${m.haut}(x)-${m.haut === 'f' ? 'g' : 'f'}(x)\\right)\\,\\mathrm{d}x`,
        )
        .join('+')
      const calculs = t.morceaux
        .map(
          (m) =>
            `$\\displaystyle\\int${bornes(m)}\\left(${m.integrandeTex}\\right)\\,\\mathrm{d}x=\\left[${m.primitiveTex}\\right]${bornes(m)}=${m.evaluationTex}=${m.valeurTex}$`,
        )
        .join('<br>')
      const somme =
        t.morceaux.length > 1
          ? `${t.morceaux.map((m) => m.valeurTex).join('+')}=`
          : ''
      this.listeCorrections[i] =
        (donner ? '' : `${numAlpha(0)}${t.resolutionTex}<br>${numAlpha(1)}`) +
        `Les courbes se coupent aux points d'abscisses ${listeAbscisses}, et ${positions}.<br>` +
        `Ainsi, $\\mathcal{A}=\\displaystyle${integrales}$.<br>` +
        `${calculs}.<br>` +
        `On a $\\mathcal{A}=${somme}${t.aireTex}\\approx${miseEnEvidence(arrondi)}$ unités d'aire.`
      this.listeQuestions[i] = texte
      i++
    }
    listeQuestionsToContenu(this)
  }
}
