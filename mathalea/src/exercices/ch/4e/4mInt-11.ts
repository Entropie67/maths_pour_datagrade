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
import { createQuestion } from '../../../lib/interactif/createQuestion'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
    ecritureParentheseSiNegatif,
    rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Calculer une intégrale et l'aire entre une courbe et l'axe des abscisses"
export const dateDePublication = '26/10/2026'
export const uuid = '58877'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-11'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Familles de fonctions',
      items: [
        { nom: 'parabole', label: 'Polynôme du deuxième degré' },
        { nom: 'cubique', label: 'Polynôme du troisième degré' },
        { nom: 'trigo', label: 'Sinus et cosinus' },
      ],
    },
    {
      type: 'case',
      nom: 'zerosDonnes',
      label: "Donner les zéros de f sur l'intervalle",
      defaut: false,
    },
  ],
}

const frac = (num: number, den = 1) => new FractionEtendue(num, den).simplifie()

/** Les bornes d'une intégrale sont en indice : \dfrac y est illisible. */
const enIndice = (tex: string) => tex.replaceAll('\\dfrac', '\\frac')

/** Écrit q·symbole pour un rationnel q : 0, \pi, -2\pi, \dfrac{3\pi}{2}… */
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

type Borne = { valeur: number; tex: string }

/** Un intervalle entre deux bornes ou zéros consécutifs, sur lequel f garde un signe. */
type Morceau = {
  g: Borne
  d: Borne
  positif: boolean
  /** Justification du signe, phrase avec ses propres $. */
  justification: string
  /** F(d) et F(g) écrits exactement. */
  fdTex: string
  fgTex: string
  /** Intégrale de f sur le morceau, signée. */
  valeur: FractionEtendue
}

type Tirage = {
  fTex: string
  f: (x: number) => number
  primitiveTex: string
  a: Borne
  b: Borne
  /** Zéros de f strictement compris entre a et b. */
  zeros: Borne[]
  /** Zéros de f sur [a ; b], bornes comprises. */
  zerosFermes: Borne[]
  /** Résolution de f(x) = 0 sur [a ; b], sans phrase de conclusion. */
  resolutionTex: string
  morceaux: Morceau[]
  fenetre: { xMin: number; xMax: number; yMin: number; yMax: number }
  xLabels?: { valeur: number; texte: string }[]
}

/** Polynôme à coefficients entiers, sans zéros inutiles en tête (toLatex les écrirait « +4x »). */
function polynome(coeffs: number[]): Polynome {
  const copie = [...coeffs]
  while (copie.length > 1 && copie[copie.length - 1] === 0) copie.pop()
  return new Polynome({ coeffs: copie })
}

/** Résolution d'un trinôme ax² + bx + c à racines entières r1 < r2, par le discriminant. */
function resolutionTrinome(trinome: Polynome, r1: number, r2: number) {
  const [c, b, a] = trinome.monomes.map(Number)
  const delta = b * b - 4 * a * c
  const racine = Math.sqrt(delta)
  const [x1, x2] = [(-b - racine) / (2 * a), (-b + racine) / (2 * a)]
  return (
    `Le discriminant de $${trinome.toLatex()}$ est $\\Delta=${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${delta}$, d'où $\\sqrt{\\Delta}=${racine}$ et ` +
    `$x_1=\\dfrac{${-b}-${racine}}{${2 * a}}=${x1}$, $x_2=\\dfrac{${-b}+${racine}}{${2 * a}}=${x2}$, c'est-à-dire $x=${r1}$ ou $x=${r2}$`
  )
}

/**
 * Morceaux d'un polynôme entre a, ses zéros intérieurs et b, avec la primitive
 * F calculée en fractions pour que les valeurs restent exactes.
 */
function morceauxPolynome(p: Polynome, bornes: number[]) {
  const integrande = new Polynome({
    coeffs: p.monomes.map((c) => frac(Number(c))),
    useFraction: true,
  })
  const primitive = integrande.primitive0()
  const F = (x: number) => primitive.evaluateExact(frac(x))
  const morceaux: Morceau[] = []
  for (let j = 0; j < bornes.length - 1; j++) {
    const [g, d] = [bornes[j], bornes[j + 1]]
    const milieu = frac(g + d, 2)
    const image = p.evaluateExact(milieu)
    const positif = image.valeurDecimale > 0
    const m = milieu.texFractionSimplifiee
    morceaux.push({
      g: { valeur: g, tex: String(g) },
      d: { valeur: d, tex: String(d) },
      positif,
      justification: `$f$ ne s'annule pas entre $${g}$ et $${d}$ et $f\\left(${m}\\right)=${image.texFractionSimplifiee}${positif ? '>' : '<'}0$`,
      fdTex: F(d).texFractionSimplifiee,
      fgTex: F(g).texFractionSimplifiee,
      valeur: F(d).differenceFraction(F(g)).simplifie(),
    })
  }
  return { primitiveTex: primitive.toLatex(), morceaux }
}

/** Fenêtre contenant l'origine et la courbe sur [a ; b], arrondie aux entiers. */
function fenetre(f: (x: number) => number, a: number, b: number) {
  let yMin = 0
  let yMax = 0
  for (let x = a; x <= b + 1e-9; x += (b - a) / 200) {
    yMin = Math.min(yMin, f(x))
    yMax = Math.max(yMax, f(x))
  }
  return {
    xMin: Math.min(0, Math.floor(a)) - 1,
    xMax: Math.max(0, Math.ceil(b)) + 1,
    yMin: Math.floor(yMin) - 1,
    yMax: Math.ceil(yMax) + 1,
  }
}

/** Chaque partie du domaine doit se voir et la figure rester lisible. */
const lisible = (t: { morceaux: Morceau[]; fenetre: Tirage['fenetre'] }) =>
  t.morceaux.every((m) => Math.abs(m.valeur.valeurDecimale) >= 0.5) &&
  t.fenetre.yMax - t.fenetre.yMin <= 16

/** f(x) = k(x - r1)(x - r2), développé, avec un seul de ses zéros entre a et b. */
function tirerParabole(): Tirage {
  for (;;) {
    const k = choice([-2, -1, 1, 2])
    const r1 = randint(-3, 1)
    const r2 = r1 + randint(2, 4)
    // Le zéro intérieur est r1 ou r2 ; l'autre est hors de ]a ; b[.
    const [a, b] = choice([true, false])
      ? [r1 - randint(1, 2), randint(r1 + 1, r2)]
      : [randint(r1, r2 - 1), r2 + randint(1, 2)]
    if (b - a > 5) continue
    const p = polynome([k * r1 * r2, -k * (r1 + r2), k])
    const zeros = [r1, r2].filter((r) => r > a && r < b)
    const { primitiveTex, morceaux } = morceauxPolynome(p, [a, ...zeros, b])
    const t = {
      fTex: p.toLatex(),
      f: p.fonction,
      primitiveTex,
      a: { valeur: a, tex: String(a) },
      b: { valeur: b, tex: String(b) },
      zeros: zeros.map((r) => ({ valeur: r, tex: String(r) })),
      zerosFermes: [r1, r2]
        .filter((r) => r >= a && r <= b)
        .map((r) => ({ valeur: r, tex: String(r) })),
      resolutionTex: `${resolutionTrinome(p, r1, r2)}.`,
      morceaux,
      fenetre: fenetre(p.fonction, a, b),
    }
    if (lisible(t)) return t
  }
}

/** f(x) = kx(x - p)(x - q) : on factorise par x, puis on résout le trinôme. */
function tirerCubique(): Tirage {
  for (;;) {
    const k = choice([-1, 1])
    const [p, q] = shuffle([-3, -2, -1, 1, 2, 3])
      .slice(0, 2)
      .sort((u, v) => u - v)
    const racines = [p, 0, q].sort((u, v) => u - v)
    // Intervalle allant d'un zéro extrême à l'autre, prolongé d'une unité d'un côté au plus.
    const prolongement = choice(['aucun', 'gauche', 'droite'])
    const a = racines[0] - (prolongement === 'gauche' ? 1 : 0)
    const b = racines[2] + (prolongement === 'droite' ? 1 : 0)
    const poly = polynome([0, k * p * q, -k * (p + q), k])
    const trinome = polynome([k * p * q, -k * (p + q), k])
    const zeros = racines.filter((r) => r > a && r < b)
    const { primitiveTex, morceaux } = morceauxPolynome(poly, [a, ...zeros, b])
    const t = {
      fTex: poly.toLatex(),
      f: poly.fonction,
      primitiveTex,
      a: { valeur: a, tex: String(a) },
      b: { valeur: b, tex: String(b) },
      zeros: zeros.map((r) => ({ valeur: r, tex: String(r) })),
      zerosFermes: racines
        .filter((r) => r >= a && r <= b)
        .map((r) => ({ valeur: r, tex: String(r) })),
      resolutionTex:
        `$f(x)=x\\left(${trinome.toLatex()}\\right)=0\\iff x=0$ ou $${trinome.toLatex()}=0$.<br>` +
        `${resolutionTrinome(trinome, p, q)}.<br>Les solutions sont $x=${racines[0]}$, $x=${racines[1]}$ et $x=${racines[2]}$.`,
      morceaux,
      fenetre: fenetre(poly.fonction, a, b),
    }
    if (lisible(t)) return t
  }
}

/** Écrit nπ/2 : 0, \dfrac{\pi}{2}, \pi, -\dfrac{3\pi}{2}… */
const demiPiTex = (n: number) => termeTex(frac(n, 2), '\\pi')

const bornePi = (n: number): Borne => ({
  valeur: (n * Math.PI) / 2,
  tex: demiPiTex(n),
})

/** Étiquettes des multiples non nuls de π/2 dans [xMin ; xMax]. */
function etiquettesPi(xMin: number, xMax: number) {
  const labels: { valeur: number; texte: string }[] = []
  for (let n = Math.ceil((2 * xMin) / Math.PI); n <= (2 * xMax) / Math.PI; n++)
    if (n !== 0)
      labels.push({ valeur: (n * Math.PI) / 2, texte: enIndice(demiPiTex(n)) })
  return labels
}

/** cos(nπ/2) et sin(nπ/2) sont des entiers. */
const cosDemiPi = (n: number) => [1, 0, -1, 0][((n % 4) + 4) % 4]
const sinDemiPi = (n: number) => [0, 1, 0, -1][((n % 4) + 4) % 4]

/**
 * k·sin(x) ou k·cos(x) entre deux multiples de π/2, en demi-unités de π :
 * les zéros (nπ pour le sinus, π/2 + nπ pour le cosinus) et les valeurs de la
 * primitive aux bornes sont entiers.
 */
function tirerTrigo(): Tirage {
  for (;;) {
    const k = randint(1, 3)
    const kTex = rienSi1(k)
    const sinus = choice([true, false])
    const p = randint(-2, 1)
    const q = p + randint(2, 4)
    // Zéros en demi-unités de π : pairs pour le sinus, impairs pour le cosinus.
    const zeros: number[] = []
    for (let n = p + 1; n < q; n++)
      if (Math.abs(n % 2) === (sinus ? 0 : 1)) zeros.push(n)
    if (zeros.length === 0) continue
    const fonctionTex = sinus ? '\\sin(x)' : '\\cos(x)'
    const F = (n: number) => frac(sinus ? -k * cosDemiPi(n) : k * sinDemiPi(n))
    const bornes = [p, ...zeros, q]
    const morceaux: Morceau[] = []
    for (let j = 0; j < bornes.length - 1; j++) {
      const [g, d] = [bornes[j], bornes[j + 1]]
      const milieu = ((g + d) / 4) * Math.PI
      const positif = (sinus ? Math.sin(milieu) : Math.cos(milieu)) > 0
      morceaux.push({
        g: bornePi(g),
        d: bornePi(d),
        positif,
        justification: `$${fonctionTex}${positif ? '\\geqslant' : '\\leqslant'}0$ pour tout $x\\in\\left[${demiPiTex(g)};${demiPiTex(d)}\\right]$`,
        fdTex: F(d).texFractionSimplifiee,
        fgTex: F(g).texFractionSimplifiee,
        valeur: F(d).differenceFraction(F(g)).simplifie(),
      })
    }
    const solutions = sinus ? 'x=n\\pi' : 'x=\\dfrac{\\pi}{2}+n\\pi'
    const [a, b] = [bornePi(p), bornePi(q)]
    const xMin = Math.min(0, a.valeur) - 0.5
    const xMax = Math.max(0, b.valeur) + 0.5
    return {
      fTex: `${kTex}${fonctionTex}`,
      f: sinus ? (x) => k * Math.sin(x) : (x) => k * Math.cos(x),
      primitiveTex: sinus ? `-${kTex}\\cos(x)` : `${kTex}\\sin(x)`,
      a,
      b,
      zeros: zeros.map(bornePi),
      zerosFermes: [p, ...zeros, q]
        .filter((n) => Math.abs(n % 2) === (sinus ? 0 : 1))
        .map(bornePi),
      resolutionTex: `$f(x)=0\\iff ${fonctionTex}=0\\iff ${solutions}$, avec $n\\in\\mathbb{Z}$.`,
      morceaux,
      fenetre: { xMin, xMax, yMin: -k - 0.5, yMax: k + 0.5 },
      xLabels: etiquettesPi(xMin, xMax),
    }
  }
}

const TIRAGES: Record<string, () => Tirage> = {
  parabole: tirerParabole,
  cubique: tirerCubique,
  trigo: tirerTrigo,
}

/** Courbe de f et domaine ombré entre la courbe et l'axe des abscisses sur [a ; b]. */
function figure(t: Tirage): string {
  const { xMin, xMax, yMin, yMax } = t.fenetre
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
    xThickListe: t.xLabels?.map((label) => label.valeur),
    xLabelListe: t.xLabels,
    xLabelEcart: t.xLabels ? 0.6 : 0.5,
    xThickMax: xMax - 0.3,
    xLabelMax: xMax - 0.3,
    yThickDistance: pasY,
    yLabelDistance: pasY,
    // Sans cela, la graduation la plus basse est omise.
    yThickMin: yMin + 0.3,
    yLabelMin: yMin + 0.3,
    yThickMax: yMax - 0.3,
    yLabelMax: yMax - 0.3,
  })
  const P = (x: number, y: number) => pointAbstrait(x * xUnite, y * yUnite)
  // Une région par morceau : la courbe de g à d, puis retour le long de l'axe.
  const regions = t.morceaux.map((m) => {
    const points = []
    const n = 60
    for (let j = 0; j <= n; j++) {
      const x = m.g.valeur + ((m.d.valeur - m.g.valeur) * j) / n
      points.push(P(x, t.f(x)))
    }
    points.push(P(m.d.valeur, 0), P(m.g.valeur, 0))
    const region = polygone(points, 'none')
    region.couleurDeRemplissage = colorToLatexOrHTML('gray')
    region.opaciteDeRemplissage = 0.4
    region.epaisseur = 0
    return region
  })
  const cf = courbe(t.f, {
    repere: r,
    color: 'blue',
    step: (xMax - xMin) / 300,
    xMin,
  })
  // Étiquette près de la courbe, au point le plus à droite possible, du côté
  // extérieur (en haut à gauche si la courbe monte, en haut à droite sinon), à
  // l'écart des axes, des graduations de l'axe des ordonnées et de la courbe.
  const courbeEnCm = (cx: number) => t.f(cx / xUnite) * yUnite
  const degage = (lx: number, ly: number) => {
    for (let dx = -0.4; dx <= 0.4; dx += 0.05)
      if (Math.abs(courbeEnCm(lx + dx) - ly) < 0.35) return false
    return (
      lx > xMin * xUnite + 0.4 &&
      lx < xMax * xUnite - 0.3 &&
      ly > yMin * yUnite + 0.4 &&
      ly < yMax * yUnite - 0.4 &&
      Math.abs(ly) > 0.5 &&
      (lx > 0.5 || lx < -1.2)
    )
  }
  let position: [number, number] = [xMax * xUnite - 0.5, yMax * yUnite - 0.4]
  for (let cx = xMax * xUnite - 0.5; cx > xMin * xUnite; cx -= 0.05) {
    const cy = courbeEnCm(cx)
    const monte = courbeEnCm(cx + 0.05) > cy
    const candidat: [number, number] = [cx + (monte ? -0.45 : 0.45), cy + 0.4]
    if (degage(...candidat)) {
      position = candidat
      break
    }
  }
  const etiquette = latex2d('\\mathcal{C}_f', position[0], position[1], {
    color: 'blue',
  })
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
    etiquette,
  )
}

/** Liste « x, y et z » de nombres déjà écrits en LaTeX. */
const listeTex = (valeurs: string[]) =>
  valeurs.length === 1
    ? `$${valeurs[0]}$`
    : `${valeurs
        .slice(0, -1)
        .map((v) => `$${v}$`)
        .join(', ')} et $${valeurs.at(-1)}$`

/** F(d) - F(g), avec parenthèses autour d'une valeur négative. */
const difference = (fd: string, fg: string) =>
  `${fd}-${fg.startsWith('-') ? `\\left(${fg}\\right)` : fg}`

/** @author Nathan Scheinmann */
export default class IntegraleEtAireAxe extends Exercice {
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
    const zerosDonnes = params.case('zerosDonnes')
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const t = TIRAGES[familles[i]]()
      const { a, b, morceaux } = t
      if (!this.questionJamaisPosee(i, t.fTex, a.tex, b.tex)) continue
      const intervalle = `\\left[${a.tex};${b.tex}\\right]`
      const bornes = `_{${enIndice(a.tex)}}^{${enIndice(b.tex)}}`
      const zerosTex = listeTex(t.zeros.map((z) => z.tex))
      const zerosFermesTex = listeTex(t.zerosFermes.map((z) => z.tex))
      const integrale = morceaux
        .reduce<FractionEtendue>((s, m) => s.sommeFraction(m.valeur), frac(0))
        .simplifie()
      const aire = morceaux
        .reduce<FractionEtendue>(
          (s, m) => s.sommeFraction(m.positif ? m.valeur : m.valeur.oppose()),
          frac(0),
        )
        .simplifie()
      const [fa, fb] = [morceaux[0].fgTex, morceaux.at(-1)!.fdTex]
      const champ = { keyboard: KeyboardType.clavierDeBaseAvecFraction }

      const signes = morceaux
        .map(
          (m) =>
            `sur $\\left[${m.g.tex};${m.d.tex}\\right]$, $f(x)${m.positif ? '\\geqslant' : '\\leqslant'}0$ car ${m.justification}`,
        )
        .join(' ;<br>')
      const integraleMorceau = (m: Morceau) =>
        `\\int_{${enIndice(m.g.tex)}}^{${enIndice(m.d.tex)}}f(x)\\,\\mathrm{d}x`
      const aireEnIntegrales = morceaux
        .map(
          (m, j) =>
            `${m.positif ? (j === 0 ? '' : '+') : '-'}${integraleMorceau(m)}`,
        )
        .join('')
      const calculsMorceaux = morceaux
        .map(
          (m) =>
            `$\\displaystyle${integraleMorceau(m)}=F\\left(${m.d.tex}\\right)-F\\left(${m.g.tex}\\right)=${difference(m.fdTex, m.fgTex)}=${m.valeur.texFractionSimplifiee}$`,
        )
        .join(' ;<br>')
      const sommeAire = morceaux
        .map((m, j) => {
          const v = m.valeur.texFractionSimplifiee
          if (m.positif) return j === 0 ? v : `+${v}`
          return `-${v.startsWith('-') ? `\\left(${v}\\right)` : v}`
        })
        .join('')

      const sousQuestions = []
      if (!zerosDonnes)
        sousQuestions.push({
          question: `Résoudre l'équation $f(x)=0$ sur $${intervalle}$.`,
          correction: `${t.resolutionTex}<br>Sur $${intervalle}$, $f$ s'annule donc en ${zerosFermesTex}.`,
        })
      sousQuestions.push(
        {
          question: `Calculer la valeur exacte de $I=\\displaystyle\\int${bornes}f(x)\\,\\mathrm{d}x$.<br>$I=$ %{0}`,
          answer: { value: integrale.texFractionSimplifiee },
          field: champ,
          correction:
            `Une primitive de $f$ est $F(x)=${t.primitiveTex}$, donc<br>` +
            `$I=\\left[F(x)\\right]${bornes}=F\\left(${b.tex}\\right)-F\\left(${a.tex}\\right)=${difference(fb, fa)}=${miseEnEvidence(integrale.texFractionSimplifiee)}$.`,
        },
        {
          question: `Calculer la valeur exacte de l'aire $\\mathcal{A}$ du domaine ombré.<br>$\\mathcal{A}=$ %{0}`,
          answer: { value: aire.texFractionSimplifiee },
          field: { ...champ, texteApres: "unités d'aire" },
          correction:
            "Dans l'intégrale, les parties du domaine situées sous l'axe des abscisses comptent négativement. Pour l'aire, on intègre donc $-f$ sur les intervalles où $f$ est négative." +
            `<br>Sur $${intervalle}$, $f$ change de signe en ${zerosTex}${sp()}:<br>${signes}.` +
            `<br>Donc $\\mathcal{A}=\\displaystyle${aireEnIntegrales}$, avec<br>${calculsMorceaux}.<br>` +
            `Ainsi, $\\mathcal{A}=${sommeAire}=${miseEnEvidence(aire.texFractionSimplifiee)}$ unités d'aire.`,
        },
      )

      createQuestion(this, i, {
        question:
          `Soit $f\\colon\\mathbb{R}\\to\\mathbb{R}$ la fonction définie par $f(x)=${t.fTex}$. ` +
          `Le domaine ombré représenté ci-dessous est compris entre la courbe de $f$, l'axe des abscisses et les droites d'équations $x=${a.tex}$ et $x=${b.tex}$.` +
          (zerosDonnes
            ? `<br>On admet que, sur $${intervalle}$, $f$ s'annule seulement en ${zerosFermesTex}.`
            : '') +
          `<br>${figure(t)}`,
        correction: '',
        subQuestions: sousQuestions,
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
