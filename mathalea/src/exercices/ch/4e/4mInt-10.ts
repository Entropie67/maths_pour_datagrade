import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { courbe } from '../../../lib/2d/Courbe'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../../lib/interactif/createQuestion'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Encadrer une aire par des sommes inférieures et supérieures'
export const dateDePublication = '26/10/2026'
export const uuid = 'adf78'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-10'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Familles de fonctions',
      items: [
        { nom: 'affine', label: 'Affine' },
        { nom: 'quadratique', label: 'Polynôme du deuxième degré' },
        { nom: 'inverse', label: 'Fonction inverse' },
      ],
    },
    {
      type: 'case',
      nom: 'rectangles',
      label: 'Représenter les rectangles des deux sommes',
      defaut: false,
    },
  ],
}

const frac = (num: number, den = 1) => new FractionEtendue(num, den).simplifie()

type Tirage = {
  fTex: string
  f: (x: number) => number
  /** Valeur exacte de f en un rationnel. */
  image: (x: FractionEtendue) => FractionEtendue
  a: number
  /** Pas de la subdivision : 1 ou 1/2. */
  h: FractionEtendue
  n: number
  croissante: boolean
  /** Phrase, sans point final, justifiant le sens de variation de f sur [a ; b], avec ses propres $. */
  variation: string
  /** Abscisse à partir de laquelle tracer la courbe (fonction inverse). */
  debutTrace?: number
}

/**
 * Pas 1 ou 1/2 et nombre de sous-intervalles, pour un intervalle de longueur
 * entière 2 à 4 : les bornes restent entières.
 */
function tirerSubdivision() {
  for (;;) {
    const h = choice([frac(1), frac(1, 2)])
    const n = randint(3, 6)
    const longueur = n * h.valeurDecimale
    if (Number.isInteger(longueur) && longueur >= 2 && longueur <= 4)
      return { h, n, longueur }
  }
}

/** Les rectangles d'un intervalle à cheval sur 0 masqueraient les graduations de l'axe des ordonnées. */
const aCheval = (a: number, b: number) => a < 0 && b > 0

/** f(x) = mx + p avec m = ±1/2, ±1, ±2 ou ±3, strictement positive sur [a ; b]. */
function tirerAffine(): Tirage {
  for (;;) {
    const { h, n, longueur } = tirerSubdivision()
    const m = choice([frac(1, 2), frac(1), frac(2), frac(3)]).multiplieEntier(
      choice([-1, 1]),
    )
    const p = randint(-4, 6)
    const a = randint(-2, 2)
    const b = a + longueur
    if (aCheval(a, b)) continue
    const image = (x: FractionEtendue) =>
      m.produitFraction(x).sommeFraction(frac(p)).simplifie()
    const [fa, fb] = [image(frac(a)), image(frac(b))]
    if (Math.min(fa.valeurDecimale, fb.valeurDecimale) < 0.5) continue
    if (Math.max(fa.valeurDecimale, fb.valeurDecimale) > 12) continue
    const p1 = new Polynome({ coeffs: [frac(p), m], useFraction: true })
    const croissante = m.valeurDecimale > 0
    return {
      fTex: p1.toLatex(),
      f: (x) => m.valeurDecimale * x + p,
      image,
      a,
      h,
      n,
      croissante,
      variation: `$f$ est une fonction affine de pente $${m.texFractionSimplifiee}${croissante ? '>' : '<'}0$, donc elle est ${croissante ? 'croissante' : 'décroissante'} sur $\\mathbb{R}$`,
    }
  }
}

/** f(x) = k(x - u)² + c, développée, avec [a ; b] d'un seul côté du sommet. */
function tirerQuadratique(): Tirage {
  for (;;) {
    const { h, n, longueur } = tirerSubdivision()
    const k = choice([frac(1, 2), frac(1), frac(-1, 2), frac(-1)])
    const u = randint(-2, 2)
    const c = k.valeurDecimale > 0 ? randint(0, 3) : randint(6, 10)
    const aDroite = choice([true, false])
    const a = aDroite ? u + randint(0, 1) : u - longueur - randint(0, 1)
    const b = a + longueur
    if (aCheval(a, b)) continue
    const image = (x: FractionEtendue) =>
      k
        .produitFraction(x.differenceFraction(frac(u)).puissanceFraction(2))
        .sommeFraction(frac(c))
        .simplifie()
    const [fa, fb] = [image(frac(a)), image(frac(b))]
    if (Math.min(fa.valeurDecimale, fb.valeurDecimale) < 0.5) continue
    if (Math.max(fa.valeurDecimale, fb.valeurDecimale) > 12) continue
    // Développement de k(x - u)² + c : coefficients k·u² + c, -2k·u et k.
    const p = new Polynome({
      coeffs: [
        k
          .multiplieEntier(u * u)
          .sommeFraction(frac(c))
          .simplifie(),
        k.multiplieEntier(-2 * u).simplifie(),
        k,
      ],
      useFraction: true,
    })
    const croissante = k.valeurDecimale > 0 === aDroite
    const cote = aDroite ? 'à droite' : 'à gauche'
    const convexe = k.valeurDecimale > 0
    return {
      fTex: p.toLatex(),
      f: (x) => k.valeurDecimale * (x - u) ** 2 + c,
      image,
      a,
      h,
      n,
      croissante,
      variation: `Le coefficient de $x^2$ est ${convexe ? 'positif' : 'négatif'}, donc $f$ est ${convexe ? 'convexe' : 'concave'} et atteint son ${convexe ? 'minimum' : 'maximum'} en $x=${u}$. L'intervalle $\\left[${a};${b}\\right]$ est situé ${cote} de $${u}$, donc $f$ y est ${croissante ? 'croissante' : 'décroissante'}`,
    }
  }
}

/** f(x) = k/x sur un intervalle de nombres strictement positifs. */
function tirerInverse(): Tirage {
  const { h, n } = tirerSubdivision()
  const k = randint(1, 6)
  const a = randint(1, 2)
  return {
    fTex: `\\dfrac{${k}}{x}`,
    f: (x) => k / x,
    image: (x) => frac(k).diviseFraction(x).simplifie(),
    a,
    h,
    n,
    croissante: false,
    debutTrace: 0.2,
    variation: `On a $f(x)=${k}\\times\\dfrac{1}{x}$ et la fonction inverse est décroissante sur $\\left]0;+\\infty\\right[$, donc $f$ est décroissante sur $I$`,
  }
}

const TIRAGES: Record<string, () => Tirage> = {
  affine: tirerAffine,
  quadratique: tirerQuadratique,
  inverse: tirerInverse,
}

/** Courbe de f, subdivision et, sur demande, rectangles des deux sommes. */
function figure(t: Tirage, points: FractionEtendue[], rectangles: boolean) {
  const xs = points.map((x) => x.valeurDecimale)
  const b = xs[xs.length - 1]
  const yMaxF = Math.max(...xs.map(t.f))
  const xMin = Math.min(0, t.a) - 1
  // La fenêtre contient toujours l'origine, pour que l'axe des ordonnées et ses graduations restent visibles.
  const xMax = Math.max(0, b) + 1
  const yMin = -1
  const yMax = Math.ceil(yMaxF) + 1
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
    // Convention : x au-dessus de l'axe et y à sa droite, près des flèches, à l'écart des
    // nombres des graduations (dessous et à gauche).
    xLegende: '$x$',
    xLegendePosition: [xMax * xUnite - 0.3, 0.5],
    yLegende: '$y$',
    yLegendePosition: [0.7, yMax * yUnite - 0.25],
    xThickMax: xMax - 0.3,
    xLabelMax: xMax - 0.3,
    yThickDistance: pasY,
    yLabelDistance: pasY,
    yThickMax: yMax - 0.3,
    yLabelMax: yMax - 0.3,
  })
  const P = (x: number, y: number) => pointAbstrait(x * xUnite, y * yUnite)
  const objets = []
  if (rectangles) {
    for (let i = 0; i < xs.length - 1; i++) {
      const [g, d] = [xs[i], xs[i + 1]]
      const [bas, haut] = [Math.min(t.f(g), t.f(d)), Math.max(t.f(g), t.f(d))]
      // Rectangle de la somme supérieure : contour en pointillés.
      const sup = polygone([P(g, 0), P(d, 0), P(d, haut), P(g, haut)], 'red')
      sup.pointilles = 2
      // Rectangle de la somme inférieure : ombré.
      const inf = polygone([P(g, 0), P(d, 0), P(d, bas), P(g, bas)], 'gray')
      inf.couleurDeRemplissage = colorToLatexOrHTML('gray')
      inf.opaciteDeRemplissage = 0.4
      objets.push(inf, sup)
    }
  } else {
    // Sans les rectangles, des segments verticaux matérialisent la subdivision.
    for (const x of xs) {
      const s = segment(P(x, 0), P(x, t.f(x)), 'gray')
      s.pointilles = 5
      objets.push(s)
    }
  }
  const debut = t.debutTrace ?? xMin
  const cf = courbe(t.f, {
    repere: r,
    color: 'blue',
    step: (xMax - debut) / 300,
    xMin: debut,
  })
  // Étiquette au-dessus de la courbe, au milieu du premier sous-intervalle : toujours
  // dans la fenêtre (une unité de marge en haut) et loin des graduations de l'axe des ordonnées.
  const xEtiquette = (xs[0] + xs[1]) / 2
  const etiquette = latex2d(
    '\\mathcal{C}_f',
    xEtiquette * xUnite,
    t.f(xEtiquette) * yUnite + 0.45,
    { color: 'blue' },
  )
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
    ...objets,
    cf,
    etiquette,
  )
}

/** h·(somme des images), écrit puis calculé. */
function calculSomme(
  nom: string,
  hTex: string,
  h: FractionEtendue,
  abscisses: FractionEtendue[],
  image: (x: FractionEtendue) => FractionEtendue,
) {
  const images = abscisses.map(image)
  const somme = images.reduce<FractionEtendue>(
    (s, y) => s.sommeFraction(y),
    frac(0),
  )
  const valeur = h.produitFraction(somme).simplifie()
  const termes = abscisses
    .map((x) => `f\\left(${x.texFractionSimplifiee}\\right)`)
    .join('+')
  const valeurs = images
    .map((y) => y.texFractionSimplifiee)
    .join('+')
    .replaceAll('+-', '-')
  // Avec un pas de 1, la somme s'écrit sans facteur ni parenthèses.
  const facteur = (expr: string) =>
    h.valeurDecimale === 1 ? expr : `${hTex}\\times\\left(${expr}\\right)`
  return {
    valeur,
    tex:
      `$\\begin{aligned}${nom}&=${facteur(termes)}\\\\` +
      `&=${facteur(valeurs)}\\\\` +
      (h.valeurDecimale === 1
        ? ''
        : `&=${hTex}\\times${somme.simplifie().texFractionSimplifiee}\\\\`) +
      `&=${miseEnEvidence(valeur.texFractionSimplifiee)}\\end{aligned}$`,
  }
}

/** @author Nathan Scheinmann */
export default class SommesInferieuresSuperieures extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacingCorr = 1.5
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
    const rectangles = params.case('rectangles')
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const t = TIRAGES[familles[i]]()
      const { a, h, n } = t
      const points = Array.from({ length: n + 1 }, (_, j) =>
        frac(a).sommeFraction(h.multiplieEntier(j)).simplifie(),
      )
      const b = points[n].texFractionSimplifiee
      if (!this.questionJamaisPosee(i, t.fTex, a, b, n)) continue
      const hTex = h.texFractionSimplifiee
      const gauches = points.slice(0, -1)
      const droits = points.slice(1)
      const [bordsInf, bordsSup] = t.croissante
        ? [gauches, droits]
        : [droits, gauches]
      const inf = calculSomme(`s_{${n}}`, hTex, h, bordsInf, t.image)
      const sup = calculSomme(`S_{${n}}`, hTex, h, bordsSup, t.image)
      const listePoints = points.map(
        (x, j) => `$x_{${j}}=${x.texFractionSimplifiee}$`,
      )
      const aTex = a < 0 ? `\\left(${a}\\right)` : String(a)
      // Une borne fractionnaire rendrait la fraction du pas illisible (fraction de fraction).
      const pasTex = points[n].estEntiere
        ? `\\dfrac{${b}-${aTex}}{${n}}`
        : `\\left(${b}-${aTex}\\right)\\div ${n}`
      const [bordMin, bordMax] = t.croissante
        ? ['gauche', 'droit']
        : ['droit', 'gauche']
      const champ = {
        keyboard: KeyboardType.clavierDeBaseAvecFraction,
      }
      createQuestion(this, i, {
        question:
          `Soit $f\\colon I\\to\\mathbb{R}$ avec $I=\\left[${a};${b}\\right]$ la fonction définie par $f(x)=${t.fTex}$, représentée ci-dessous. ` +
          `On note $\\mathcal{A}$ l'aire du domaine compris entre la courbe de $f$, l'axe des abscisses et les droites d'équations $x=${a}$ et $x=${b}$, ` +
          `et on considère la subdivision régulière de $I$ en $${n}$ sous-intervalles.<br>${figure(t, points, rectangles)}`,
        correction:
          `Le pas de la subdivision est $h=\\dfrac{b-a}{n}=${pasTex}=${hTex}$ et ses points sont ${listePoints.slice(0, -1).join(', ')} et ${listePoints[n]}.<br>` +
          `${t.variation}. Sur chaque sous-intervalle, le minimum de $f$ est donc atteint au bord ${bordMin} et le maximum au bord ${bordMax}.`,
        // a) et b) se calculent sur papier ; seul l'encadrement, qui contient
        // les deux sommes, est interactif.
        subQuestions: [
          {
            question: `Calculer la valeur exacte de la somme inférieure $s_{${n}}$.`,
            correction: inf.tex,
          },
          {
            question: `Calculer la valeur exacte de la somme supérieure $S_{${n}}$.`,
            correction: sup.tex,
          },
          {
            question: `En déduire un encadrement de $\\mathcal{A}$.<br>%{0} $\\leqslant\\mathcal{A}\\leqslant$ %{1}`,
            answer: [
              { value: inf.valeur.texFractionSimplifiee },
              { value: sup.valeur.texFractionSimplifiee },
            ],
            field: [champ, champ],
            correction: `On a $s_{${n}}\\leqslant\\mathcal{A}\\leqslant S_{${n}}$, c'est-à-dire $${miseEnEvidence(inf.valeur.texFractionSimplifiee)}\\leqslant\\mathcal{A}\\leqslant ${miseEnEvidence(sup.valeur.texFractionSimplifiee)}$.`,
          },
        ],
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
