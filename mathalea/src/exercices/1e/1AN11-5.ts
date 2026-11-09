import { courbe, intervallesDansLaFenetre } from '../../lib/2d/Courbe'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea, vertMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Lire graphiquement un nombre dérivé avec la tangente à une courbe'
export const dateDePublication = '12/10/2026'
export const uuid = '8c073'
export const refs = {
  'fr-fr': ['1AN11-5'],
  'fr-ch': [],
}
export const interactifReady = true
export const interactifType = 'mathLive'

/**
 * Une courbe et sa tangente en un point $A$ sont tracées : il faut lire le nombre dérivé en $A$,
 * c'est-à-dire le coefficient directeur de la tangente.
 * Le point de tangence $A$ est toujours à coordonnées entières et le nombre dérivé est entier (par défaut)
 * ou fractionnaire, de sorte que la tangente passe par un second point $B$ à coordonnées entières, situé dans le repère
 * (à une unité de $A$ pour un nombre dérivé entier, au dénominateur près sinon).
 * La correction trace en pointillés le « triangle de pente » entre $A$ et $B$.
 * @author Rémi Angot
 */

const fenetre = { xMin: -6, xMax: 6, yMin: -5, yMax: 5 }
const tolerance = 1e-9

/** Courbe tirée au sort : $f$, sa dérivée et les caractéristiques utiles au choix du point de tangence */
type Modele = {
  f: (x: number) => number
  df: (x: number) => number
  /** Intervalles sur lesquels la courbe est tracée (les asymptotes et bords de domaine en sont exclus) */
  intervalles: [number, number][]
  /** Abscisses possibles pour le point de tangence (par défaut, tous les entiers de [-5 ; 5]) */
  abscisses?: number[]
  /** Domaine de définition et de dérivabilité, tel qu'il est écrit dans l'énoncé */
  domaine: string
  /** Identifiant des paramètres tirés, pour ne pas poser deux fois la même question */
  cle: string
}

const deriveeSurR = 'dérivable sur $\\mathbb{R}$'

const toutLIntervalle: [number, number][] = [[fenetre.xMin, fenetre.xMax]]

/**
 * Les paramètres des courbes sont choisis pour que, quand `fractionnaire` est vrai, certains points à coordonnées
 * entières aient un nombre dérivé fractionnaire (ce qui exclut l'exponentielle et la fonction périodique).
 */
const parabole = (fractionnaire: boolean): Modele => {
  // k = ±1/9 : en x - h = ±3, on a f(x) - c = ±1 et f'(x) = ±2/3 ; k = ±1/16 : en x - h = ±4, f(x) - c = ±1 et f'(x) = ±1/2
  const k = fractionnaire
    ? choice([-1 / 9, 1 / 9, -1 / 16, 1 / 16])
    : choice([-2, -1, -0.5, -0.25, 0.25, 0.5, 1, 2])
  const h = randint(-3, 3)
  const c = randint(-3, 3)
  return {
    f: (x) => k * (x - h) ** 2 + c,
    df: (x) => 2 * k * (x - h),
    intervalles: toutLIntervalle,
    domaine: deriveeSurR,
    cle: `parabole${k};${h};${c}`,
  }
}

const cube = (fractionnaire: boolean): Modele => {
  // k = ±1/8 : en x - h = ±2, on a f(x) - c = ±1 et f'(x) = 3/2
  const k = fractionnaire
    ? choice([-1 / 8, 1 / 8])
    : choice([-1, -0.5, -0.25, 0.25, 0.5, 1])
  const h = randint(-2, 2)
  const c = randint(-2, 2)
  return {
    f: (x) => k * (x - h) ** 3 + c,
    df: (x) => 3 * k * (x - h) ** 2,
    intervalles: toutLIntervalle,
    domaine: deriveeSurR,
    cle: `cube${k};${h};${c}`,
  }
}

const cubiqueTroisRacines = (): Modele => {
  const k = choice([-1, -0.5, -0.25, 0.25, 0.5, 1])
  const racines = new Set<number>()
  while (racines.size < 3) racines.add(randint(-3, 3))
  const [r1, r2, r3] = [...racines]
  return {
    f: (x) => k * (x - r1) * (x - r2) * (x - r3),
    df: (x) =>
      k * ((x - r2) * (x - r3) + (x - r1) * (x - r3) + (x - r1) * (x - r2)),
    intervalles: toutLIntervalle,
    domaine: deriveeSurR,
    cle: `cubique${k};${r1};${r2};${r3}`,
  }
}

const racine = (): Modele => {
  const k = choice([-2, -1, 1, 2])
  const h = randint(-4, 1)
  const c = randint(-3, 3)
  return {
    f: (x) => k * Math.sqrt(x - h) + c,
    df: (x) => k / (2 * Math.sqrt(x - h)),
    intervalles: [[h, fenetre.xMax]],
    domaine: `définie sur $[${h}\\,;\\,+\\infty[$ et dérivable sur $]${h}\\,;\\,+\\infty[$`,
    cle: `racine${k};${h};${c}`,
  }
}

const inverse = (): Modele => {
  const k = choice([-4, -2, -1, 1, 2, 4])
  const h = randint(-2, 2)
  const c = randint(-2, 2)
  return {
    f: (x) => k / (x - h) + c,
    df: (x) => -k / (x - h) ** 2,
    intervalles: [
      [fenetre.xMin, h - 0.02],
      [h + 0.02, fenetre.xMax],
    ],
    domaine: `définie et dérivable sur $\\mathbb{R}\\setminus\\{${h}\\}$`,
    cle: `inverse${k};${h};${c}`,
  }
}

const exponentielle = (): Modele => {
  const k = choice([-3, -2, -1, 1, 2, 3])
  const sens = choice([-1, 1])
  const h = randint(-3, 3)
  const c = randint(-3, 2)
  return {
    f: (x) => k * Math.exp(sens * (x - h)) + c,
    df: (x) => sens * k * Math.exp(sens * (x - h)),
    intervalles: toutLIntervalle,
    domaine: deriveeSurR,
    cle: `exp${k};${sens};${h};${c}`,
  }
}

const logarithme = (fractionnaire: boolean): Modele => {
  // en x - h = 1, on a f(x) = c et f'(x) = k
  const k = fractionnaire
    ? choice([-1.5, -0.5, 0.5, 1.5])
    : choice([-3, -2, -1, 1, 2, 3])
  const h = randint(-4, 0)
  const c = randint(-3, 3)
  return {
    f: (x) => k * Math.log(x - h) + c,
    df: (x) => k / (x - h),
    intervalles: [[h + 0.005, fenetre.xMax]],
    domaine: `définie et dérivable sur $]${h}\\,;\\,+\\infty[$`,
    cle: `ln${k};${h};${c}`,
  }
}

const sinusoide = (): Modele => {
  const amplitude = choice([-3, -2, -1, 1, 2, 3])
  const demiPeriode = choice([2, 3, 4])
  const h = randint(-2, 2)
  const c = randint(-1, 1)
  const omega = Math.PI / demiPeriode
  return {
    f: (x) => amplitude * Math.cos(omega * (x - h)) + c,
    df: (x) => -amplitude * omega * Math.sin(omega * (x - h)),
    intervalles: toutLIntervalle,
    domaine: deriveeSurR,
    cle: `cos${amplitude};${demiPeriode};${h};${c}`,
  }
}

/**
 * Courbe « quelconque » : interpolation d'Hermite cubique passant par des points à coordonnées entières
 * (une abscisse sur deux) avec des pentes demi-entières imposées. Les pentes sont nulles aux extremums
 * et assez petites ailleurs pour que la courbe reste monotone entre deux points.
 */
const courbeQuelconque = (): Modele => {
  const pas = 2
  const xs = [-6, -4, -2, 0, 2, 4, 6]
  const ys = [randint(-3, 3)]
  while (ys.length < xs.length) {
    const precedent = ys[ys.length - 1]
    ys.push(
      Math.max(-4, Math.min(4, precedent + choice([-3, -2, -1, 0, 1, 2, 3]))),
    )
  }
  const pentes = ys.map((y, i) => {
    if (i === 0) return (ys[1] - y) / pas
    if (i === ys.length - 1) return (y - ys[i - 1]) / pas
    const avant = (y - ys[i - 1]) / pas
    const apres = (ys[i + 1] - y) / pas
    if (avant * apres <= 0) return 0
    const moyenne = Math.round(avant + apres) / 2
    const maximum = 3 * Math.min(Math.abs(avant), Math.abs(apres))
    return Math.sign(moyenne) * Math.min(Math.abs(moyenne), maximum)
  })
  const morceau = (x: number) => {
    const i = Math.min(
      Math.max(Math.floor((x - xs[0]) / pas), 0),
      xs.length - 2,
    )
    return { i, t: (x - xs[i]) / pas }
  }
  return {
    f: (x) => {
      const { i, t } = morceau(x)
      return (
        (2 * t ** 3 - 3 * t ** 2 + 1) * ys[i] +
        (t ** 3 - 2 * t ** 2 + t) * pas * pentes[i] +
        (-2 * t ** 3 + 3 * t ** 2) * ys[i + 1] +
        (t ** 3 - t ** 2) * pas * pentes[i + 1]
      )
    },
    df: (x) => {
      const { i, t } = morceau(x)
      return (
        ((6 * t ** 2 - 6 * t) * ys[i] +
          (3 * t ** 2 - 4 * t + 1) * pas * pentes[i] +
          (-6 * t ** 2 + 6 * t) * ys[i + 1] +
          (3 * t ** 2 - 2 * t) * pas * pentes[i + 1]) /
        pas
      )
    },
    intervalles: toutLIntervalle,
    abscisses: xs.slice(1, -1),
    domaine: deriveeSurR,
    cle: `quelconque${ys.join(',')};${pentes.join(',')}`,
  }
}

/** Familles de courbes, dans l'ordre du paramètre de l'exercice */
const familles: ((fractionnaire: boolean) => Modele)[] = [
  parabole,
  cube,
  cubiqueTroisRacines,
  racine,
  inverse,
  exponentielle,
  logarithme,
  sinusoide,
  courbeQuelconque,
]

/**
 * Numéros des familles (dans l'ordre de `familles`) qui offrent assez de points de tangence lisibles
 * pour tracer `nbTangentes` tangentes, avec un nombre dérivé entier ou fractionnaire. Les autres sont remplacées :
 * l'exponentielle et la fonction périodique n'ont aucun point de tangence à nombre dérivé fractionnaire,
 * et les autres familles en ont trop peu pour tracer plusieurs tangentes.
 */
const famillesCompatibles = (nbTangentes: number, fractionnaire: boolean) => {
  const compatibles: Record<string, number[]> = {
    entier1: familles.map((_, k) => k + 1),
    entier2: [1, 2, 3, 5, 8, 9],
    entier3: [1, 2, 3, 9],
    fractionnaire1: [1, 2, 3, 4, 5, 7, 9],
    fractionnaire2: [1, 2, 3, 4, 5, 9],
    fractionnaire3: [1, 3],
  }
  return compatibles[
    `${fractionnaire ? 'fractionnaire' : 'entier'}${nbTangentes}`
  ]
}

type Tirage = {
  modele: Modele
  a: number
  image: number
  /** Nombre dérivé en $a$ : entier ou fractionnaire (de dénominateur 2, 3 ou 4) */
  pente: number
  /** Dénominateur de la pente écrite sous forme de fraction irréductible */
  denominateur: number
  /** Second point entier de la tangente, à `denominateur` unités (vers la droite ou la gauche) de $A$ */
  b: { x: number; y: number }
}

const denominateurMax = 4

/** Plus petit dénominateur (au plus `denominateurMax`) qui permet d'écrire `x` en fraction, `undefined` sinon */
const denominateurDe = (x: number) =>
  Array.from({ length: denominateurMax }, (_, n) => n + 1).find(
    (q) => Math.abs(q * x - Math.round(q * x)) < tolerance,
  )

/** Second point entier de la tangente, à droite de $A$ si le repère le permet, sinon à gauche */
const secondPoint = (
  a: number,
  image: number,
  pente: number,
  denominateur: number,
) => {
  for (const sens of [1, -1]) {
    const x = a + sens * denominateur
    const y = Math.round(image + sens * denominateur * pente)
    if (Math.abs(x) <= 5 && Math.abs(y) <= 4) return { x, y }
  }
  return undefined
}

/**
 * Point de tangence lisible : coordonnées entières, pente entière (ou fractionnaire si `fractionnaire`)
 * et second point entier de la tangente dans le repère
 */
const pointsDeTangencePossibles = (
  modele: Modele,
  fractionnaire: boolean,
): Tirage[] => {
  const abscisses =
    modele.abscisses ?? Array.from({ length: 11 }, (_, n) => n - 5)
  const tirages: Tirage[] = []
  for (const a of abscisses) {
    const y = modele.f(a)
    const m = modele.df(a)
    if (!isFinite(y) || !isFinite(m)) continue
    if (Math.abs(y - Math.round(y)) > tolerance) continue
    const denominateur = denominateurDe(m)
    if (denominateur === undefined || Math.abs(m) > 3) continue
    if (denominateur > 1 !== fractionnaire) continue
    const image = Math.round(y)
    const pente = Math.round(m * denominateur) / denominateur + 0 // + 0 évite -0
    if (Math.abs(image) > 3) continue
    const b = secondPoint(a, image, pente, denominateur)
    if (b === undefined) continue
    tirages.push({ modele, a, image, pente, denominateur, b })
  }
  return tirages
}

/** Deux tirages définissent la même tangente (même pente, même ordonnée à l'origine) */
const memeDroite = (t1: Tirage, t2: Tirage) =>
  t1.pente === t2.pente &&
  t1.image - t1.pente * t1.a === t2.image - t2.pente * t2.a

const ecriturePente = (pente: number, denominateur: number) =>
  denominateur === 1
    ? texNombre(pente)
    : `${pente < 0 ? '-' : ''}\\dfrac{${Math.abs(Math.round(pente * denominateur))}}{${denominateur}}`

const fractionPente = (dy: number, dx: number) => `\\dfrac{${dy}}{${dx}}`

/** Côté du point `(x ; y)` de la tangente où ne pas poser une étiquette : celui où se trouve la courbe (+1 : au-dessus, −1 : en dessous) */
const coteDeLaCourbe = (
  f: (x: number) => number,
  tangente: (x: number) => number,
  x: number,
) => {
  const ecart = (xx: number) => f(xx) - tangente(xx)
  const valeurs = [
    ecart(x - 0.5) + ecart(x + 0.5),
    ecart(x + 0.5),
    ecart(x - 0.5),
  ]
  const valeur = valeurs.find((v) => isFinite(v) && Math.abs(v) > 1e-6)
  return valeur === undefined || valeur > 0 ? 1 : -1
}

export default class LireNombreDeriveGraphiquement extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 3
    this.nbCols = 1
    this.nbColsCorr = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Type de courbe',
      [
        'Nombres séparés par des tirets :',
        '1 : Parabole',
        '2 : Fonction cube',
        '3 : Polynôme de degré 3 à trois racines',
        '4 : Fonction racine carrée',
        '5 : Fonction inverse',
        '6 : Fonction exponentielle',
        '7 : Fonction logarithme',
        '8 : Fonction périodique',
        '9 : Courbe quelconque',
        '10 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de tangentes',
      3,
      '1 : Une tangente\n2 : Deux tangentes\n3 : Trois tangentes',
    ]
    this.sup = '10'
    this.besoinFormulaire3Numerique = [
      'Nombre dérivé',
      2,
      '1 : Entier\n2 : Fractionnaire',
    ]
    this.sup2 = 1
    this.sup3 = 1
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: familles.length,
      melange: familles.length + 1,
      defaut: familles.length + 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const nbTangentes = Math.min(Math.max(Number(this.sup2) || 1, 1), 3)
    const fractionnaire = Number(this.sup3) === 2
    const compatibles = famillesCompatibles(nbTangentes, fractionnaire)
    const listeTypes = combinaisonListes(types, this.nbQuestions).map((type) =>
      compatibles.includes(type) ? type : choice(compatibles),
    )

    // Avec plusieurs tangentes, on exige d'abord des pentes toutes différentes (donc des réponses différentes) ;
    // si aucune courbe tirée ne s'y prête (fonction cube, par exemple), on relâche peu à peu cette exigence.
    const exigences: ((t: Tirage, p: Tirage) => boolean)[][] = [
      [(t, p) => t.pente !== p.pente, (t, p) => Math.abs(t.a - p.a) >= 2],
      [(t, p) => !memeDroite(t, p), (t, p) => Math.abs(t.a - p.a) >= 2],
      [(t, p) => !memeDroite(t, p)],
    ]
    const nbEssais = nbTangentes === 1 ? 100 : 100 * exigences.length

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < nbEssais; cpt++) {
      const possibles = pointsDeTangencePossibles(
        familles[listeTypes[i] - 1](fractionnaire),
        fractionnaire,
      )
      if (possibles.length === 0) continue
      // Le premier tirage est le seul quand il n'y a qu'une tangente : il ne dépend pas du nombre de tangentes.
      // Les tangentes suivantes sont prises à au moins deux unités des précédentes pour rester lisibles.
      const tirages = [choice(possibles)]
      const criteres = exigences[Math.floor(cpt / 100)] ?? exigences[0]
      while (tirages.length < nbTangentes) {
        const autres = possibles.filter((p) =>
          tirages.every((t) => criteres.every((critere) => critere(t, p))),
        )
        if (autres.length === 0) break
        tirages.push(choice(autres))
      }
      if (tirages.length < nbTangentes) continue
      // Les points A et B de toutes les tangentes sont deux à deux distincts, pour que les étiquettes ne se superposent pas
      const points = new Set(
        tirages.flatMap((t) => [`${t.a};${t.image}`, `${t.b.x};${t.b.y}`]),
      )
      if (points.size < 2 * nbTangentes) continue
      tirages.sort((t1, t2) => t1.a - t2.a)
      const { modele } = tirages[0]
      const { f, df } = modele
      const tangentes = tirages.map((t) => ({
        ...t,
        fonction: (x: number) => t.pente * (x - t.a) + t.image,
      }))
      if (tangentes.some((t) => Math.abs(df(t.a) - t.pente) > tolerance))
        continue

      /** Nom d'un objet de la figure : indexé quand il y a plusieurs tangentes */
      const nom = (lettre: string, k: number) =>
        nbTangentes === 1 ? lettre : `${lettre}_${k + 1}`

      const r = repere({
        ...fenetre,
        grille: true,
        grilleSecondaire: false,
        thickHauteur: 0.1,
        axeXStyle: '->',
        axeYStyle: '->',
      })
      const courbes = intervallesDansLaFenetre(
        f,
        modele.intervalles,
        fenetre.yMin,
        fenetre.yMax,
      ).map(([xMin, xMax]) =>
        courbe(f, {
          repere: r,
          xMin,
          xMax,
          yMin: fenetre.yMin,
          yMax: fenetre.yMax,
          color: bleuMathalea,
          epaisseur: 2,
          step: 0.05,
        }),
      )
      const marque = (x: number, y: number) => {
        const p = tracePoint(pointAbstrait(x, y), 'black')
        p.taille = 6
        p.epaisseur = 2
        return p
      }
      /** Étiquette d'un point de la tangente, placée du côté opposé à la courbe */
      const etiquette = (
        nomPoint: string,
        x: number,
        y: number,
        t: (typeof tangentes)[number],
      ) => {
        const cote = -coteDeLaCourbe(f, t.fonction, x)
        const norme = Math.sqrt(1 + t.pente ** 2)
        return texteParPosition(
          `$${nomPoint}$`,
          x - (cote * t.pente * 0.5) / norme,
          y + (cote * 0.5) / norme,
          0,
          'black',
          1,
        )
      }
      const abscissesDesPoints = tangentes.flatMap((t) => [t.a, t.b.x])
      const objetsEnonce: ObjetMathalea2D[] = [r, ...courbes]
      tangentes.forEach((t, k) => {
        const { a, image, pente } = t
        objetsEnonce.push(
          courbe(t.fonction, {
            repere: r,
            ...fenetre,
            color: 'red',
            epaisseur: 1.5,
          }),
          marque(a, image),
          etiquette(nom('A', k), a, image, t),
        )
        // Le nom de la tangente est placé sur une portion visible de T, le plus loin possible de A et de B
        const positionsNomTangente = [1, -1].flatMap((sens) =>
          Array.from({ length: 100 }, (_, n) => ({
            sens,
            x:
              (sens > 0 ? fenetre.xMax : fenetre.xMin) - sens * (0.5 + n * 0.1),
          })).filter(({ x }) => Math.abs(t.fonction(x)) <= fenetre.yMax - 0.8),
        )
        const ecartAuxPoints = (x: number) =>
          Math.min(2, ...abscissesDesPoints.map((xp) => Math.abs(x - xp)))
        const xT = positionsNomTangente.reduce(
          (meilleure, position) =>
            ecartAuxPoints(position.x) > ecartAuxPoints(meilleure.x)
              ? position
              : meilleure,
          positionsNomTangente[0],
        )
        objetsEnonce.push(
          texteParPosition(
            `$${nom('T', k)}$`,
            xT.x + xT.sens * 0.3,
            t.fonction(xT.x) + (pente * xT.sens >= 0 ? 0.3 : -0.3),
            0,
            'red',
            1,
          ),
        )
      })
      const dessiner = (objets: ObjetMathalea2D[]) =>
        mathalea2d(
          Object.assign(
            { pixelsParCm: 30, scale: 0.6, style: 'margin: auto' },
            fixeBordures(objets),
            { center: !context.isHtml },
          ),
          objets,
        )

      // Triangles de pente en pointillés : un déplacement horizontal puis un déplacement vertical, de A à B
      const objetsCorrection = [...objetsEnonce]
      tangentes.forEach((t, k) => {
        const { a, image, b } = t
        const dx = b.x - a
        const dy = b.y - image
        const horizontal = segment(a, image, b.x, image, vertMathalea)
        const pointilles = [horizontal]
        // Pente non nulle : le déplacement horizontal est écrit à l'extérieur du triangle ; sinon, du côté de la courbe,
        // les étiquettes A et B étant du côté opposé
        const ecartLabelHorizontal =
          dy === 0
            ? 0.45 * coteDeLaCourbe(f, t.fonction, a)
            : dy > 0
              ? -0.4
              : 0.4
        objetsCorrection.push(
          horizontal,
          marque(b.x, b.y),
          etiquette(nom('B', k), b.x, b.y, t),
          texteParPosition(
            `$${ecritureAlgebrique(dx)}$`,
            (a + b.x) / 2,
            image + ecartLabelHorizontal,
            0,
            vertMathalea,
            1,
          ),
          texteParPosition(
            `$${dy === 0 ? 0 : ecritureAlgebrique(dy)}$`,
            b.x + Math.sign(dx) * 0.6,
            dy === 0 ? image + ecartLabelHorizontal : (image + b.y) / 2,
            0,
            vertMathalea,
            1,
          ),
        )
        if (dy !== 0) {
          const vertical = segment(b.x, image, b.x, b.y, vertMathalea)
          pointilles.push(vertical)
          objetsCorrection.push(vertical)
        }
        for (const s of pointilles) {
          s.pointilles = 2
          s.epaisseur = 3
        }
      })

      const deplacement = (valeur: number, positif: string, negatif: string) =>
        `$${Math.abs(valeur)}$ ${Math.abs(valeur) > 1 ? 'unités' : 'unité'} vers ${valeur > 0 ? positif : negatif}`
      /** Raisonnement et réponse pour la tangente d'indice `k` */
      const resolution = (t: (typeof tangentes)[number], k: number) => {
        const { a, image, pente, b } = t
        const dx = b.x - a
        const dy = b.y - image
        const reponse = ecriturePente(pente, t.denominateur)
        const deplacementVertical =
          dy === 0
            ? 'sans monter ni descendre'
            : `puis de ${deplacement(dy, 'le haut', 'le bas')}`
        return (
          texteEnCouleur(
            `La tangente $${nom('T', k)}$ passe par $${nom('A', k)}(${a}\\,;\\,${image})$ et par le point $${nom('B', k)}(${b.x}\\,;\\,${b.y})$, de coordonnées entières.<br>
Pour aller de $${nom('A', k)}$ à $${nom('B', k)}$, on se déplace de ${deplacement(dx, 'la droite', 'la gauche')}, ${deplacementVertical} (pointillés verts).<br>
Le coefficient directeur de $${nom('T', k)}$ est donc $\\dfrac{y_{${nom('B', k)}}-y_{${nom('A', k)}}}{x_{${nom('B', k)}}-x_{${nom('A', k)}}}=${fractionPente(dy, dx)}$, soit $${ecriturePente(pente, t.denominateur)}$.<br>`,
            bleuMathalea,
          ) + `Ainsi, $f'(${a})=${miseEnEvidence(reponse)}$.`
        )
      }

      const noms = (lettre: string) =>
        tangentes.map((_, k) => `$${nom(lettre, k)}$`)
      const enumeration = (elements: string[]) =>
        elements.length === 1
          ? elements[0]
          : `${elements.slice(0, -1).join(', ')} et ${elements[elements.length - 1]}`
      const unique = nbTangentes === 1
      const enonce = `On a tracé ci-dessous la courbe $\\mathcal{C}_f$ (en bleu) d'une fonction $f$ ${modele.domaine} et ${
        unique
          ? `la tangente $T$ (en rouge) à $\\mathcal{C}_f$ au point $A$ d'abscisse $${tangentes[0].a}$`
          : `les tangentes ${enumeration(noms('T'))} (en rouge) à $\\mathcal{C}_f$ aux points ${enumeration(noms('A'))} d'abscisses respectives ${enumeration(tangentes.map((t) => `$${t.a}$`))}`
      }.<br>
${unique ? 'La tangente passe' : 'Chaque tangente passe'} par des points de coordonnées entières.<br>
${dessiner(objetsEnonce)}`
      const explicationNombreDerive = texteEnCouleur(
        unique
          ? `Le nombre dérivé $f'(${tangentes[0].a})$ est le coefficient directeur de la tangente $T$ à $\\mathcal{C}_f$ au point $A$ d'abscisse $${tangentes[0].a}$.<br>`
          : `Un nombre dérivé $f'(a)$ est le coefficient directeur de la tangente à $\\mathcal{C}_f$ au point d'abscisse $a$.<br>`,
        bleuMathalea,
      )

      if (
        !this.questionJamaisPosee(i, modele.cle, ...tangentes.map((t) => t.a))
      ) {
        continue
      }
      if (unique) {
        const { a, pente, denominateur } = tangentes[0]
        createQuestion(this, i, {
          question: `${enonce}Déterminer, par lecture graphique, $f'(${a})$.`,
          correction: `${explicationNombreDerive}${resolution(tangentes[0], 0)}<br>${dessiner(objetsCorrection)}`,
          answer: { value: ecriturePente(pente, denominateur) },
          field: {
            keyboard: KeyboardType.clavierDeBaseAvecFraction,
            texteAvant: `<br>$f'(${a})=$`,
            texteApres: '.',
          },
        })
      } else {
        createQuestion(this, i, {
          question: `${enonce}Déterminer, par lecture graphique, les nombres dérivés suivants.`,
          correction: `${explicationNombreDerive}${dessiner(objetsCorrection)}`,
          subQuestions: tangentes.map((t, k) => ({
            question: `$f'(${t.a})=$`,
            answer: { value: ecriturePente(t.pente, t.denominateur) },
            field: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
            correction: resolution(t, k),
          })),
        })
      }
      i++
      cpt = -1 // le budget d'essais est renouvelé pour chaque question (cpt++ le ramène à 0)
    }
    listeQuestionsToContenu(this)
  }
}
