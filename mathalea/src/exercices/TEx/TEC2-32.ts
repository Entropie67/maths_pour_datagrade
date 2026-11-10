import Figure from 'apigeom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { arc } from '../../lib/2d/Arc'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { cercle } from '../../lib/2d/cercle'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { polygone } from '../../lib/2d/polygones'
import { point, type PointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { texteParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import figureApigeom from '../../lib/figureApigeom'
import { bleuMathalea } from '../../lib/colors'
import { lampeMessage } from '../../lib/format/message'
import { shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const interactifReady = true
export const titre =
  'Placer dans le plan complexe un point à partir de son module et de son argument'
export const dateDePublication = '30/10/2026'
export const uuid = 'b6180'
export const refs = { 'fr-fr': ['TEC2-32'], 'fr-ch': [] }

/** Écriture de k×π/4 sous forme simplifiée. */
const texArgument = (k: number): string => {
  if (k === 0) return '0'
  const signe = k < 0 ? '-' : ''
  const n = Math.abs(k)
  if (n === 4) return `${signe}\\pi`
  if (n === 2) return `${signe}\\dfrac{\\pi}{2}`
  return `${signe}\\dfrac{${n === 1 ? '' : n}\\pi}{4}`
}

/** Graduations de -5 à 5 sans le 0, qui est remplacé par la lettre O. */
const graduations = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]

/** Repère (grille de pas 1, de -6 à 6) avec les objets éventuels. */
const figureRepere = (scale: number, ...objets: NestedObjetMathalea2dArray) =>
  mathalea2d(
    {
      xmin: -6.5,
      xmax: 6.5,
      ymin: -6.5,
      ymax: 6.5,
      pixelsParCm: 30,
      scale,
    },
    repere({
      xMin: -6,
      xMax: 6,
      yMin: -6,
      yMax: 6,
      grille: true,
      grilleDistance: 1,
      grilleCouleur: 'gray',
      grilleOpacite: 0.4,
      xThickDistance: 1,
      yThickDistance: 1,
      xLabelListe: graduations,
      yLabelListe: graduations,
      xLegende: '',
      yLegende: '',
      axeXStyle: '->',
      axeYStyle: '->',
    }),
    segment(point(0, 0), point(1, 0), 'red', '->'),
    segment(point(0, 0), point(0, 1), 'red', '->'),
    texteParPoint('$O$', point(-0.3, -0.3), 0, 'black', 1, 'milieu', true),
    texteParPoint('$\\vec{u}$', point(0.5, -0.4), 0, 'red', 1, 'milieu', true),
    texteParPoint('$\\vec{v}$', point(-0.35, 0.5), 0, 'red', 1, 'milieu', true),
    ...objets,
  )

/** Demi-droite d'origine O dans la direction k×π/4, arrêtée au bord du repère. */
const demiDroiteJusquAuBord = (O: PointAbstrait, k: number, color: string) => {
  const angle = (k * Math.PI) / 4
  const t = 6.4 / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)))
  return segment(O, point(t * Math.cos(angle), t * Math.sin(angle)), color)
}

/**
 * Arc orienté de l'axe des abscisses jusqu'à l'argument k×π/4, muni d'une flèche et de sa mesure.
 * `rang` décale le rayon de l'arc pour que plusieurs arcs restent lisibles.
 */
const mesureOrientee = (k: number, rang: number) => {
  if (k === 0) return []
  const rayon = 1.3 + 0.35 * rang
  const theta = (k * Math.PI) / 4
  const sens = Math.sign(k)
  const O = point(0, 0)
  const debut = point(rayon, 0)
  const fin = point(rayon * Math.cos(theta), rayon * Math.sin(theta))
  // Flèche à l'extrémité de l'arc, dans le sens de rotation
  const tx = -sens * Math.sin(theta)
  const ty = sens * Math.cos(theta)
  const base = point(fin.x - 0.25 * tx, fin.y - 0.25 * ty)
  const pointe = polygone(
    [
      fin,
      point(base.x - 0.1 * ty, base.y + 0.1 * tx),
      point(base.x + 0.1 * ty, base.y - 0.1 * tx),
    ],
    bleuMathalea,
  )
  pointe.couleurDeRemplissage = colorToLatexOrHTML(bleuMathalea)
  pointe.opaciteDeRemplissage = 1
  // Étiquette au milieu de l'arc, jamais sur un axe (cas de l'angle plat, où le milieu est sur l'axe des ordonnées)
  const milieu = Math.abs(k) === 4 ? (sens * 3 * Math.PI) / 4 : theta / 2
  const rEtiquette = rayon + 0.8
  return [
    arc(debut, O, (k * 180) / 4, false, 'none', bleuMathalea),
    pointe,
    texteParPoint(
      `$${texArgument(k)}$`,
      point(rEtiquette * Math.cos(milieu), rEtiquette * Math.sin(milieu)),
      0,
      bleuMathalea,
      1,
      'milieu',
      true,
    ),
  ]
}

type PointPolaire = {
  nom: string
  k: number
  /** Module (entier). */
  m: number
  x: number
  y: number
}

/** Distance maximale (en unités) entre un point de l'élève et le point attendu (placement libre, coordonnées parfois irrationnelles). */
const tolerance = 0.25

/**
 * Placer des points du plan complexe à partir de leur module et de leur argument (multiple de π/4).
 * Les modules sont entiers ; les points d'argument impair ont des coordonnées irrationnelles, d'où une vérification à tolérance près.
 * @author Stéphane Guyon
 */
export default class PlacerPointsModuleArgument extends Exercice {
  /** Points à placer dans la figure de chaque question (nom et coordonnées). */
  pointsAttendus: { label: string; x: number; y: number }[][] = []

  /** Réponses attendues de chaque question, lues par `figureApigeom()` : le barème est le nombre de points à placer. */
  goodAnswers: { label: string; x: number; y: number }[][] = []

  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = ['Nombre de points à placer', 8]
    this.sup = 5
    this.besoinFormulaire2CaseACocher = [
      'Repère dans l’énoncé (non interactif)',
      true,
    ]
    this.sup2 = true
    this.exoCustomResultat = true
    this.reponseCourteDisponible = false // La réponse est une figure.
  }

  nouvelleVersion(): void {
    this.figuresApiGeom = []
    this.pointsAttendus = []
    this.goodAnswers = []
    const noms = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const nbPoints = Math.min(8, Math.max(1, Number(this.sup) || 5))
    for (let i = 0; i < this.nbQuestions; i++) {
      const ks = shuffle([-3, -2, -1, 0, 1, 2, 3, 4]).slice(0, nbPoints)
      const points: PointPolaire[] = ks.map((k, j) => {
        const m = randint(1, 5)
        const angle = (k * Math.PI) / 4
        return {
          nom: noms[j],
          k,
          m,
          x: m * Math.cos(angle),
          y: m * Math.sin(angle),
        }
      })
      this.pointsAttendus[i] = points.map(({ nom, x, y }) => ({
        label: nom,
        x,
        y,
      }))
      this.goodAnswers[i] = this.pointsAttendus[i]

      const lignes = points.map(
        ({ nom, k, m }, j) =>
          `${nbPoints > 1 ? '' : 'Placer le point '}$${nom}$, image du nombre complexe $z_${nom}$, tel que $\\vert z_${nom}\\vert=${m}$ et $\\arg(z_${nom})=${texArgument(k)}$${nbPoints > 1 && j < nbPoints - 1 ? ' ;' : '.'}`,
      )
      const enonce =
        `Dans le plan complexe, on se donne un repère orthonormé direct $\\left(O\\,;\\,\\vec{u},\\vec{v}\\right)$.<br>${nbPoints > 1 ? 'Placer les points :<br>' : ''}` +
        (nbPoints > 1
          ? `<ul style="list-style-type: disc; padding-left: 1.5em; margin: 0; line-height: 2.4;">${lignes.map((ligne) => `<li>${ligne}</li>`).join('')}</ul>`
          : `<div style="line-height: 2.4;">${lignes[0]}</div>`)

      const figureEleve = new Figure({
        xMin: -8,
        yMin: -8,
        width: 480,
        height: 480,
        snapGrid: false,
        dx: 1,
        dy: 1,
      })
      figureEleve.create('Grid')
      figureEleve.options.color = 'blue'
      // Origine du repère, pour pouvoir y centrer un cercle
      figureEleve.create('Point', { x: 0, y: 0, label: 'O', color: 'black' })
      figureEleve.options.labelAutomaticBeginsWith = 'A'
      figureEleve.options.labelAutomaticForPoints = true
      figureEleve.setToolbar({
        tools: [
          'POINT',
          'NAME_POINT',
          'CIRCLE_CENTER_POINT',
          'RAY',
          'LINE',
          'POINT_INTERSECTION',
          'DRAG',
          'REMOVE',
          'UNDO',
          'REDO',
        ],
        position: 'top',
      })
      this.figuresApiGeom[i] = figureEleve
      // En non interactif, le repère est facultatif (paramètre) ; il est vide, les points sont à placer à la main.
      this.listeQuestions[i] = this.interactif
        ? enonce +
          figureApigeom({
            exercice: this,
            i,
            figure: figureEleve,
            defaultAction: 'POINT',
          })
        : enonce + (this.sup2 ? figureRepere(0.6) : '')

      const pts = points.map(({ x, y }) => point(x, y))
      // Nom du point : décalé de 15° par rapport à la demi-droite et au-delà du cercle, donc ni sur un axe, ni sur la droite, ni sur le cercle
      const nomsPoints = points.map(({ nom, k, m }) => {
        const angle = (k * Math.PI) / 4 + Math.PI / 12
        const r = m + 0.5
        return texteParPoint(
          `$${nom}$`,
          point(r * Math.cos(angle), r * Math.sin(angle)),
          0,
          'black',
          1,
          'milieu',
          true,
        )
      })
      const O = point(0, 0)
      // Une figure par point : cercle, demi-droite, arc orienté et point
      const figuresCorrection = points.map(({ m, k }, j) =>
        figureRepere(
          0.45,
          cercle(O, m, bleuMathalea, 'none', 'none', 1, 4),
          demiDroiteJusquAuBord(O, k, bleuMathalea),
          ...mesureOrientee(k, 0),
          tracePoint(pts[j]),
          nomsPoints[j],
        ),
      )
      const figuresCorrectionHtml = context.isHtml
        ? `<div style="display:flex;flex-wrap:wrap;gap:0.5em">${figuresCorrection.join('')}</div>`
        : figuresCorrection.join('')
      const explications =
        'Pour placer un point, on trace la demi-droite d’origine $O$ qui forme avec l’axe des abscisses un angle orienté dont la mesure est l’argument donné, ' +
        'puis le cercle de centre $O$ dont le rayon est le module donné. ' +
        'Le point est à l’intersection de la demi-droite et du cercle.'
      this.listeCorrections[i] =
        `${lampeMessage({ titre: texteEnCouleurEtGras('Méthode :', bleuMathalea), texte: explications, couleur: 'blue' })}${figuresCorrectionHtml}`
    }
    listeQuestionsToContenu(this)
  }

  /**
   * Vérifie qu'un point est placé à `tolerance` près (placement libre, coordonnées parfois irrationnelles).
   * Les points auxiliaires (centre ou point du cercle) ne comptent pas : on cherche n'importe quel point proche de la position attendue.
   */
  verifieAvecTolerance(figure: Figure, label: string, x: number, y: number) {
    const points = [...figure.elements.values()].filter(
      (e) => e.type.startsWith('Point') && e.type !== 'pointer',
    ) as unknown as { x: number; y: number }[]
    const trouve = points.some((p) => Math.hypot(p.x - x, p.y - y) <= tolerance)
    return {
      isValid: trouve,
      message: trouve ? '' : `Le point $${label}$ n'est pas au bon endroit.`,
    }
  }

  /** Corrige la figure de l'élève. */
  correctionInteractive = (i: number) => {
    if (this.answers == null) this.answers = {}
    const figure = this.figuresApiGeom![i]
    this.answers[figure.id] = figureAnswerJson(figure)
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    const resultat: string[] = []
    let feedback = ''
    for (const { label, x, y } of this.pointsAttendus[i]) {
      const { isValid, message } = this.verifieAvecTolerance(
        figure,
        label,
        x,
        y,
      )
      resultat.push(isValid ? 'OK' : 'KO')
      if (message !== '') feedback += `${message}<br>`
    }
    if (divFeedback != null) divFeedback.innerHTML = feedback
    const divCheck = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${i}`,
    )
    if (divCheck != null)
      divCheck.innerHTML = resultat.every((r) => r === 'OK') ? '😎' : '☹️'
    figure.isDynamic = false
    return resultat
  }
}
