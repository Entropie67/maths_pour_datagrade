import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { isEqual, noDecimal, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../../lib/interactif/createQuestion'
import { troisPointsProportionnels } from '../../../lib/interactif/fonctionsBaremes'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { reduireAxPlusB, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { factorisation } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Décomposer en éléments simples pour calculer une intégrale'
export const dateDePublication = '26/10/2026'
export const dateDeModifImportante = '03/11/2026'
export const uuid = 'e0648'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mExpLog-3'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'formes',
      label: 'Formes de la fonction',
      items: [
        {
          nom: 'constant',
          label: 'Numérateur constant, dénominateur de degré 2',
        },
        { nom: 'affine', label: 'Numérateur affine, dénominateur de degré 2' },
        { nom: 'quotient', label: 'Degré 2 sur degré 1' },
        {
          nom: 'affineFractionnaire',
          label: 'Numérateur affine, coefficients fractionnaires',
        },
      ],
    },
    {
      type: 'case',
      nom: 'unitaires',
      label: 'Facteurs du dénominateur de la forme x - p',
      defaut: false,
    },
  ],
}

const frac = (num: number, den = 1) => new FractionEtendue(num, den).simplifie()

const pgcd = (x: number, y: number): number => (y === 0 ? x : pgcd(y, x % y))

/** Facteur αx - p du dénominateur, de racine p/α. */
type Facteur = { alpha: number; p: number }

const racine = (f: Facteur) => frac(f.p, f.alpha)
const facteurTex = (f: Facteur) => reduireAxPlusB(f.alpha, -f.p)
/** Facteur dans un produit : « x », « (2x-1) ». */
const facteurProduit = (f: Facteur) =>
  f.alpha === 1 && f.p === 0 ? 'x' : `(${facteurTex(f)})`

/** Deux facteurs αx - p irréductibles (pgcd(α, p) = 1), de racines distinctes et croissantes. */
function tirerFacteurs(unitaires: boolean): [Facteur, Facteur] {
  for (;;) {
    const f1 = {
      alpha: unitaires ? 1 : choice([1, 1, 2, 3]),
      p: randint(-5, 5),
    }
    const f2 = {
      alpha: unitaires ? 1 : choice([1, 1, 2, 3]),
      p: randint(-5, 5),
    }
    if (pgcd(f1.alpha, Math.abs(f1.p)) !== 1) continue
    if (pgcd(f2.alpha, Math.abs(f2.p)) !== 1) continue
    const ecart = racine(f2).differenceFraction(racine(f1)).valeurDecimale
    if (Math.abs(ecart) < 1) continue
    return ecart > 0 ? [f1, f2] : [f2, f1]
  }
}

type Tirage =
  | {
      /** f(x) = (mx + n) / ((α1x - p1)(α2x - p2)) = a/(α1x - p1) + b/(α2x - p2). */
      forme: 'constant' | 'affine'
      f1: Facteur
      f2: Facteur
      m: number
      n: number
      a: FractionEtendue
      b: FractionEtendue
    }
  | {
      /** f(x) = (Ax² + Bx + C) / (x - p) = ax + b + c/(x - p). */
      forme: 'quotient'
      f1: Facteur
      a: number
      b: number
      c: number
    }

/** Résout α2·a + α1·b = m et -p2·a - p1·b = n (identification des coefficients). */
function decomposition(f1: Facteur, f2: Facteur, m: number, n: number) {
  const det = f1.alpha * f2.p - f2.alpha * f1.p
  return {
    a: frac(-m * f1.p - f1.alpha * n, det),
    b: frac(f2.alpha * n + f2.p * m, det),
  }
}

function tirerConstant(unitaires: boolean): Tirage {
  let [f1, f2] = tirerFacteurs(unitaires)
  // Avec α1 = α2, α(a + b) = 0 : b serait toujours l'opposé de a.
  while (!unitaires && f1.alpha === f2.alpha) [f1, f2] = tirerFacteurs(false)
  const n = choice([1, 1, 2, 3, 4, 5])
  return { forme: 'constant', f1, f2, m: 0, n, ...decomposition(f1, f2, 0, n) }
}

function tirerAffine(unitaires: boolean): Tirage {
  for (;;) {
    const [f1, f2] = tirerFacteurs(unitaires)
    const a = choice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
    const b = choice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
    // a(α2x - p2) + b(α1x - p1) = mx + n
    const m = f2.alpha * a + f1.alpha * b
    const n = -(f2.p * a + f1.p * b)
    if (m === 0 || Math.abs(m) > 15 || Math.abs(n) > 25) continue
    return { forme: 'affine', f1, f2, m, n, a: frac(a), b: frac(b) }
  }
}

/** Numérateur entier et identification donnant au moins un coefficient non entier. */
function tirerAffineFractionnaire(unitaires: boolean): Tirage {
  for (;;) {
    const [f1, f2] = tirerFacteurs(unitaires)
    const m = randint(-9, 9, 0)
    const n = randint(-12, 12)
    const { a, b } = decomposition(f1, f2, m, n)
    if (a.num === 0 || b.num === 0 || (a.den === 1 && b.den === 1)) continue
    if ([a, b].some((c) => c.den > 7 || Math.abs(c.valeurDecimale) > 6))
      continue
    const coefficients = [
      f1.alpha * f2.alpha,
      -(f1.alpha * f2.p + f2.alpha * f1.p),
      f1.p * f2.p,
    ]
    if (coefficients.some((c) => Math.abs(c) > 20)) continue
    return { forme: 'affine', f1, f2, m, n, a, b }
  }
}

function tirerQuotient(): Tirage {
  const f1 = { alpha: 1, p: randint(-4, 4) }
  return {
    forme: 'quotient',
    f1,
    a: choice([-2, -1, 1, 2, 3]),
    b: randint(-5, 5),
    c: choice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]),
  }
}

/** Somme de termes signés : « 2a-b », « \ln(3)-\dfrac{1}{2}\ln(5) ». */
const somme = (termes: string[]) =>
  termes.length === 0 ? '0' : termes.join('+').replaceAll('+-', '-')

/** Combinaison linéaire entière de lettres : « 2a-b », « -3b », « 0 ». */
const combinaison = (termes: [number, string][]) =>
  somme(
    termes
      .filter(([c]) => c !== 0)
      .map(([c, lettre]) => `${rienSi1(c)}${lettre}`),
  )

/** c/(αx - p) avec la fraction de c rentrée : « \dfrac{3}{x-2} », « -\dfrac{1}{4(2x+1)} ». */
function elementSimple(c: FractionEtendue, f: Facteur): string {
  const signe = c.valeurDecimale < 0 ? '-' : ''
  const num = Math.abs(c.num)
  const den = Math.abs(c.den)
  const bas = den === 1 ? facteurTex(f) : `${den}${facteurProduit(f)}`
  return `${signe}\\dfrac{${num}}{${bas}}`
}

/** \ln d'un rationnel positif : « \ln(3) », « \ln\left(\dfrac{3}{2}\right) ». */
function lnTex(r: FractionEtendue): string {
  return r.den === 1
    ? `\\ln(${r.num})`
    : `\\ln\\left(${r.texFractionSimplifiee}\\right)`
}

/** Exposant du nombre premier p dans l'entier n ≥ 1. */
const exposant = (n: number, p: number) =>
  n === 1 ? 0 : (factorisation(n).find(([q]) => q === p)?.[1] ?? 0)

/**
 * Valeur exacte de Σ c·ln(r) (r rationnels positifs). Si les coefficients sont égaux
 * au signe près, un seul \ln d'un rationnel supérieur à 1 : « -\dfrac{1}{2}\ln(3) »,
 * « \ln\left(\dfrac{6}{5}\right) ». Sinon, une combinaison de \ln de nombres premiers :
 * « 2\ln(2)+\ln(5) ». Renvoie null si la somme est nulle.
 */
function sommeLn(termes: [FractionEtendue, FractionEtendue][]): string | null {
  const actifs = termes.filter(
    ([c, r]) => c.valeurDecimale !== 0 && r.valeurDecimale !== 1,
  )
  if (actifs.length === 0) return null
  const premier = actifs[0][0]
  const absolu = premier.valeurDecimale < 0 ? premier.oppose() : premier
  if (actifs.every(([c]) => c.isEqual(absolu) || c.oppose().isEqual(absolu))) {
    // c ln(r) - c ln(s) = c ln(r/s).
    const produit = actifs
      .reduce(
        (acc, [c, r]) =>
          c.valeurDecimale > 0 ? acc.produitFraction(r) : acc.diviseFraction(r),
        frac(1),
      )
      .simplifie()
    if (produit.valeurDecimale === 1) return null
    // ln(1/r) = -ln(r) : on écrit le \ln d'un nombre supérieur à 1.
    return produit.valeurDecimale > 1
      ? `${rienSi1(absolu)}${lnTex(produit)}`
      : `${rienSi1(absolu.oppose())}${lnTex(frac(produit.den, produit.num))}`
  }
  const premiers = [
    ...new Set(
      actifs.flatMap(([, r]) =>
        [r.num, r.den].flatMap((k) =>
          k === 1 ? [] : factorisation(k).map(([q]) => q),
        ),
      ),
    ),
  ].sort((x, y) => x - y)
  const termesPremiers = premiers
    .map((p) => {
      const c = actifs
        .reduce(
          (acc, [coef, r]) =>
            acc.sommeFraction(
              coef.multiplieEntier(exposant(r.num, p) - exposant(r.den, p)),
            ),
          frac(0),
        )
        .simplifie()
      return [c, p] as const
    })
    .filter(([c]) => c.valeurDecimale !== 0)
  if (termesPremiers.length === 0) return null
  return somme(termesPremiers.map(([c, p]) => `${rienSi1(c)}\\ln(${p})`))
}

/** Bornes entières u < v, à au moins 1/2 des pôles, dans l'un des intervalles qu'ils délimitent. */
function bornes(poles: number[]): [number, number] {
  const gauche = Math.min(...poles)
  const droite = Math.max(...poles)
  const milieu = [Math.ceil(gauche + 0.5), Math.floor(droite - 0.5)]
  const zones = ['gauche', 'droite']
  if (milieu[1] - milieu[0] >= 1) zones.push('milieu')
  const zone = choice(zones)
  if (zone === 'gauche') {
    const v = Math.floor(gauche - 0.5) - randint(0, 1)
    return [v - randint(1, 3), v]
  }
  if (zone === 'droite') {
    const u = Math.ceil(droite + 0.5) + randint(0, 1)
    return [u, u + randint(1, 3)]
  }
  const u = randint(milieu[0], milieu[1] - 1)
  return [u, randint(u + 1, milieu[1])]
}

/** |αx - p| en un entier x, sous forme de fraction (rapports des \ln). */
const valeurAbsolue = (f: Facteur, x: number) => Math.abs(f.alpha * x - f.p)

/** Énoncé, corrections, réponses et valeur de l'intégrale d'un tirage. */
function rediger(t: Tirage, u: number, v: number) {
  const integrale = `\\displaystyle\\int_{${u}}^{${v}}f(x)\\,\\mathrm{d}x`
  const debutCalcul = `\\begin{aligned}${integrale.replace('\\displaystyle', '')}`
  if (t.forme === 'quotient') {
    const { f1, a, b, c } = t
    const p = f1.p
    // (ax + b)(x - p) + c = ax² + (b - pa)x + (c - pb)
    const numerateur = new Polynome({
      coeffs: [c - p * b, b - p * a, a],
    }).toLatex()
    const fx = facteurTex(f1)
    const coefX = combinaison([
      [1, 'b'],
      [-p, 'a'],
    ])
    const coefC = combinaison([
      [1, 'c'],
      [-p, 'b'],
    ])
    const termeX = p === 0 ? 'bx' : `(${coefX})x`
    const domaine = `\\mathbb{R}\\setminus\\{${p}\\}`
    // [a/2 x² + bx]_u^v est rationnel, c ln|x - p| donne le \ln.
    const partiePolynome = (x: number) =>
      frac(a * x * x, 2)
        .sommeFraction(frac(b * x))
        .simplifie()
    const rationnel = partiePolynome(v)
      .differenceFraction(partiePolynome(u))
      .simplifie()
    const partieLn = sommeLn([
      [frac(c), frac(valeurAbsolue(f1, v), valeurAbsolue(f1, u))],
    ])
    const valeur = somme(
      [
        rationnel.valeurDecimale === 0 ? '' : rationnel.texFractionSimplifiee,
        partieLn ?? '',
      ].filter((s) => s !== ''),
    )
    const primitive = somme(
      [
        `${rienSi1(frac(a, 2))}x^{2}`,
        b === 0 ? '' : `${rienSi1(b)}x`,
        `${rienSi1(c)}\\ln\\left|${fx}\\right|`,
      ].filter((s) => s !== ''),
    )
    const calcul =
      `${debutCalcul}&=\\int_{${u}}^{${v}}\\left(${somme([`${rienSi1(a)}x`, b === 0 ? '' : String(b), elementSimple(frac(c), f1)].filter((s) => s !== ''))}\\right)\\mathrm{d}x\\\\` +
      `&=\\left[${primitive}\\right]_{${u}}^{${v}}\\\\` +
      `&=${somme([
        `\\left(${partiePolynome(v).texFractionSimplifiee}-${partiePolynome(u).texFSP}\\right)`,
        `${rienSi1(c)}\\left(\\ln(${valeurAbsolue(f1, v)})-\\ln(${valeurAbsolue(f1, u)})\\right)`,
      ])}\\\\` +
      `&=${miseEnEvidence(valeur)}.\\end{aligned}`
    return {
      domaine,
      fTex: `\\dfrac{${numerateur}}{${fx}}`,
      decompositionTex: `ax+b+\\dfrac{c}{${fx}}`,
      poles: [p],
      exclusion: `qui ne contient pas $${p}$`,
      rappel: '',
      inconnues: ['a', 'b', 'c'],
      valeursInconnues: [String(a), String(b), String(c)],
      correctionA:
        `Pour tout $x\\in ${domaine}$, $ax+b+\\dfrac{c}{${fx}}=\\dfrac{(ax+b)${facteurProduit(f1)}+c}{${fx}}=\\dfrac{ax^{2}+${termeX}+${coefC}}{${fx}}$.<br>` +
        `Par identification avec le numérateur $${numerateur}$ de $f$ : ` +
        `$\\displaystyle\\begin{cases}a=${a}\\\\${coefX}=${b - p * a}\\\\${coefC}=${c - p * b}\\end{cases}$, ` +
        `d'où $a=${miseEnEvidence(String(a))}$, $b=${miseEnEvidence(String(b))}$ et $c=${miseEnEvidence(String(c))}$.`,
      calcul,
      valeur:
        partieLn == null && rationnel.valeurDecimale === 0 ? null : valeur,
    }
  }
  const { f1, f2, m, n, a, b } = t
  const [r1, r2] = [
    racine(f1).texFractionSimplifiee,
    racine(f2).texFractionSimplifiee,
  ]
  const domaine = `\\mathbb{R}\\setminus\\left\\{${r1};${r2}\\right\\}`
  const numerateur = reduireAxPlusB(m, n)
  const denominateur = new Polynome({
    coeffs: [
      f1.p * f2.p,
      -(f1.alpha * f2.p + f2.alpha * f1.p),
      f1.alpha * f2.alpha,
    ],
  }).toLatex()
  const [d1, d2] = [facteurTex(f1), facteurTex(f2)]
  const produit = `${facteurProduit(f1)}${facteurProduit(f2)}`
  const coefX = combinaison([
    [f2.alpha, 'a'],
    [f1.alpha, 'b'],
  ])
  const constante = combinaison([
    [-f2.p, 'a'],
    [-f1.p, 'b'],
  ])
  // Une primitive de c/(αx - p) est (c/α) ln|αx - p|.
  const [k1, k2] = [
    a.diviseFraction(frac(f1.alpha)).simplifie(),
    b.diviseFraction(frac(f2.alpha)).simplifie(),
  ]
  const valeur = sommeLn([
    [k1, frac(valeurAbsolue(f1, v), valeurAbsolue(f1, u))],
    [k2, frac(valeurAbsolue(f2, v), valeurAbsolue(f2, u))],
  ])
  const crochet = (k: FractionEtendue, f: Facteur) =>
    `${rienSi1(k)}\\left(\\ln(${valeurAbsolue(f, v)})-\\ln(${valeurAbsolue(f, u)})\\right)`
  const rappel =
    f1.alpha === 1 && f2.alpha === 1
      ? ''
      : `Une primitive de $x\\mapsto\\dfrac{1}{\\alpha x-p}$ est $x\\mapsto\\dfrac{1}{\\alpha}\\ln\\left|\\alpha x-p\\right|$. `
  const calcul =
    `${debutCalcul}&=\\int_{${u}}^{${v}}\\left(${somme([elementSimple(a, f1), elementSimple(b, f2)])}\\right)\\mathrm{d}x\\\\` +
    `&=\\left[${somme([`${rienSi1(k1)}\\ln\\left|${d1}\\right|`, `${rienSi1(k2)}\\ln\\left|${d2}\\right|`])}\\right]_{${u}}^{${v}}\\\\` +
    `&=${somme([crochet(k1, f1), crochet(k2, f2)])}\\\\` +
    `&=${miseEnEvidence(valeur ?? '0')}.\\end{aligned}`
  return {
    domaine,
    fTex: `\\dfrac{${numerateur}}{${denominateur}}`,
    decompositionTex: `\\dfrac{a}{${d1}}+\\dfrac{b}{${d2}}`,
    poles: [racine(f1).valeurDecimale, racine(f2).valeurDecimale],
    exclusion: `qui ne contient ni $${r1}$ ni $${r2}$`,
    inconnues: ['a', 'b'],
    valeursInconnues: [a.texFractionSimplifiee, b.texFractionSimplifiee],
    correctionA:
      `Pour tout $x\\in ${domaine}$, $\\dfrac{a}{${d1}}+\\dfrac{b}{${d2}}=\\dfrac{a${facteurProduit(f2)}+b${facteurProduit(f1)}}{${produit}}=\\dfrac{(${coefX})x${constante.startsWith('-') ? '' : '+'}${constante}}{${denominateur}}$.<br>` +
      `Par identification avec le numérateur $${numerateur}$ de $f$ : ` +
      `$\\displaystyle\\begin{cases}${coefX}=${m}\\\\${constante}=${n}\\end{cases}$, ` +
      `d'où $a=${miseEnEvidence(a.texFractionSimplifiee)}$ et $b=${miseEnEvidence(b.texFractionSimplifiee)}$.`,
    rappel,
    calcul,
    valeur,
  }
}

/** @author Nathan Scheinmann */
export default class ElementsSimples extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacingCorr = 2
    this.comment =
      "Par défaut, les facteurs du dénominateur peuvent être de la forme αx - p avec α = 2 ou 3, par exemple (2x - 1)(x + 3). Avec des facteurs x - p et un numérateur constant, on aurait toujours a + b = 0 : b serait l'opposé de a, ce que les élèves repèrent vite. Cocher « Facteurs du dénominateur de la forme x - p » pour revenir à des dénominateurs (x - p)(x - q), plus simples.<br>La forme « Degré 2 sur degré 1 » a toujours un dénominateur x - p et demande trois réels a, b et c. Pour que chaque question vaille le même nombre de points, la question vaut toujours 3 points, répartis proportionnellement aux réponses justes."
    this.besoinFormulaireComplexe = formulaire
    this.comment +=
      '<br>La famille « Numérateur affine, coefficients fractionnaires » donne au moins un coefficient non entier, avec des dénominateurs au plus égaux à 7.'
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const unitaires = params.case('unitaires')
    const formes = repartitionPonderee(
      shuffle(params.liste('formes')),
      this.nbQuestions,
      shuffle(params.declares('formes')),
    )
    const tirages: Record<string, () => Tirage> = {
      constant: () => tirerConstant(unitaires),
      affine: () => tirerAffine(unitaires),
      quotient: tirerQuotient,
      affineFractionnaire: () => tirerAffineFractionnaire(unitaires),
    }
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const t = tirages[formes[i]]()
      const [u, v] = bornes(
        t.forme === 'quotient'
          ? [t.f1.p]
          : [racine(t.f1).valeurDecimale, racine(t.f2).valeurDecimale],
      )
      const r = rediger(t, u, v)
      if (r.valeur == null) continue
      if (!this.questionJamaisPosee(i, r.fTex, r.calcul)) continue
      const champ = { keyboard: KeyboardType.clavierFonctionsTerminales }
      const champs = r.inconnues
        .map((x, k) => `$${x}=$ %{${k}}`)
        .join(' $\\qquad$ ')
      const lettres =
        r.inconnues.length === 2 ? '$a$ et $b$' : '$a$, $b$ et $c$'
      const consigne = `Déterminer les réels ${lettres} tels que, pour tout $x\\in ${r.domaine}$, $f(x)=${r.decompositionTex}$.`
      const integrale = `\\int_{${u}}^{${v}}f(x)\\,\\mathrm{d}x`
      createQuestion(this, i, {
        question: `Soit $f\\colon ${r.domaine}\\to\\mathbb{R}$ la fonction définie par $f(x)=${r.fTex}$.`,
        correction: '',
        subQuestions: [
          {
            question: consigne + (this.interactif ? `<br>${champs}` : ''),
            answer: r.valeursInconnues.map((value) => ({ value })),
            field: r.valeursInconnues.map(() => champ),
            correction: r.correctionA,
          },
          {
            question:
              `En déduire la valeur exacte de $\\displaystyle${integrale}$.` +
              (this.interactif ? `<br>$\\displaystyle${integrale}=$ %{0}` : ''),
            answer: { value: r.valeur, compare: seq([noDecimal(), isEqual()]) },
            field: champ,
            // En Typst, un aligned en ligne n'aligne pas sa première ligne : on le met en
            // mode affiché, que KaTeX (HTML) ne reconnaît pas sous la forme $$…$$.
            correction:
              `La fonction $f$ est continue sur $[${u};${v}]$, ${r.exclusion}. ${r.rappel}On a donc :` +
              (context.isTypst ? `$$${r.calcul}$$` : `<br>$${r.calcul}$`),
          },
        ],
        // 2 ou 3 inconnues selon la forme : la question vaut toujours 3 points.
        bareme: troisPointsProportionnels,
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
