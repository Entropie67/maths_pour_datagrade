import { bleuMathalea } from '../../lib/colors'
import { cercleCentrePoint } from '../../lib/2d/cercle'
import { grille } from '../../lib/2d/Grille'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latexParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { seq, sameTrigonometricForm } from '../../lib/interactif/checks'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer la forme trigonométrique d’un point du plan complexe'
export const interactifReady = true
export const dateDePublication = '31/10/2026'
export const uuid = 'e2bb3'
export const refs = {
  'fr-fr': ['TEC2-46'],
  'fr-ch': [],
}

/** Les quatre façons de repérer un point sur la figure. */
type TypePoint = 'axe' | 'diagonale' | 'abscisse' | 'ordonnee'

/** Un point du cercle : argument k×π/12, lettre et façon de le repérer. */
type PointCercle = { type: TypePoint; k: number; lettre: string }

const TYPES: TypePoint[] = ['axe', 'diagonale', 'abscisse', 'ordonnee']

/** Arguments (en douzièmes de π) possibles pour chaque type et chaque rayon. */
function argumentsPossibles(type: TypePoint, r: number): number[] {
  if (type === 'axe') return [0, 6, 12, -6]
  if (type === 'diagonale') return r >= 2 ? [3, -3, 9, -9] : []
  if (type === 'abscisse') return r === 2 || r === 4 ? [4, -4, 8, -8] : []
  return r === 2 || r === 4 ? [2, -2, 10, -10] : []
}

/** Distance entre deux points du cercle d'arguments k1 et k2 (en π/12). */
function distanceEntre(r: number, k1: number, k2: number): number {
  const ecart = Math.abs(k1 - k2) % 24
  return 2 * r * Math.sin((Math.min(ecart, 24 - ecart) * Math.PI) / 24)
}

/**
 * Points d'un même cercle, de types variés, bien distincts : deux points sont
 * toujours à plus d'une unité et demie l'un de l'autre.
 */
function choisisPoints(
  r: number,
  nbPoints: number,
): Omit<PointCercle, 'lettre'>[] {
  let points: Omit<PointCercle, 'lettre'>[] = []
  for (let essai = 0; essai < 500; essai++) {
    const parType = new Map(
      TYPES.map(
        (type) => [type, shuffle(argumentsPossibles(type, r))] as const,
      ),
    )
    const ordre = shuffle(TYPES.filter((type) => parType.get(type)!.length > 0))
    points = []
    while (points.length < nbPoints) {
      for (const type of ordre) {
        const k = parType.get(type)!.shift()
        if (k != null && points.length < nbPoints) points.push({ type, k })
      }
    }
    const distincts = points.every((p, j) =>
      points.every((q, l) => l <= j || distanceEntre(r, p.k, q.k) >= 1.5),
    )
    if (distincts) break
  }
  return points
}

/** « A », « A et B », « A, B et C ». */
const enumeration = (items: string[]) =>
  items.length === 1
    ? items[0]
    : `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`

/** Argument en douzièmes de π, ramené dans ]-π ; π], en LaTeX. */
function texArgument(k: number): string {
  if (k === 0) return '0'
  const pgcd = (a: number, b: number): number => (b === 0 ? a : pgcd(b, a % b))
  const g = pgcd(Math.abs(k), 12)
  const p = k / g
  const q = 12 / g
  const numerateur = Math.abs(p) === 1 ? '\\pi' : `${Math.abs(p)}\\pi`
  const signe = p < 0 ? '-' : ''
  return q === 1
    ? `${signe}${numerateur}`
    : `${signe}\\dfrac{${numerateur}}{${q}}`
}

/** Cosinus ou sinus exact (valeurs 0, ±1, ±1/2) en LaTeX. */
function texDemi(n: number): string {
  if (n === 0) return '0'
  const signe = n < 0 ? '-' : ''
  return Math.abs(n) === 2 ? `${signe}1` : `${signe}\\dfrac{1}{2}`
}

/**
 * Figure : plan complexe, cercle de centre O passant par les points, et
 * pointillés vers l'axe qui sert à lire l'argument d'un point.
 */
function figure(r: number, points: PointCercle[]): string {
  const O = pointAbstrait(0, 0)
  const coordonnees = points.map(({ k }) => ({
    x: Math.round(r * Math.cos((k * Math.PI) / 12) * 1e6) / 1e6,
    y: Math.round(r * Math.sin((k * Math.PI) / 12) * 1e6) / 1e6,
  }))
  // Repère juste assez grand pour le cercle, figure agrandie en conséquence.
  const bord = r + 1
  const objets: ObjetMathalea2D[] = [
    grille(-bord, -bord, bord, bord, 'gray', 0.4, 1),
  ]
  const etiquette = (
    texte: string,
    xe: number,
    ye: number,
    couleur = 'black',
    taille = 6,
  ) =>
    latexParPoint(
      texte,
      pointAbstrait(xe, ye, '', 'center'),
      couleur,
      30,
      12,
      '',
      taille,
    )

  if (points.some((p) => p.type === 'diagonale')) {
    objets.push(
      segment(pointAbstrait(-bord, -bord), pointAbstrait(bord, bord), 'black'),
      segment(pointAbstrait(-bord, bord), pointAbstrait(bord, -bord), 'black'),
      etiquette('y=x', bord - 0.8, bord - 0.3),
      etiquette('y=-x', -bord + 1, bord - 0.3),
    )
  }
  objets.push(
    segment(
      pointAbstrait(-bord - 0.3, 0),
      pointAbstrait(bord + 0.3, 0),
      'black',
      '->',
    ),
    segment(
      pointAbstrait(0, -bord - 0.3),
      pointAbstrait(0, bord + 0.3),
      'black',
      '->',
    ),
    etiquette('x', bord + 0.1, -0.5),
    etiquette('y', 0.5, bord + 0.1),
  )
  for (let n = -r; n <= r; n++) {
    if (n === 0) continue
    objets.push(
      etiquette(`${n}`, n, -0.45, 'gray'),
      etiquette(`${n}`, -0.5, n, 'gray'),
    )
  }
  objets.push(etiquette('O', -0.35, -0.35))

  const cercle = cercleCentrePoint(O, pointAbstrait(r, 0), bleuMathalea)
  cercle.epaisseur = 2
  objets.push(cercle)

  // Pointillés qui servent à lire un cosinus ou un sinus.
  const pointilles: [number, number, number, number][] = []
  points.forEach(({ type }, j) => {
    const { x, y } = coordonnees[j]
    if (type === 'abscisse') pointilles.push([x, y, x, 0])
    if (type === 'ordonnee') pointilles.push([x, y, 0, y])
  })
  for (const [ax, ay, bx, by] of pointilles) {
    const projection = segment(
      pointAbstrait(ax, ay),
      pointAbstrait(bx, by),
      bleuMathalea,
    )
    projection.pointilles = 5
    objets.push(projection)
  }
  for (const { x, y } of coordonnees) {
    const marque = tracePoint(pointAbstrait(x, y), 'red')
    marque.taille = 5
    marque.epaisseur = 2.5
    marque.opacite = 1
    objets.push(marque)
  }

  // Étiquettes placées là où elles ne touchent ni axe, ni cercle, ni droite,
  // ni pointillé, ni point, ni autre étiquette.
  const distanceSegment = (
    px: number,
    py: number,
    [ax, ay, bx, by]: [number, number, number, number],
  ) => {
    const t = Math.max(
      0,
      Math.min(
        1,
        ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) /
          ((bx - ax) ** 2 + (by - ay) ** 2),
      ),
    )
    return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)))
  }
  const placees: { px: number; py: number }[] = []
  const degage = (px: number, py: number) => {
    const distances = [
      Math.abs(px),
      Math.abs(py),
      Math.abs(Math.hypot(px, py) - r),
      bord - Math.abs(px),
      bord - Math.abs(py),
      ...coordonnees.map(({ x, y }) => Math.hypot(px - x, py - y)),
      ...placees.map((e) => Math.hypot(px - e.px, py - e.py)),
      ...pointilles.map((d) => distanceSegment(px, py, d)),
    ]
    if (points.some((p) => p.type === 'diagonale')) {
      distances.push(
        Math.abs(px - py) / Math.SQRT2,
        Math.abs(px + py) / Math.SQRT2,
      )
    }
    return Math.min(...distances)
  }
  points.forEach(({ lettre }, j) => {
    const { x, y } = coordonnees[j]
    let meilleur = { px: x + 0.6, py: y + 0.6, d: -Infinity }
    for (const rayon of [0.75, 0.9, 1.05]) {
      for (let a = 0; a < 360; a += 15) {
        const px = x + rayon * Math.cos((a * Math.PI) / 180)
        const py = y + rayon * Math.sin((a * Math.PI) / 180)
        // Le point lui-même ne compte pas : il est à `rayon` de l'étiquette.
        const d = Math.min(degage(px, py), 0.6)
        if (d > meilleur.d + 1e-9) meilleur = { px, py, d }
      }
    }
    placees.push(meilleur)
    objets.push(
      etiquette(`\\mathbf{${lettre}}`, meilleur.px, meilleur.py, 'red', 10),
    )
  })
  return mathalea2d(
    {
      xmin: -bord - 0.8,
      xmax: bord + 0.8,
      ymin: -bord - 0.8,
      ymax: bord + 0.8,
      scale: 8.1 / (2 * bord + 1.6),
    },
    ...objets,
  )
}

/** Forme trigonométrique attendue, d'argument k×π/12. */
const formeTrigo = (r: number, k: number) => {
  const theta = texArgument(k)
  return `${r}\\left(\\cos\\left(${theta}\\right)+\\mathrm{i}\\sin\\left(${theta}\\right)\\right)`
}

/** Lecture de l'argument d'un point sur la figure. */
function correctionArgument(r: number, { type, k, lettre }: PointCercle) {
  const theta = texArgument(k)
  const conclusion = `l'argument de $z_${lettre}$ dans $]-\\pi\\,;\\,\\pi]$ est $\\theta=${theta}$.`
  const x = Math.round(r * Math.cos((k * Math.PI) / 12) * 1e6) / 1e6
  const y = Math.round(r * Math.sin((k * Math.PI) / 12) * 1e6) / 1e6
  const cos2 = Math.round(2 * Math.cos((k * Math.PI) / 12))
  const sin2 = Math.round(2 * Math.sin((k * Math.PI) / 12))
  if (type === 'axe') {
    const lieu =
      k === 0
        ? "sur la demi-droite positive de l'axe des abscisses"
        : k === 12
          ? "sur la demi-droite négative de l'axe des abscisses"
          : k === 6
            ? "sur la demi-droite positive de l'axe des ordonnées"
            : "sur la demi-droite négative de l'axe des ordonnées"
    return `Le point $${lettre}$ est ${lieu}, donc ${conclusion}`
  }
  if (type === 'diagonale') {
    const quart = k > 0 ? 'au-dessus' : 'au-dessous'
    const cote = Math.abs(k) === 3 ? 'à droite' : 'à gauche'
    const droiteTex = k === 3 || k === -9 ? 'y=x' : 'y=-x'
    return `Le point $${lettre}$ est sur la droite d'équation $${droiteTex}$, ${quart} de l'axe des abscisses et ${cote} de l'axe des ordonnées.<br>
Cette droite est une bissectrice des axes, donc ${conclusion}`
  }
  if (type === 'abscisse') {
    const vertical = k > 0 ? 'au-dessus' : 'au-dessous'
    return `Le point $${lettre}$ a pour abscisse $${x}$ donc $\\cos(\\theta)=\\dfrac{${x}}{${r}}=${texDemi(cos2)}$.<br>
Comme $${lettre}$ est ${vertical} de l'axe des abscisses, ${conclusion}`
  }
  const horizontal = Math.abs(k) < 6 ? 'à droite' : 'à gauche'
  return `Le point $${lettre}$ a pour ordonnée $${y}$ donc $\\sin(\\theta)=\\dfrac{${y}}{${r}}=${texDemi(sin2)}$.<br>
Comme $${lettre}$ est ${horizontal} de l'axe des ordonnées, ${conclusion}`
}

/**
 * Déterminer la forme trigonométrique des affixes de points d'un même cercle
 * lus sur le plan complexe (axes, bissectrices, abscisse ou ordonnée
 * remarquable).
 * Randomisation de « Déterminer une forme trigonométrique des affixes des
 * points A, B, C, D, E et F représentés dans le plan complexe ci-contre ».
 * @author Stéphane Guyon
 */
export default class FormeTrigonometriqueSurFigure extends Exercice {
  declare sup: number
  declare sup2: number

  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
    this.besoinFormulaireNumerique = [
      'Type de formulaire pour la réponse en interactif',
      2,
      '1 : Formulaire pré-rempli\n2 : Formulaire vierge',
    ]
    this.sup = 1
    this.besoinFormulaire2Numerique = ['Nombre de points sur le cercle', 4]
    this.sup2 = 1
  }

  nouvelleVersion(): void {
    const saisieComplete = Number(this.sup) === 2
    const nbPoints = Math.max(
      1,
      Math.min(4, Math.round(Number(this.sup2)) || 1),
    )
    const consigneArgument = 'avec un argument dans $]-\\pi\\,;\\,\\pi]$'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const r = choice(nbPoints > 1 ? [2, 3, 4] : [1, 2, 3, 4])
      const choisis = choisisPoints(r, nbPoints)
      if (!this.questionJamaisPosee(i, r, ...choisis.map(({ k }) => k)))
        continue
      // Chaque question a sa figure : les points s'appellent toujours A, B, C…
      const lettresQuestion = [...'ABCD'].slice(0, nbPoints)
      const points: PointCercle[] = choisis.map((point, j) => ({
        ...point,
        lettre: lettresQuestion[j],
      }))
      const nomsPoints = enumeration(points.map((p) => `$${p.lettre}$`))
      const affixes = enumeration(points.map((p) => `$z_${p.lettre}$`))
      const moduleCorr =
        nbPoints === 1
          ? `Le point $${points[0].lettre}$ est sur le cercle de centre $O$ et de rayon $${r}$, donc $|z_${points[0].lettre}|=O${points[0].lettre}=${r}$.`
          : `Les points ${nomsPoints} sont sur le cercle de centre $O$ et de rayon $${r}$, donc leurs affixes ont pour module $${r}$.`
      const conclusion = ({ k, lettre }: PointCercle) =>
        `La forme trigonométrique de $z_${lettre}$ est donc $z_${lettre}=${miseEnEvidence(formeTrigo(r, k))}$.`
      const corrPoint = (p: PointCercle) =>
        `${correctionArgument(r, p)}<br>${conclusion(p)}`

      const intro =
        nbPoints === 1
          ? `Déterminer la forme trigonométrique de l'affixe $z_${points[0].lettre}$ du point $${points[0].lettre}$ représenté dans le plan complexe ci-dessous, ${consigneArgument}.`
          : `Déterminer la forme trigonométrique des affixes ${affixes} des points ${nomsPoints} représentés dans le plan complexe ci-dessous, ${consigneArgument}.`
      const texteDebut = `${intro}<br>${figure(r, points)}`

      if (saisieComplete && nbPoints > 1 && this.interactif) {
        createQuestion(this, i, {
          question: texteDebut,
          correction: `${moduleCorr}<br>`,
          subQuestions: points.map((p) => ({
            question: `$z_${p.lettre}=$ %{0}`,
            answer: {
              value: formeTrigo(r, p.k),
              compare: seq([sameTrigonometricForm()]),
            },
            field: { keyboard: KeyboardType.complexes },
            correction: corrPoint(p),
          })),
        })
      } else {
        let texte = texteDebut
        if (saisieComplete) {
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
              texteAvant: `<br>$z_${points[0].lettre}=$`,
            })
          }
          handleAnswers(this, i, {
            reponse: {
              value: formeTrigo(r, points[0].k),
              compare: seq([sameTrigonometricForm()]),
            },
          })
        } else {
          const lignes = points.map(
            (p, j) =>
              `z_${p.lettre}&=%{champ${3 * j + 1}}\\left(\\cos\\left(%{champ${3 * j + 2}}\\right)+\\mathrm{i}\\sin\\left(%{champ${3 * j + 3}}\\right)\\right)`,
          )
          if (this.interactif) {
            texte += `<br>${remplisLesBlancs(
              this,
              i,
              `\\begin{aligned}${lignes.join('\\\\')}\\end{aligned}`,
              KeyboardType.complexes,
            )}`
          }
          const reponses: Record<string, { value: string }> = {}
          points.forEach((p, j) => {
            reponses[`champ${3 * j + 1}`] = { value: `${r}` }
            reponses[`champ${3 * j + 2}`] = { value: texArgument(p.k) }
            reponses[`champ${3 * j + 3}`] = { value: texArgument(p.k) }
          })
          handleAnswers(this, i, reponses, {
            formatInteractif: 'fill-in-the-blank',
          })
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] =
          `${moduleCorr}<br>${points.map(corrPoint).join('<br>')}`
      }
      i++
    }
    listeQuestionsToContenu(this)
  }
}
