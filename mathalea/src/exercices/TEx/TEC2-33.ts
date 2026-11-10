import Figure from 'apigeom'
import { orangeMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { context } from '../../modules/context'
import { arc } from '../../lib/2d/Arc'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { point, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { representant } from '../../lib/2d/representantVecteur'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { rotation, similitude } from '../../lib/2d/transformations'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer une mesure de l'angle orienté $(\\vec{u}\\,;\\overrightarrow{AB})$"
export const interactifReady = true
export const dateDePublication = '30/10/2026'
export const uuid = '59900'
export const refs = {
  'fr-fr': ['TEC2-33'],
  'fr-ch': [],
}

/** Directions de $\overrightarrow{AB}$ : vecteur directeur entier, mesure principale et lecture de la figure. */
const directions = [
  {
    dx: 1,
    dy: 0,
    diagonale: false,
    mesure: '0',
    degres: 0,
    lecture: "$\\overrightarrow{AB}$ a la même direction et le même sens que $\\vec u$ : l'angle est nul",
  },
  {
    dx: 1,
    dy: 1,
    diagonale: true,
    mesure: '\\dfrac{\\pi}{4}',
    degres: 45,
    lecture:
      "$\\overrightarrow{AB}$ est porté par la diagonale d'un carré du quadrillage, entre $\\vec u$ et $\\vec v$ : il fait un huitième de tour dans le sens direct",
  },
  {
    dx: 0,
    dy: 1,
    diagonale: false,
    mesure: '\\dfrac{\\pi}{2}',
    degres: 90,
    lecture:
      "$\\overrightarrow{AB}$ a la même direction et le même sens que $\\vec v$ : il fait un quart de tour dans le sens direct",
  },
  {
    dx: -1,
    dy: 1,
    diagonale: true,
    mesure: '\\dfrac{3\\pi}{4}',
    degres: 135,
    lecture:
      "$\\overrightarrow{AB}$ est porté par la diagonale d'un carré du quadrillage, entre $\\vec v$ et $-\\vec u$ : il fait un quart de tour puis un huitième de tour dans le sens direct",
  },
  {
    dx: -1,
    dy: 0,
    diagonale: false,
    mesure: '\\pi',
    degres: 180,
    lecture: "$\\overrightarrow{AB}$ a la même direction que $\\vec u$ et le sens contraire : il fait un demi-tour",
  },
  {
    dx: -1,
    dy: -1,
    diagonale: true,
    mesure: '-\\dfrac{3\\pi}{4}',
    degres: -135,
    lecture:
      "$\\overrightarrow{AB}$ est porté par la diagonale d'un carré du quadrillage, entre $-\\vec u$ et $-\\vec v$ : il fait un quart de tour puis un huitième de tour dans le sens indirect",
  },
  {
    dx: 0,
    dy: -1,
    diagonale: false,
    mesure: '-\\dfrac{\\pi}{2}',
    degres: -90,
    lecture:
      "$\\overrightarrow{AB}$ a la même direction que $\\vec v$ et le sens contraire : il fait un quart de tour dans le sens indirect",
  },
  {
    dx: 1,
    dy: -1,
    diagonale: true,
    mesure: '-\\dfrac{\\pi}{4}',
    degres: -45,
    lecture:
      "$\\overrightarrow{AB}$ est porté par la diagonale d'un carré du quadrillage, entre $\\vec u$ et $-\\vec v$ : il fait un huitième de tour dans le sens indirect",
  },
]

/**
 * Lire sur une figure une mesure de l'angle orienté $(\vec u;\overrightarrow{AB})$ :
 * le repère orthonormé direct est tracé, avec un représentant de $\overrightarrow{AB}$ d'origine $O$.
 * La direction de $\overrightarrow{AB}$ est un multiple de $\pi/4$ : aucun calcul n'est demandé.
 * @author Stéphane Guyon
 */
export default class AngleOrienteAffixes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ["Afficher le repère dans l'énoncé", true]
    this.sup = true
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const direction = choice(directions)
      const k = randint(2, 4)
      const xA = randint(-4, 4)
      const yA = randint(-4, 4)
      const xB = xA + k * direction.dx
      const yB = yA + k * direction.dy
      if (Math.abs(xB) > 5 || Math.abs(yB) > 5) continue
      if (!this.questionJamaisPosee(i, direction.mesure, k, xA, yA)) continue
      const O = pointAbstrait(0, 0)
      const A = point(xA, yA, 'A', 'above left')
      const B = point(xB, yB, 'B', 'above right')
      const u = vecteur(1, 0)
      const v = vecteur(0, 1)
      const AB = vecteur(k * direction.dx, k * direction.dy)
      const repereOrthonorme = repere({
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        xUnite: 1,
        yUnite: 1,
        grille: true,
        grilleDistance: 1,
        grilleCouleur: 'gray',
        grilleOpacite: 0.4,
        xThickDistance: 1,
        yThickDistance: 1,
        xLegende: '',
        yLegende: '',
        axeXStyle: '->',
        axeYStyle: '->',
      })
      const cadre = { xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, pixelsParCm: 30, scale: 0.6 }
      const vecteursBase = [
        representant(u, O, 'red'),
        representant(v, O, 'red'),
        latex2d('O', -0.3, -0.35, { color: 'black' }),
        latex2d('\\vec u', 0.5, -0.45, { color: 'red' }),
        latex2d('\\vec v', -0.4, 0.5, { color: 'red' }),
      ]
      const representantAB = representant(AB, O, 'blue')
      representantAB.epaisseur = 3
      const vecteurAB = [representantAB]
      // Vecteur AB lui-même, en trait fin, entre les points A et B
      const traitAB = representant(AB, A, 'black')
      // Nom d'un point placé à l'écart des axes, de la graduation et des vecteurs tracés
      const distanceSegment = (px: number, py: number, [ax, ay, bx, by]: number[]) => {
        const longueur2 = (bx - ax) ** 2 + (by - ay) ** 2
        const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / longueur2))
        return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)))
      }
      const segmentsTraces = [
        [xA, yA, xB, yB],
        [0, 0, k * direction.dx, k * direction.dy],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ]
      const nomPoint = (nom: string, x: number, y: number) => {
        for (const rayon of [0.8, 1.1]) {
          for (let angle = 45; angle < 405; angle += 45) {
            const lx = x + rayon * Math.cos((angle * Math.PI) / 180)
            const ly = y + rayon * Math.sin((angle * Math.PI) / 180)
            const libre =
              Math.abs(lx) > 0.6 &&
              Math.abs(ly) > 0.6 &&
              Math.abs(lx) < 5.3 &&
              Math.abs(ly) < 5.3 &&
              segmentsTraces.every((segmentTrace) => distanceSegment(lx, ly, segmentTrace) > 0.5)
            if (libre) return latex2d(nom, lx, ly, { color: 'black' })
          }
        }
        return latex2d(nom, x + 0.8, y + 0.8, { color: 'black' })
      }
      const pointsAB = [traitAB, tracePoint(A, B), nomPoint('A', xA, yA), nomPoint('B', xB, yB)]
      // Dans l'énoncé, seul le repère est tracé : A, B et les vecteurs n'apparaissent que dans la correction
      let figure = mathalea2d(cadre, repereOrthonorme, ...vecteursBase)
      // En interactif, l'élève dispose d'une figure apiGeom de travail (repère, points, segments), non évaluée :
      // seule la mesure de l'angle est notée.
      const figureTravail = this.interactif && context.isHtml && !context.isTypst
      if (figureTravail) {
        // Repère ajusté aux points (A, B et le représentant de AB, marge d'une unité) pour grossir la grille, d'au moins -3 à 3
        const xBas = Math.min(xA, xB, k * direction.dx, -2) - 1
        const xHaut = Math.max(xA, xB, k * direction.dx, 2) + 1
        const yBas = Math.min(yA, yB, k * direction.dy, -2) - 1
        const yHaut = Math.max(yA, yB, k * direction.dy, 2) + 1
        const nbUnitesX = xHaut - xBas + 1
        const nbUnitesY = yHaut - yBas + 1
        const unitePx = Math.min(60, 520 / Math.max(nbUnitesX, nbUnitesY))
        const figureEleve = new Figure({
          xMin: xBas - 0.5,
          yMin: yBas - 0.5,
          width: nbUnitesX * unitePx,
          height: nbUnitesY * unitePx,
          pixelsPerUnit: unitePx,
          border: false,
          scale: 0.75,
          snapGrid: true,
          dx: 1,
          dy: 1,
        })
        // Taille des pointes de flèche en unités de la figure : on la réduit quand l'unité grandit (0,2 convient à 30 px par unité)
        figureEleve.options.borderSize = (0.2 * 30) / unitePx
        // Grille sans graduation ni repère de base : repereOij nomme les vecteurs ı et ȷ, et ses noms
        // reviennent à chaque annulation. O, u, v et les graduations sont donc de simples éléments de la figure.
        figureEleve.create('Grid', {
          strokeWidthGrid: 1,
          color: 'black',
          xMin: xBas,
          xMax: xHaut,
          yMin: yBas,
          yMax: yHaut,
          axeX: true,
          axeY: true,
          labelX: false,
          labelY: false,
        })
        for (let x = xBas; x <= xHaut; x++) {
          if (x === 0) continue
          figureEleve.create('TextByPosition', {
            text: `$${x}$`,
            x,
            y: 0,
            anchor: 'topCenter',
            dyInPixels: -6,
            fontSize: '0.67em',
            isSelectable: false,
          })
        }
        for (let y = yBas; y <= yHaut; y++) {
          if (y === 0) continue
          figureEleve.create('TextByPosition', {
            text: `$${y}$`,
            x: 0,
            y,
            anchor: 'middleRight',
            dxInPixels: -9,
            fontSize: '0.67em',
            isSelectable: false,
          })
        }
        // Point O réel (non déplaçable) : origine des vecteurs u et v et des translations
        const origine = figureEleve.create('Point', { x: 0, y: 0, isFree: false, color: 'black' })
        // Flèche proportionnelle à l'épaisseur : on l'affine quand l'unité grandit (3 convient à 30 px par unité)
        const epaisseurBase = Math.max(1, 90 / unitePx)
        figureEleve.create('Vector', { origin: origine, x: 1, y: 0, color: orangeMathalea, thickness: epaisseurBase, isSelectable: false })
        figureEleve.create('Vector', { origin: origine, x: 0, y: 1, color: orangeMathalea, thickness: epaisseurBase, isSelectable: false })
        for (const [texte, x, y, ancre] of [
          ['$O$', -0.25, -0.25, 'topRight'],
          ['$\\vec u$', 0.5, -0.25, 'topRight'],
          ['$\\vec v$', -0.25, 0.5, 'middleRight'],
        ] as const) {
          figureEleve.create('TextByPosition', { text: texte, x, y, anchor: ancre, color: orangeMathalea, fontSize: '13pt', isSelectable: false })
        }
        figureEleve.options.color = 'blue'
        figureEleve.options.labelAutomaticBeginsWith = 'A'
        figureEleve.options.labelAutomaticForPoints = true
        figureEleve.setToolbar({
          tools: ['POINT', 'NAME_POINT', 'SEGMENT', 'VECTOR', 'TRANSLATION', 'DRAG', 'REMOVE', 'UNDO', 'REDO'],
          position: 'top',
        })
        figureEleve.saveState() // « annuler » revient à ce repère, et non à une figure vide
        figure = figureApigeom({ exercice: this, i, figure: figureEleve, defaultAction: 'POINT', hasFeedback: false })
      }
      // Flèche orientée de u vers AB, étiquetée par la mesure de l'angle (rien n'est nommé sur les autres objets)
      const flecheArgument: ObjetMathalea2D[] = []
      if (direction.degres !== 0) {
        const sens = Math.sign(direction.degres)
        const debut = pointAbstrait(1.2, 0)
        const arcArgument = arc(debut, O, direction.degres, false, 'none', 'blue')
        const fin = rotation(debut, O, direction.degres)
        flecheArgument.push(
          arcArgument,
          segment(fin, similitude(fin, O, -10 * sens, 0.85), 'blue'),
          segment(fin, similitude(fin, O, -10 * sens, 1.15), 'blue'),
          latex2d(
            direction.mesure,
            2.1 * Math.cos((direction.degres / 2) * (Math.PI / 180)),
            2.1 * Math.sin((direction.degres / 2) * (Math.PI / 180)),
            { color: 'blue' },
          ),
        )
      }
      const figureCorrection = mathalea2d(
        cadre,
        repereOrthonorme,
        ...vecteursBase,
        ...pointsAB,
        ...vecteurAB,
        ...flecheArgument,
      )
      // Clavier adapté à un argument : chiffres, signe moins, fraction et π
      const champ = ajouteChampTexteMathLive(this, i, KeyboardType.clavierEntierementPersonnalisable, {
        texteAvant: '<br>$(\\vec u\\,;\\overrightarrow{AB})=$',
        dataKeys: [['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'], ['-', '\\pi', 'FRAC']],
      })
      this.listeQuestions[i] = `Dans le plan complexe muni d'un repère orthonormé direct $(O\\,;\\,\\vec u,\\vec v)$, on considère les points $A(${new Complexe(xA, yA).tex()})$ et $B(${new Complexe(xB, yB).tex()})$.${figureTravail ? "<br>Pour nommer un vecteur dans la figure, saisir $\\vec{u}$ ou $\\overrightarrow{AB}$ comme nom." : ''}${this.sup || figureTravail ? `<br>${figure}` : ''}<br>Déterminer ${this.interactif ? 'la mesure principale, dans $]-\\pi\\,;\\pi]$,' : 'une mesure'} de l'angle orienté $(\\vec u\\,;\\overrightarrow{AB})$.` + champ
      this.listeCorrections[i] = `${figureCorrection}<br>Sur la figure, on a placé les points $A$ et $B$, tracé le vecteur $\\overrightarrow{AB}$ et son représentant d'origine $O$ (en gras). ${direction.lecture[0].toUpperCase()}${direction.lecture.slice(1)}.<br>Une mesure de l'angle $(\\vec u\\,;\\overrightarrow{AB})$ est donc $${miseEnEvidence(direction.mesure)}$.`
      handleAnswers(this, i, { reponse: { value: direction.mesure } })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
