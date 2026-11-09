import type Exercice from '../../exercices/Exercice'
import { Courbe } from '../2d/Courbe'
import { droite } from '../2d/droites'
import { pointAbstrait } from '../2d/PointAbstrait'
import { repere } from '../2d/reperes'
import { bleuMathalea } from '../colors'
import {
  lireFormulaireComplexe,
  repartitionPonderee,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../formulaireComplexe'
import { KeyboardType } from '../interactif/claviers/keyboard'
import {
  all,
  sameRationalFunction,
  sameTopLevelOperation,
  undefinedAt,
} from '../interactif/checks'
import { createQuestion } from '../interactif/createQuestion'
import { shuffle } from '../outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../outils/ecritures'
import { miseEnEvidence } from '../outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import {
  horizontalGapForSlope,
  pointMark,
  verticalAsymptote,
} from './lectureLimitesGraphiques'

export const formulaireReconstruction: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Familles de fonctions',
      items: [
        {
          nom: 'uneHorizontale',
          label: 'Une asymptote verticale et une horizontale',
        },
        {
          nom: 'uneOblique',
          label: 'Une asymptote verticale et une oblique',
        },
        {
          nom: 'deuxHorizontale',
          label: 'Deux asymptotes verticales et une horizontale',
        },
        {
          nom: 'deuxOblique',
          label: 'Deux asymptotes verticales et une oblique',
        },
      ],
    },
    {
      type: 'selection',
      nom: 'nombres',
      label: 'Nombres',
      defaut: 'entiers',
      options: [
        { valeur: 'entiers', label: 'Entiers' },
        { valeur: 'fractions', label: 'Fractions' },
      ],
    },
    { type: 'case', nom: 'trou', label: 'Avec un trou', defaut: false },
    {
      type: 'case',
      nom: 'touteExpression',
      label: 'Accepter toute expression de f (sinon une seule fraction)',
      defaut: false,
    },
    {
      type: 'selection',
      nom: 'donnees',
      label: 'Données',
      defaut: 'texte',
      options: [
        { valeur: 'texte', label: 'Énoncé écrit' },
        { valeur: 'graphique', label: 'Graphique' },
      ],
    },
  ],
}

export type FamilleRationnelle =
  'uneHorizontale' | 'uneOblique' | 'deuxHorizontale' | 'deuxOblique'
type F = FractionEtendue
const frac = (n: number, d = 1): F => new FractionEtendue(n, d).simplifie()
const plus = (a: F, b: F): F => a.sommeFraction(b).simplifie()
const moins = (a: F, b: F): F => a.differenceFraction(b).simplifie()
const fois = (a: F, b: F): F => a.produitFraction(b).simplifie()
const tex = (a: F): string => a.texFractionSimplifiee
const coordonnees = (x: number | F, y: number | F): string =>
  `(${typeof x === 'number' ? x : tex(x)};${typeof y === 'number' ? y : tex(y)})`

/** Coefficients par puissances croissantes, écriture sans termes nuls ni + initial. */
export function polynomeRationnelTex(coefficients: F[]): string {
  return (
    coefficients
      .map((c, i) => {
        if (c.num === 0) return ''
        const negatif = c.num < 0
        const absolu = frac(Math.abs(c.num), c.den)
        const facteur = i > 0 && absolu.num === absolu.den ? '' : tex(absolu)
        return `${negatif ? '-' : '+'}${facteur}${i === 0 ? '' : i === 1 ? 'x' : `x^{${i}}`}`
      })
      .reverse()
      .join('')
      .replace(/^\+/, '') || '0'
  )
}

function evaluerEn(coefficients: F[], x: F): F {
  return coefficients.reduceRight((acc, c) => plus(fois(acc, x), c), frac(0))
}

export function evaluerPolynomeRationnel(coefficients: F[], x: number): F {
  return evaluerEn(coefficients, frac(x))
}

/** Quotient de p par x - r, lorsque r est une racine de p. */
function diviserParRacine(p: F[], r: F): F[] {
  const quotient: F[] = Array(p.length - 1)
  let acc = frac(0)
  for (let k = p.length - 1; k >= 1; k--) {
    acc = plus(fois(acc, r), p[k])
    quotient[k - 1] = acc
  }
  return quotient
}

export type TirageRationnel = {
  famille: FamilleRationnelle
  poles: number[]
  m: F
  p: F
  reste: F[]
  /** Dénominateur unitaire de la forme simplifiée, sans le facteur du trou. */
  denominateur: F[]
  /** Numérateur de la forme simplifiée, sans le facteur du trou. */
  numerateur: F[]
  points: { x: number; y: F }[]
  trou?: { x: number; y: F }
  fenetre?: FenetreGraphique
}

/** Fenêtre du graphique : abscisses de -6 à 6, ordonnées entières. */
export type FenetreGraphique = {
  yMin: number
  yMax: number
  /** Deux points à coordonnées entières de l'asymptote oblique, pour la correction. */
  reperes: { x: number; y: number }[]
}

const X_MIN = -6
const X_MAX = 6

/** Choisir une fenêtre où les points, les asymptotes et chaque branche sont lisibles. */
function fenetreGraphique(
  f: (x: number) => number,
  asymptote: (x: number) => number,
  oblique: boolean,
  poles: number[],
  ordonnees: number[],
): FenetreGraphique | undefined {
  let bas = Math.min(0, ...ordonnees)
  let haut = Math.max(0, ...ordonnees)
  if (!oblique) {
    bas = Math.min(bas, asymptote(0))
    haut = Math.max(haut, asymptote(0))
  }
  const reperes: { x: number; y: number }[] = []
  if (oblique) {
    // Deux points à coordonnées entières de l'asymptote, proches des autres données.
    const reseau = Array.from({ length: 11 }, (_, i) => i - 5)
      .map((x) => ({ x, y: asymptote(x) }))
      .filter((q) => Math.abs(q.y - Math.round(q.y)) < 1e-9)
      .map((q) => ({ x: q.x, y: Math.round(q.y) }))
      .sort(
        (a, b) =>
          Math.max(0, bas - a.y, a.y - haut) -
            Math.max(0, bas - b.y, b.y - haut) || Math.abs(a.x) - Math.abs(b.x),
      )
    const premier = reseau[0]
    const second = reseau.find(
      (q) => premier != null && Math.abs(q.x - premier.x) >= 2,
    )
    if (premier == null || second == null) return undefined
    reperes.push(...[premier, second].sort((a, b) => a.x - b.x))
    bas = Math.min(bas, premier.y, second.y)
    haut = Math.max(haut, premier.y, second.y)
  }
  const yMin = Math.floor(bas) - 2
  const yMax = Math.ceil(haut) + 2
  if (yMax - yMin > 14) return undefined
  // Chaque branche doit rester visible sur une largeur suffisante.
  const bornes = [X_MIN, ...poles, X_MAX]
  for (let k = 0; k < bornes.length - 1; k++) {
    const [debut, fin] = [bornes[k], bornes[k + 1]]
    let visible = 0
    for (let x = debut + 0.01; x < fin - 0.01; x += 0.02) {
      const y = f(x)
      if (y > yMin + 0.3 && y < yMax - 0.3) visible += 0.02
    }
    if (visible < Math.min(1.5, 0.5 * (fin - debut))) return undefined
  }
  return { yMin, yMax, reperes }
}

/** Tirer en arithmétique entière avec un dénominateur commun, sans arrondis.
 * Les FractionEtendue ne sont construites qu'une fois le tirage admissible.
 */
export function tirerRationnelle(
  famille: FamilleRationnelle,
  fractions: boolean,
  { graphique = false, avecTrou = false } = {},
): TirageRationnel {
  const deux = famille.startsWith('deux')
  const oblique = famille.endsWith('Oblique')
  const pgcd = (a: number, b: number): number => {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b !== 0) {
      const reste = a % b
      a = b
      b = reste
    }
    return a
  }
  const petit = (n: number, d = 1) =>
    Math.abs(n) <= 12 * Math.abs(d) &&
    Math.abs(d) / pgcd(n, d) <= (fractions ? 4 : 1)
  const evaluer = (coeffs: number[], x: number) =>
    coeffs.reduceRight((acc, c) => acc * x + c, 0)
  for (let essai = 0; essai < 5000; essai++) {
    const r = randint(-3, 3)
    const poles = deux ? [r, randint(-3, 3, r)].sort((a, b) => a - b) : [r]
    const denominateur = deux
      ? [poles[0] * poles[1], -poles[0] - poles[1], 1]
      : [-r, 1]
    // Repli du graphique (voir plus bas) : coefficients entiers.
    const repli = graphique && essai >= 2500
    const d = fractions && !repli ? randint(2, 4) : 1
    const m = oblique ? randint(-3, 3, 0) : 0
    const p = randint(-4, 4)
    const reste = deux ? [randint(-6, 6), randint(-4, 4)] : [randint(-6, 6, 0)]
    if (poles.some((x) => evaluer(reste, x) === 0)) continue
    // Sur le graphique, une asymptote x=0 ou y=0 se confondrait avec un axe,
    // et une asymptote horizontale doit passer par des points à coordonnées entières.
    if (
      graphique &&
      (poles.includes(0) || (!oblique && (p === 0 || p % d !== 0)))
    )
      continue
    const numerateur: number[] = Array(
      denominateur.length + (oblique ? 1 : 0),
    ).fill(0)
    denominateur.forEach((c, i) => {
      numerateur[i] += p * c
      if (oblique) numerateur[i + 1] += m * c
    })
    reste.forEach((c, i) => {
      numerateur[i] += c
    })
    if (
      ![...numerateur, m, p, ...reste].every((n) => petit(n, d)) ||
      !denominateur.every((n) => petit(n))
    )
      continue
    // Sur le graphique, les points et le trou ont des coordonnées entières
    // et ne sont pas sur l'asymptote horizontale ou oblique.
    const lisible = (point: { x: number; n: number; d: number }) =>
      !graphique ||
      (point.n % point.d === 0 &&
        Math.abs(point.n / point.d) <= 6 &&
        point.n * d !== point.d * (m * point.x + p))
    const valeurs = Array.from({ length: 11 }, (_, i) => i - 5)
      .filter((x) => !poles.includes(x))
      .map((x) => ({
        x,
        n: evaluer(numerateur, x),
        d: d * evaluer(denominateur, x),
      }))
      .filter((point) => petit(point.n, point.d) && lisible(point))
    const candidats = shuffle(valeurs)
    const points = candidats.slice(0, poles.length)
    if (points.length < poles.length) continue
    // Le trou n'est ni sur un axe ni sur un point donné.
    const trou = avecTrou
      ? candidats
          .slice(poles.length)
          .find(
            (q) =>
              Math.abs(q.x) <= 4 && q.x !== 0 && q.n !== 0 && petit(q.n, q.d),
          )
      : undefined
    if (avecTrou && trou == null) continue
    // Avec le graphique, les points lus sont entiers : pour une asymptote
    // horizontale et une verticale, l'expression est alors forcément entière,
    // et elle l'est presque toujours avec un trou en plus. Au-delà de la moitié
    // des essais, on renonce donc aux fractions.
    if (
      fractions &&
      !(repli || (graphique && famille === 'uneHorizontale')) &&
      [...numerateur, m, p].every((n) => n % d === 0) &&
      points.every((q) => q.n % q.d === 0)
    )
      continue
    let fenetre: FenetreGraphique | undefined
    if (graphique) {
      fenetre = fenetreGraphique(
        (x) => evaluer(numerateur, x) / (d * evaluer(denominateur, x)),
        (x) => (m * x + p) / d,
        oblique,
        poles,
        [...points, ...(trou ? [trou] : [])].map((q) => q.n / q.d),
      )
      if (fenetre == null) continue
    }
    return {
      famille,
      poles,
      m: frac(m, d),
      p: frac(p, d),
      reste: reste.map((n) => frac(n, d)),
      denominateur: denominateur.map((n) => frac(n)),
      numerateur: numerateur.map((n) => frac(n, d)),
      points: points.map((q) => ({ x: q.x, y: frac(q.n, q.d) })),
      trou: trou ? { x: trou.x, y: frac(trou.n, trou.d) } : undefined,
      fenetre,
    }
  }
  throw new Error(`Aucun tirage de reconstruction rationnelle pour ${famille}.`)
}

const facteursTex = (t: TirageRationnel): string =>
  produitTex(
    frac(1),
    t.poles.map((r) => reduireAxPlusB(1, -r)),
  )

/** Plus petit multiple commun des dénominateurs des coefficients. */
const ppcmDenominateurs = (coefficients: F[]): number =>
  coefficients.reduce((acc, c) => {
    let [a, b] = [acc, c.den]
    while (b !== 0) [a, b] = [b, a % b]
    return (acc * c.den) / a
  }, 1)

/** Forme simplifiée en une fraction, sans fraction au numérateur. */
export const fractionRationnelleTex = (t: TirageRationnel): string => {
  const ppcm = ppcmDenominateurs(t.numerateur)
  return `\\dfrac{${polynomeRationnelTex(t.numerateur.map((c) => fois(c, frac(ppcm))))}}{${produitTex(
    frac(ppcm),
    t.poles.map((r) => reduireAxPlusB(1, -r)),
  )}}`
}

export function decompositionRationnelleTex(t: TirageRationnel): string {
  const q = polynomeRationnelTex([t.p, t.m])
  const reste = polynomeRationnelTex(t.reste)
  return `${q === '0' ? '' : q + '+'}\\dfrac{${reste}}{${facteursTex(t)}}`
}

/** Produit c(x-r1)(x-r2)…(reste), sans parenthèses superflues. */
function produitTex(constante: F, facteurs: string[]): string {
  if (facteurs.length === 0) return tex(constante)
  const un = constante.num === constante.den
  const moinsUn = constante.num === -constante.den
  if (facteurs.length === 1 && un) return facteurs[0]
  const prefixe = un ? '' : moinsUn ? '-' : tex(constante)
  // Le facteur x s'écrit sans parenthèses, en tête : x(x-2).
  const x = facteurs.filter((f) => f === 'x')
  const autres = facteurs.filter((f) => f !== 'x')
  return prefixe + x.join('') + autres.map((f) => `(${f})`).join('')
}

/** Factoriser sur Q autant que possible : racines rationnelles de dénominateur au plus 4. */
function factoriserTex(polynome: F[], racinesImposees: number[]): string {
  let reste = polynome
  const racines: F[] = racinesImposees.map((r) => frac(r))
  let trouve = true
  while (reste.length > 1 && trouve) {
    trouve = false
    for (let q = 1; q <= 4 && !trouve; q++) {
      for (let n = -24; n <= 24 && !trouve; n++) {
        const r = frac(n, q)
        if (r.den !== q || evaluerEn(reste, r).num !== 0) continue
        // (x - n/q) = (qx - n)/q
        reste = diviserParRacine(reste, r).map((c) => fois(c, frac(1, q)))
        racines.push(r)
        trouve = true
      }
    }
  }
  const facteurs = racines
    .sort((a, b) => a.valeurDecimale - b.valeurDecimale)
    .map((r) => reduireAxPlusB(r.den, -r.num))
  if (reste.length === 1) return produitTex(reste[0], facteurs)
  const negatif = (reste.at(-1)?.num ?? 0) < 0
  if (negatif) reste = reste.map((c) => fois(c, frac(-1)))
  return produitTex(frac(negatif ? -1 : 1), [
    ...facteurs,
    polynomeRationnelTex(reste),
  ])
}

/** Expression finale de f en une seule fraction factorisée, avec le facteur du trou. */
export function fractionFinaleTex(t: TirageRationnel): string {
  // On chasse les dénominateurs du numérateur.
  const ppcm = ppcmDenominateurs(t.numerateur)
  const numerateur = t.numerateur.map((c) => fois(c, frac(ppcm)))
  const trou = t.trou ? [t.trou.x] : []
  const facteursDenominateur = [...t.poles, ...trou]
    .sort((a, b) => a - b)
    .map((r) => reduireAxPlusB(1, -r))
  return `\\dfrac{${factoriserTex(numerateur, trou)}}{${produitTex(frac(ppcm), facteursDenominateur)}}`
}

const nomPoint = (t: TirageRationnel, i: number, graphique: boolean) =>
  graphique
    ? `le point $${coordonnees(t.points[i].x, t.points[i].y)}$`
    : `le point $${i === 0 ? 'A' : 'B'}$`

function conditions(t: TirageRationnel): string {
  const droites = t.poles
    .map((r) => `$x=${r}$`)
    .concat(`$y=${polynomeRationnelTex([t.p, t.m])}$`)
  const points = t.points.map(
    (point, i) => `$${i === 0 ? 'A' : 'B'}${coordonnees(point.x, point.y)}$`,
  )
  const trou = t.trou
    ? ` et présente un trou en $${coordonnees(t.trou.x, t.trou.y)}$`
    : ''
  return `Le graphe de $f$ admet les droites ${droites.slice(0, -1).join(', ')} et ${droites.at(-1)} comme asymptotes, passe par ${points.join(' et ')}${trou}.`
}

/** Courbe, asymptotes en traitillés, points marqués et trou. */
export function figureRationnelle(t: TirageRationnel): string {
  if (t.fenetre == null) return ''
  const { yMin, yMax } = t.fenetre
  const r = repere({
    xMin: X_MIN,
    xMax: X_MAX,
    yMin,
    yMax,
    xUnite: 1,
    yUnite: 1,
    thickHauteur: 0.08,
    grilleSecondaire: true,
    grilleSecondaireXMin: X_MIN,
    grilleSecondaireXMax: X_MAX,
    grilleSecondaireYMin: yMin,
    grilleSecondaireYMax: yMax,
    grilleSecondaireDistance: 1,
    xLegende: '$x$',
    xLegendePosition: [X_MAX - 0.3, 0.5],
    yLegende: '$y$',
    yLegendePosition: [0.7, yMax - 0.25],
  })
  const num = t.numerateur.map((c) => c.num / c.den)
  const den = t.denominateur.map((c) => c.num / c.den)
  const evaluer = (coeffs: number[], x: number) =>
    coeffs.reduceRight((acc, c) => acc * x + c, 0)
  const f = (x: number) => evaluer(num, x) / evaluer(den, x)
  const pgf = (coeffs: F[]) =>
    coeffs.map((c, i) => `(${c.num}/${c.den})*x^${i}`).join('+')
  const fLatex = `(${pgf(t.numerateur)})/(${pgf(t.denominateur)})`
  const dehors = (y: number) => y < yMin - 0.5 || y > yMax + 0.5
  // Près d'un pôle, partir de l'endroit où la courbe sort juste de la fenêtre.
  const ecart = (pole: number, sens: number) => {
    let [dedans, hors] = [0.5, 1e-6]
    if (dehors(f(pole + sens * dedans))) return dedans
    while (dedans - hors > 1e-5) {
      const milieu = (dedans + hors) / 2
      if (dehors(f(pole + sens * milieu))) hors = milieu
      else dedans = milieu
    }
    return hors
  }
  const bornes = [X_MIN, ...t.poles, X_MAX]
  const morceaux: [number, number][] = []
  for (let k = 0; k < bornes.length - 1; k++) {
    const debut = k === 0 ? X_MIN : bornes[k] + ecart(bornes[k], 1)
    const fin =
      k === bornes.length - 2 ? X_MAX : bornes[k + 1] - ecart(bornes[k + 1], -1)
    const c = t.trou?.x
    if (c != null && c > debut && c < fin) {
      // Interrompre la courbe autour du trou, comme dans 3mLimCont-3.
      const pente = (f(c + 0.001) - f(c - 0.001)) / 0.002
      const h = horizontalGapForSlope(pente)
      morceaux.push([debut, c - h], [c + h, fin])
    } else morceaux.push([debut, fin])
  }
  // La courbe déborde un peu de la fenêtre, coupée au bord par le cadre,
  // pour rejoindre le bord près des asymptotes verticales.
  const courbes = morceaux.map(([debut, fin]) => {
    const courbe = new Courbe(f, {
      repere: r,
      xMin: debut,
      xMax: fin,
      yMin: yMin - 1,
      yMax: yMax + 1,
      step: 0.01,
      color: bleuMathalea,
      epaisseur: 2,
      usePgfplots: true,
      fLatex,
    })
    courbe.samples = 200
    return courbe
  })
  const asymptote = (x: number) => (t.m.num / t.m.den) * x + t.p.num / t.p.den
  const oblique = droite(
    pointAbstrait(X_MIN, asymptote(X_MIN)),
    pointAbstrait(X_MAX, asymptote(X_MAX)),
    '',
    bleuMathalea,
  )
  oblique.pointilles = 5
  oblique.usePgfplots = true
  oblique.pgfplotsOptions = 'dashed'
  return mathalea2d(
    {
      xmin: X_MIN,
      xmax: X_MAX,
      ymin: yMin,
      ymax: yMax,
      scale: context.isHtml ? 0.58 : 1,
      pixelsParCm: 28,
      usePgfplots: true,
      pgfplotsAxisEqual: true,
      centerLatex: true,
      display: 'block',
      center: true,
    },
    r,
    ...t.poles.map((pole) => verticalAsymptote(pole)),
    oblique,
    ...courbes,
    ...t.points.map((q) => pointMark(q.x, q.y.num / q.y.den, true)),
    ...(t.trou
      ? [pointMark(t.trou.x, t.trou.y.num / t.trou.y.den, false)]
      : []),
  )
}

/** Ce que l'on lit sur le graphique, avant la démarche commune. */
function lectureGraphique(t: TirageRationnel): string {
  const q = polynomeRationnelTex([t.p, t.m])
  const verticales = t.poles.map((r) => `$x=${r}$`).join(' et ')
  if (t.fenetre == null) return ''
  const points = t.points
    .map((point) => `$${coordonnees(point.x, point.y)}$`)
    .join(' et ')
  const [A, B] = t.fenetre?.reperes ?? []
  const elements = [
    `${t.poles.length === 1 ? "l'asymptote verticale" : 'les asymptotes verticales'} ${verticales}`,
    t.m.num === 0
      ? `l'asymptote horizontale $y=${q}$`
      : `l'asymptote oblique, qui passe par $${coordonnees(A.x, A.y)}$ et $${coordonnees(B.x, B.y)}$`,
    `${t.points.length === 1 ? 'le point' : 'les points'} ${points}`,
    ...(t.trou ? [`le trou en $${coordonnees(t.trou.x, t.trou.y)}$`] : []),
  ]
  let lecture = `On lit sur le graphique : ${elements.join(' ; ')}.<br>`
  if (t.m.num !== 0) {
    lecture += `La pente de l'asymptote oblique vaut $\\dfrac{${B.y}-${ecritureParentheseSiNegatif(A.y)}}{${B.x}-${ecritureParentheseSiNegatif(A.x)}}=${tex(t.m)}$. `
    const surAxe = [A, B].find((point) => point.x === 0)
    lecture += surAxe
      ? `Elle coupe l'axe des ordonnées en $${surAxe.y}$, donc son équation est $y=${q}$.<br>`
      : `Son ordonnée à l'origine $h$ vérifie $${A.y}=${tex(t.m)}\\times${ecritureParentheseSiNegatif(A.x)}+h$, donc $h=${tex(t.p)}$ et son équation est $y=${q}$.<br>`
  }
  return lecture
}

/** Reconstituer le reste par interpolation, avant de vérifier chaque pôle. */
export function correctionRationnelle(
  t: TirageRationnel,
  graphique = false,
): string {
  const deux = t.poles.length === 2
  const q = polynomeRationnelTex([t.p, t.m])
  const d = facteursTex(t)
  let correction = graphique ? lectureGraphique(t) : ''
  correction += `Le dénominateur de degré minimal a une racine simple pour chaque asymptote verticale${t.trou ? ' (le facteur du trou est ajouté à la fin)' : ''}. En le choisissant unitaire, on obtient $D(x)=${d}$.<br>`
  correction += `L'asymptote ${t.m.num === 0 ? 'horizontale' : 'oblique'} impose le quotient $${q}$. `
  correction += `On écrit donc $f(x)=${q === '0' ? '' : q + '+'}\\dfrac{${deux ? 'ux+v' : 'k'}}{${d}}$.<br>`
  const valeurs = t.points.map((point, i) => {
    const dx = evaluerPolynomeRationnel(t.denominateur, point.x)
    const qx = evaluerPolynomeRationnel([t.p, t.m], point.x)
    const rx = fois(moins(point.y, qx), dx)
    const nom = nomPoint(t, i, graphique)
    correction += `${nom.charAt(0).toUpperCase()}${nom.slice(1)} donne $${deux ? (point.x === 0 ? 'v' : reduireAxPlusB(point.x, 0).replace('x', 'u') + '+v') : 'k'}=\\left(${tex(point.y)}-\\left(${tex(qx)}\\right)\\right)\\times\\left(${tex(dx)}\\right)=${tex(rx)}$.<br>`
    return rx
  })
  if (deux) {
    const delta = t.points[1].x - t.points[0].x
    correction += `En soustrayant les deux équations, $${delta === 1 ? '' : delta === -1 ? '-' : delta}u=${tex(moins(valeurs[1], valeurs[0]))}$, d'où $u=${tex(t.reste[1])}$. `
    correction += `En remplaçant dans la première équation, $v=${tex(t.reste[0])}$.<br>`
  }
  correction += `Ainsi, $f(x)=${decompositionRationnelleTex(t)}=${fractionRationnelleTex(t)}$.<br>`
  correction += `Le reste $R(x)=${polynomeRationnelTex(t.reste)}$ est de degré strictement inférieur à celui de $D$, donc $\\lim_{x\\to\\pm\\infty}\\dfrac{R(x)}{D(x)}=0$. `
  correction += `La droite $y=${q}$ est bien une asymptote.<br>`
  correction +=
    t.poles
      .map((r) => `$R(${r})=${tex(evaluerPolynomeRationnel(t.reste, r))}\\ne0$`)
      .join(' et ') +
    ' : aucune simplification ne supprime les asymptotes verticales.<br>'
  correction += `Les ${deux ? 'deux points d’abscisses distinctes déterminent uniquement le reste affine' : 'coordonnées du point déterminent uniquement le reste constant'}.`
  if (t.trou) {
    const c = t.trou.x
    correction += `<br>Le graphe présente un trou en $${coordonnees(c, t.trou.y)}$ : on multiplie le numérateur et le dénominateur par $${reduireAxPlusB(1, -c)}$. `
    correction += `Les valeurs de $f$ ne changent pas ailleurs, $f$ n'est plus définie en $x=${c}$ et l'expression simplifiée y vaut $${tex(evaluerPolynomeRationnel(t.numerateur, c).diviseFraction(evaluerPolynomeRationnel(t.denominateur, c)).simplifie())}$.`
  }
  return correction
}

export function initialiserReconstruction(exercice: Exercice): void {
  exercice.nbQuestions = 2
  exercice.spacingCorr = 3
  exercice.besoinFormulaireComplexe = formulaireReconstruction
  exercice.sup = serialiseFormulaireComplexe(
    formulaireReconstruction,
    valeursParDefaut(formulaireReconstruction),
  )
  exercice.comment =
    'Avec le graphique, les asymptotes sont tracées en traitillés et passent par des points à coordonnées entières ; les points marqués et le trou ont aussi des coordonnées entières. ' +
    'Les asymptotes x = 0 et y = 0 sont évitées, car elles se confondraient avec les axes. ' +
    "Avec l'option Fractions, l'expression lue sur le graphique peut donc rester à coefficients entiers : c'est toujours le cas avec une asymptote verticale et une horizontale, et presque toujours avec un trou et deux asymptotes verticales. " +
    'En mode interactif, toute expression de f est acceptée si la case est cochée ; sinon, la réponse doit être une seule fraction (développée ou factorisée). Avec un trou, elle doit garder le facteur qui se simplifie.'
}

export function genererReconstruction(exercice: Exercice): void {
  const params = lireFormulaireComplexe(formulaireReconstruction, exercice.sup)
  const graphique = params.selection('donnees') === 'graphique'
  const touteExpression = params.case('touteExpression')
  const familles = repartitionPonderee(
    shuffle(params.liste('familles')),
    exercice.nbQuestions,
    shuffle(params.declares('familles')),
  )
  exercice.consigne = `Déterminer l'expression d'une fonction rationnelle $f$ dont le dénominateur est de degré minimal.${touteExpression ? '' : ' Écrire $f(x)$ comme une seule fraction.'}`
  const sautDeParagraphe = context.isHtml ? '<br>' : '\n\n'
  for (
    let i = 0, essais = 0;
    i < exercice.nbQuestions && essais < 50;
    essais++
  ) {
    const t = tirerRationnelle(
      familles[i] as FamilleRationnelle,
      params.selection('nombres') === 'fractions',
      { graphique, avecTrou: params.case('trou') },
    )
    if (
      !exercice.questionJamaisPosee(
        i,
        JSON.stringify(t.numerateur.map(tex)),
        JSON.stringify(t.denominateur.map(tex)),
        JSON.stringify(t.points.map((p) => [p.x, tex(p.y)])),
        JSON.stringify(t.trou ? [t.trou.x, tex(t.trou.y)] : []),
      )
    )
      continue
    const donnees = graphique
      ? `La courbe représentative de $f$ est tracée ci-dessous avec ses asymptotes, en traitillés. Les points marqués${t.trou ? ', dont le trou,' : ''} ont des coordonnées entières.${sautDeParagraphe}${figureRationnelle(t)}`
      : conditions(t)
    const finale = fractionFinaleTex(t)
    const trou = t.trou ? [undefinedAt({ values: [t.trou.x] })] : []
    createQuestion(exercice, i, {
      question: donnees,
      correction: `${correctionRationnelle(t, graphique)}<br>Finalement, $f(x)=${miseEnEvidence(finale)}$.`,
      answer: {
        value: finale,
        compare: all([
          ...(touteExpression
            ? []
            : [
                sameTopLevelOperation({
                  feedbackKo: 'Écrire $f(x)$ comme une seule fraction.',
                }),
              ]),
          sameRationalFunction(),
          ...trou,
        ]),
      },
      field: {
        keyboard: KeyboardType.clavierDeBaseAvecVariable,
        texteAvant: '<br>$f(x)=$',
      },
    })
    i++
  }
  listeQuestionsToContenu(exercice)
}
