import Figure from 'apigeom'
import checkRay from 'apigeom/src/check/checkRay'
import { arc } from '../../lib/2d/Arc'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d, texteParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Représenter l'ensemble des points dont l'affixe a un argument donné"
export const interactifReady = true
export const dateDePublication = '30/10/2026'
export const uuid = 'e2e24'
export const refs = {
  'fr-fr': ['TEC2-34'],
  'fr-ch': [],
}

/** Arguments (dans ]-π ; π]) par famille d'angles : écriture LaTeX et mesure en degrés. */
const anglesParType: {
  arg: string
  deg: number
  /** Vecteur directeur à coordonnées entières (direction passant par des nœuds de la grille). */
  dir: [number, number]
}[][] = [
  [
    { arg: '0', deg: 0, dir: [1, 0] },
    { arg: '\\dfrac{\\pi}{2}', deg: 90, dir: [0, 1] },
    { arg: '\\pi', deg: 180, dir: [-1, 0] },
    { arg: '-\\dfrac{\\pi}{2}', deg: -90, dir: [0, -1] },
  ],
  [
    { arg: '\\dfrac{\\pi}{4}', deg: 45, dir: [1, 1] },
    { arg: '\\dfrac{3\\pi}{4}', deg: 135, dir: [-1, 1] },
    { arg: '-\\dfrac{\\pi}{4}', deg: -45, dir: [1, -1] },
    { arg: '-\\dfrac{3\\pi}{4}', deg: -135, dir: [-1, -1] },
  ],
]

/** Écriture de `z - (a + ib)` : `z+2`, `z-1+3\mathrm{i}`, `z-2\mathrm{i}`… */
function ecritureZMoins(a: number, b: number): string {
  const signe = (n: number) => (n < 0 ? '-' : '+')
  const partieImaginaire = (n: number) =>
    `${signe(n)}${Math.abs(n) === 1 ? '' : Math.abs(n)}\\mathrm{i}`
  const partieReelle = a === 0 ? '' : `${signe(-a)}${Math.abs(a)}`
  const partieIm = b === 0 ? '' : partieImaginaire(-b)
  return `z${partieReelle}${partieIm}`
}

/** Écriture de l'affixe `a + ib` (a et b entiers). */
function ecritureAffixe(a: number, b: number): string {
  if (b === 0) return `${a}`
  const im = `${Math.abs(b) === 1 ? '' : Math.abs(b)}\\mathrm{i}`
  if (a === 0) return b < 0 ? `-${im}` : im
  return `${a}${b < 0 ? '-' : '+'}${im}`
}

/**
 * Représenter l'ensemble des points M d'affixe z tels que arg(z − zA) = θ (2π) :
 * demi-droite d'origine A privée de A.
 * Randomisation de « Représenter l'ensemble E des points M d'affixe z tels que
 * arg(z + 2) = −π/2 (2π) ».
 * @author Stéphane Guyon
 */
export default class EnsembleArgumentDonne extends Exercice {
  declare sup: boolean

  /** Pour chaque question : origine de la demi-droite et vecteur directeur attendus. */
  attendus: { a: number; b: number; dir: [number, number] }[] = []

  constructor() {
    super()
    this.nbQuestions = 1
    this.exoCustomResultat = true
    this.besoinFormulaireCaseACocher = [
      "Afficher le repère dans l'énoncé (hors interactivité)",
    ]
    this.sup = true
  }

  nouvelleVersion(): void {
    this.figuresApiGeom = []
    this.attendus = []
    const angles = anglesParType.flat()
    const limite = 5

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const angle = angles[randint(0, angles.length - 1)]
      // A a pour affixe a + ib ; sur une question sur deux, A est sur un axe
      const a = i % 2 === 0 ? randint(-3, 3, [0]) : randint(-3, 3)
      const b = randint(-3, 3, [0]) * (i % 2 === 0 ? 0 : 1)
      if (!this.questionJamaisPosee(i, a, b, angle.deg)) continue

      const expression = ecritureZMoins(a, b)
      const affixeA = ecritureAffixe(a, b)
      const affixeAParentheses = b === 0 && a > 0 ? affixeA : `(${affixeA})`
      const texte = `On considère un nombre complexe $z$.<br>Dans le plan complexe muni d'un repère orthonormé direct $\\left(O\\,;\\ \\overrightarrow{u}\\,;\\ \\overrightarrow{v}\\right)$, représenter l'ensemble $\\mathcal{E}$ des points $M$ d'affixe $z$ tels que $\\arg\\left(${expression}\\right)=${angle.arg}\\quad (2\\pi)$.`

      const O = pointAbstrait(0, 0, 'O')
      const A = pointAbstrait(a, b, 'A')
      const u = (x: number, y: number) => {
        const s = segment(O, pointAbstrait(x, y), 'black', '->')
        s.epaisseur = 1.5
        s.tailleExtremites = 8
        return s
      }
      const cos = Math.cos((angle.deg * Math.PI) / 180)
      const sin = Math.sin((angle.deg * Math.PI) / 180)
      // Longueur de la demi-droite jusqu'au bord du repère
      const bornes = [
        Math.abs(cos) > 1e-9
          ? ((cos > 0 ? limite : -limite) - a) / cos
          : Infinity,
        Math.abs(sin) > 1e-9
          ? ((sin > 0 ? limite : -limite) - b) / sin
          : Infinity,
      ]
      const longueur = Math.min(...bornes)
      const extremite = pointAbstrait(a + longueur * cos, b + longueur * sin)
      const demiDroite = segment(A, extremite, 'red')
      demiDroite.epaisseur = 3
      const horizontale = segment(A, pointAbstrait(a + 1.2, b), 'black')
      horizontale.pointilles = 2
      const pointA = tracePoint(A, 'red')
      pointA.style = 'o'
      pointA.taille = 4
      const rayonArc = 0.9
      const objetsAngle =
        angle.deg === 0
          ? []
          : [
              arc(
                pointAbstrait(a + rayonArc, b),
                A,
                angle.deg,
                false,
                'none',
                'blue',
              ),
            ]
      const demi = (angle.deg === 0 ? 0 : angle.deg / 2) * (Math.PI / 180)
      const rayonMesure = Math.abs(angle.deg) <= 45 ? 1.9 : 1.6
      const mesure = latex2d(
        angle.arg,
        a + rayonMesure * Math.cos(demi || 0.45),
        b + rayonMesure * Math.sin(demi || 0.45),
        { color: 'blue', letterSize: 'small' },
      )
      const graduations = Array.from(
        { length: 2 * limite + 1 },
        (_, k) => k - limite,
      ).filter((n) => n !== 0)
      const dessiner = (objets: Parameters<typeof mathalea2d>[1][]) =>
        mathalea2d(
          {
            xmin: -limite - 1,
            xmax: limite + 1,
            ymin: -limite - 1,
            ymax: limite + 1,
            scale: 0.6,
            zoom: 1.3,
          },
          repere({
            xMin: -limite,
            xMax: limite,
            yMin: -limite,
            yMax: limite,
            grille: true,
            grilleDistance: 1,
            grilleCouleur: bleuMathalea,
            grilleOpacite: 0.3,
            xLabelListe: graduations,
            yLabelListe: graduations,
          }),
          u(1, 0),
          u(0, 1),
          latex2d('\\overrightarrow{u}', 0.5, -0.4, {}),
          latex2d('\\overrightarrow{v}', -0.4, 0.5, {}),
          latex2d('O', -0.3, -0.45, {}),
          ...objets,
        )
      const repereVierge = dessiner([])
      const figure = dessiner([
        horizontale,
        ...objetsAngle,
        mesure,
        demiDroite,
        pointA,
        texteParPoint(
          'A',
          pointAbstrait(a - 0.4, b + (sin > 0.5 ? -0.5 : 0.5)),
          0,
          'red',
          1,
          'milieu',
          true,
        ),
      ])

      const texteCorr = `Soit $A$ le point d'affixe $${affixeA}$ et $M$ un point d'affixe $z$, avec $M\\neq A$.<br>
Alors $z-${affixeAParentheses}$ est l'affixe du vecteur $\\overrightarrow{AM}$, donc $\\arg\\left(${expression}\\right)$ est une mesure de l'angle orienté $\\left(\\overrightarrow{u}\\,;\\,\\overrightarrow{AM}\\right)$.<br>
Dire que $\\left(\\overrightarrow{u}\\,;\\,\\overrightarrow{AM}\\right)=${angle.arg}\\quad (2\\pi)$ signifie que $M$ appartient à la demi-droite d'origine $A$ dirigée par ce même angle avec $\\overrightarrow{u}$.<br>
$\\mathcal{E}$ est la demi-droite d'origine $A$ privée du point $A$ (tracée en rouge ci-dessous).<br>${figure}`

      if (this.interactif) {
        this.attendus[i] = { a, b, dir: angle.dir }
        const unite = (30 * 6) / limite
        const figureEleve = new Figure({
          xMin: -limite - 0.5,
          yMin: -limite - 0.5,
          pixelsPerUnit: unite,
          width: (2 * limite + 1) * unite,
          height: (2 * limite + 1) * unite,
          border: false,
          scale: 0.65,
        })
        figureEleve.create('Grid', {
          strokeWidthGrid: 1,
          color: 'black',
          xMin: -limite,
          xMax: limite,
          yMin: -limite,
          yMax: limite,
          axeX: true,
          axeY: true,
          labelX: true,
          labelY: true,
        })
        const origine = figureEleve.create('Point', {
          x: 0,
          y: 0,
          isVisible: false,
          isSelectable: false,
          isDeletable: false,
        })
        for (const [x, y] of [
          [1, 0],
          [0, 1],
        ]) {
          const extremiteVecteur = figureEleve.create('Point', {
            x,
            y,
            isVisible: false,
            isSelectable: false,
            isDeletable: false,
          })
          figureEleve.create('Segment', {
            point1: origine,
            point2: extremiteVecteur,
            shape: '->',
            color: 'black',
            thickness: 1,
            borderSize: 0.1,
            isSelectable: false,
            isDeletable: false,
          })
        }
        for (const [t, x, y, ancre] of [
          ['$O$', -0.3, -0.3, 'topRight'],
          ['$\\overrightarrow{u}$', 0.5, -0.1, 'topCenter'],
          ['$\\overrightarrow{v}$', -0.1, 0.5, 'middleRight'],
        ] as const) {
          figureEleve.create('TextByPosition', {
            text: t,
            x,
            y,
            anchor: ancre,
            color: 'black',
            fontSize: '0.8em',
            isSelectable: false,
            isDeletable: false,
          })
        }
        for (const element of figureEleve.elements.values()) {
          const t = element as {
            type?: string
            text?: string
            isVisible?: boolean
          }
          if (t.type === 'TextByPosition' && t.text === '$0$')
            t.isVisible = false
        }
        figureEleve.snapGrid = true
        figureEleve.options.color = 'blue' // Ne pas mettre bleuMathalea avec apigeom
        figureEleve.setToolbar({
          tools: ['RAY', 'POINT', 'DRAG', 'REMOVE', 'UNDO', 'REDO'],
          position: 'top',
        })
        this.figuresApiGeom[i] = figureEleve
        const figureInteractive = figureApigeom({
          exercice: this,
          i,
          figure: figureEleve,
          defaultAction: 'RAY',
        })
        this.listeQuestions[i] =
          `${texte}<br>Tracer sur la figure la demi-droite qui représente $\\mathcal{E}$.${figureInteractive}`
      } else {
        this.listeQuestions[i] = this.sup
          ? `${texte}<br>${repereVierge}`
          : texte
      }
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }

  /** 1 point si la demi-droite tracée a pour origine A et la bonne direction. */
  correctionInteractive = (i: number) => {
    if (this.answers == null) this.answers = {}
    const figure = this.figuresApiGeom![i]
    this.answers[figure.id] = figureAnswerJson(figure)
    const { a, b, dir } = this.attendus[i]
    const { isValid } = checkRay({
      figure,
      point1: { x: a, y: b },
      point2: { x: a + dir[0], y: b + dir[1] },
    })
    let message = 'La demi-droite a bien été tracée.'
    if (!isValid) {
      // Diagnostic : une demi-droite a-t-elle la bonne origine ? la bonne direction ?
      const demiDroites = [...figure.elements.values()].filter(
        (e) => e.type === 'Ray',
      ) as unknown as {
        point1: { x: number; y: number }
        point2: { x: number; y: number }
      }[]
      const bonneOrigine = demiDroites.some(
        (r) =>
          Math.abs(r.point1.x - a) < 1e-6 && Math.abs(r.point1.y - b) < 1e-6,
      )
      const bonneDirection = demiDroites.some((r) => {
        const dx = r.point2.x - r.point1.x
        const dy = r.point2.y - r.point1.y
        return (
          Math.abs(dx * dir[1] - dy * dir[0]) < 1e-6 &&
          dx * dir[0] + dy * dir[1] > 0
        )
      })
      if (demiDroites.length === 0)
        message = "Aucune demi-droite n'a été tracée."
      else if (bonneOrigine)
        message = "L'origine est correcte, mais la direction est fausse."
      else if (bonneDirection)
        message =
          "La direction est correcte, mais l'origine n'est pas la bonne."
      else message = "L'origine et la direction de la demi-droite sont fausses."
    }
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    if (divFeedback != null)
      divFeedback.innerHTML = `${isValid ? '😎' : '☹️'} ${message}`
    figure.isDynamic = false
    return isValid ? 'OK' : 'KO'
  }
}
