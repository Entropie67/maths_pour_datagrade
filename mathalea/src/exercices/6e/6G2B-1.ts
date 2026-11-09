import Figure from 'apigeom'
import { Arc } from '../../lib/2d/Arc'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { angleOriente } from '../../lib/2d/utilitairesGeometriques'
import {
  addEditeurIep,
  ElementIepEditeur,
  type ElementIepVerificationCallback,
  type InstructionIep,
  type TypeInstructionIep,
} from '../../lib/customElements/ElementIepEditeur'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import figureApigeom from '../../lib/figureApigeom'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { sortRandomlyLikeV8 } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu } from '../../modules/outils'

export const interactifReady = true

type ArcDansLeCarre = {
  extremite1: number
  extremite2: number
  xCentre?: number
  yCentre?: number
}
type FormeDansLeCarre = Array<ArcDansLeCarre>

const VERIFICATION_FORME_DANS_LE_CARRE_CALLBACK_NAME =
  'verification-forme-dans-le-carre'

const pointsDuCarre = [
  { nom: 'J', x: 0, y: 9 },
  { nom: 'I', x: 3, y: 9 },
  { nom: 'H', x: 6, y: 9 },
  { nom: 'G', x: 9, y: 9 },
  { nom: 'F', x: 9, y: 6 },
  { nom: 'E', x: 9, y: 3 },
  { nom: 'D', x: 9, y: 0 },
  { nom: 'C', x: 6, y: 0 },
  { nom: 'B', x: 3, y: 0 },
  { nom: 'A', x: 0, y: 0 },
  { nom: 'L', x: 0, y: 3 },
  { nom: 'K', x: 0, y: 6 },
  { nom: 'M', x: 3, y: 3 },
  { nom: 'N', x: 6, y: 3 },
  { nom: 'O', x: 6, y: 6 },
  { nom: 'P', x: 3, y: 6 },
]

// Position du nom de chaque point, pour qu'il ne chevauche ni le cadre ni les arcs
const positionsNomsPoints: Record<string, string> = {
  J: 'above left',
  I: 'above',
  H: 'above',
  G: 'above right',
  F: 'right',
  E: 'right',
  D: 'below right',
  C: 'below',
  B: 'below',
  A: 'below left',
  L: 'left',
  K: 'left',
  M: 'below left',
  N: 'below right',
  O: 'above right',
  P: 'above left',
}

const pointAPArtirDuNumero = (n: number) =>
  pointAbstrait(pointsDuCarre[n].x, pointsDuCarre[n].y)
const sommetsDuCarre = [0, 1, 2, 3].map((i) => pointsDuCarre[i * 3])

function nomPointDepuisCoordonnees(x: number, y: number): string {
  const point = pointsDuCarre.find((point) => point.x === x && point.y === y)
  if (point === undefined) {
    throw new Error(`Aucun point nommé aux coordonnées (${x}; ${y}).`)
  }
  return point.nom
}

function coordonneesPointDepuisNom(nom: string): string | undefined {
  const point = pointsDuCarre.find((point) => point.nom === nom)
  if (point === undefined) return undefined
  return `${point.x};${point.y}`
}

function cleArcDepuisInstruction(
  instruction: InstructionIep,
): string | undefined {
  if (instruction.type !== 'arcPointPointCentre') return undefined
  const centre = coordonneesPointDepuisNom(instruction.p1)
  const extremite1 = coordonneesPointDepuisNom(instruction.p2)
  const extremite2 = coordonneesPointDepuisNom(instruction.p3)
  if (
    centre === undefined ||
    extremite1 === undefined ||
    extremite2 === undefined
  ) {
    return undefined
  }
  const [xCentre, yCentre] = centre.split(';').map(Number)
  const [x1, y1] = extremite1.split(';').map(Number)
  const [x2, y2] = extremite2.split(';').map(Number)
  const estUnDemiCercle = x1 + x2 === 2 * xCentre && y1 + y2 === 2 * yCentre
  // Un demi-cercle est tracé de la première à la seconde extrémité dans le sens
  // trigonométrique : l'ordre des extrémités détermine le côté du tracé.
  const extremites = estUnDemiCercle
    ? [extremite1, extremite2]
    : [extremite1, extremite2].sort()
  return `${centre}|${extremites[0]}|${extremites[1]}`
}

function arcsTracesParProgramme(programme: InstructionIep[]): string[] {
  return programme
    .map(cleArcDepuisInstruction)
    .filter((arc): arc is string => arc !== undefined)
    .sort()
}

const verifierFormeDansLeCarre: ElementIepVerificationCallback = ({
  studentProgram,
  expectedRaw,
}) => {
  if (typeof expectedRaw !== 'string') {
    return {
      isOk: false,
      feedback: 'Réponse attendue invalide.',
    }
  }
  let expectedProgram: InstructionIep[]
  try {
    const parsed = JSON.parse(expectedRaw)
    if (!Array.isArray(parsed)) {
      return {
        isOk: false,
        feedback: 'Réponse attendue invalide.',
      }
    }
    expectedProgram = parsed as InstructionIep[]
  } catch {
    return {
      isOk: false,
      feedback: 'Réponse attendue invalide.',
    }
  }
  const arcsAttendus = arcsTracesParProgramme(expectedProgram)
  const arcsEleve = arcsTracesParProgramme(studentProgram)
  const isOk =
    arcsAttendus.length === arcsEleve.length &&
    arcsAttendus.every((arc, index) => arc === arcsEleve[index])
  return {
    isOk,
    feedback: isOk
      ? 'Bravo !'
      : 'Les arcs tracés ne correspondent pas à la forme attendue.',
  }
}

ElementIepEditeur.registerVerificationCallback(
  VERIFICATION_FORME_DANS_LE_CARRE_CALLBACK_NAME,
  verifierFormeDansLeCarre,
)

function estUnSommetDuCarre(numeroPoint: number): boolean {
  return sommetsDuCarre.some(
    (point) =>
      point.x === pointsDuCarre[numeroPoint].x &&
      point.y === pointsDuCarre[numeroPoint].y,
  )
}

function arcPossible(
  extremite1: number,
  extremite2: number,
  delta: number,
): boolean {
  const unPointEstUnSommet =
    estUnSommetDuCarre(extremite1) || estUnSommetDuCarre(extremite2)
  if (unPointEstUnSommet && delta === 4) return false // On ne peut pas avoir un arc de 4 avec un sommet dans le carré
  if (delta === 6 && !unPointEstUnSommet) return false // On ne peut pas avoir un arc de 6 sans sommet dans le carré
  return true
}

function creerListeArcs() {
  const start = Math.round(Math.random() * 3)
  const creerArcs = (
    extremite1: number,
    remaining: number,
    bondPrecedent?: number,
    premierBond?: number,
  ): FormeDansLeCarre | undefined => {
    if (remaining === 0) {
      return bondPrecedent === 2 && premierBond === 2 ? undefined : []
    }
    const bondsPossibles = sortRandomlyLikeV8(
      [2, 4, 6]
        .filter((bond) => bond <= remaining)
        .filter((bond) => bondPrecedent !== 2 || bond !== 2),
    )
    for (const bond of bondsPossibles) {
      const extremite2 = (extremite1 + bond) % 12
      if (!arcPossible(extremite1, extremite2, bond)) continue
      const suite = creerArcs(
        extremite2,
        remaining - bond,
        bond,
        premierBond ?? bond,
      )
      if (suite !== undefined) {
        return [{ extremite1, extremite2 }, ...suite]
      }
    }
  }

  return creerArcs(start, 12) ?? []
}

function trouverCentreArcEtSens(arc: ArcDansLeCarre) {
  const deuxPointsEnHaut =
    pointsDuCarre[arc.extremite1].y === 9 &&
    pointsDuCarre[arc.extremite2].y === 9
  const deuxPointsEnBas =
    pointsDuCarre[arc.extremite1].y === 0 &&
    pointsDuCarre[arc.extremite2].y === 0
  const deuxPointsAGauche =
    pointsDuCarre[arc.extremite1].x === 0 &&
    pointsDuCarre[arc.extremite2].x === 0
  const deuxPointsADroite =
    pointsDuCarre[arc.extremite1].x === 9 &&
    pointsDuCarre[arc.extremite2].x === 9

  const deuxPointsSurLeMemeCote =
    deuxPointsEnHaut ||
    deuxPointsEnBas ||
    deuxPointsAGauche ||
    deuxPointsADroite
  const p1 = pointsDuCarre[arc.extremite1]
  const p2 = pointsDuCarre[arc.extremite2]
  const delta = (arc.extremite2 - arc.extremite1 + 12) % 12
  switch (delta) {
    case 2:
      if (deuxPointsSurLeMemeCote) {
        if (deuxPointsEnHaut) {
          return { xCentre: (p1.x + p2.x) / 2, yCentre: 9 }
        }
        if (deuxPointsEnBas) {
          return { xCentre: (p1.x + p2.x) / 2, yCentre: 0 }
        }
        if (deuxPointsAGauche) {
          return { xCentre: 0, yCentre: (p1.y + p2.y) / 2 }
        }
        if (deuxPointsADroite) {
          return { xCentre: 9, yCentre: (p1.y + p2.y) / 2 }
        }
      } else {
        const premierCentre = Math.random() > 0.5
        if (premierCentre) return { xCentre: p1.x, yCentre: p2.y }
        else return { xCentre: p2.x, yCentre: p1.y }
      }
      break
    case 4: {
      const premierCentre = Math.random() > 0.5
      if (premierCentre) return { xCentre: p1.x, yCentre: p2.y }
      else return { xCentre: p2.x, yCentre: p1.y }
    }
    case 6:
      switch (p1.x) {
        case 0:
          switch (p1.y) {
            case 0:
              return { xCentre: 9, yCentre: 0 }
            case 9:
              return { xCentre: 0, yCentre: 0 }
          }
          break
        case 9:
          switch (p1.y) {
            case 0:
              return { xCentre: 9, yCentre: 9 }
            case 9:
              return { xCentre: 0, yCentre: 9 }
          }
      }
      return { xCentre: p1.y, yCentre: p2.x }
    default:
      console.error('delta invalide', delta)
  }
  return { xCentre: p1.x, yCentre: p2.y }
}

function creerForme(): FormeDansLeCarre {
  const arcs = creerListeArcs()
  const arcsAvecCentreEtSens = arcs.map((arc) => {
    const { xCentre, yCentre } = trouverCentreArcEtSens(arc)
    return { ...arc, xCentre, yCentre }
  })
  return arcsAvecCentreEtSens
}

function traceShape(arcs: FormeDansLeCarre, avecNomsDesPoints = false): string {
  const A = pointAbstrait(0, 0)
  const B = pointAbstrait(9, 0)
  const cadre = carre(A, B)
  const s1 = segment(pointAbstrait(3, 0), pointAbstrait(3, 9))
  const s2 = segment(pointAbstrait(6, 0), pointAbstrait(6, 9))
  const s3 = segment(pointAbstrait(0, 3), pointAbstrait(9, 3))
  const s4 = segment(pointAbstrait(0, 6), pointAbstrait(9, 6))
  const objets: NestedObjetMathalea2dArray = [cadre, s1, s2, s3, s4]
  for (const arc of arcs) {
    const E1 = pointAPArtirDuNumero(arc.extremite1)
    const E2 = pointAPArtirDuNumero(arc.extremite2)
    const centre = pointAbstrait(arc.xCentre ?? 0, arc.yCentre ?? 0)
    objets.push(new Arc(E1, centre, angleOriente(E1, centre, E2)))
  }
  if (avecNomsDesPoints) {
    const pointsNommes = pointsDuCarre.map(({ nom, x, y }) =>
      pointAbstrait(x, y, nom, positionsNomsPoints[nom]),
    )
    objets.push(tracePoint(...pointsNommes), labelPoint(...pointsNommes))
  }

  return mathalea2d(Object.assign({}, fixeBordures(objets)), objets)
}

/**
 * Clé d'un arc tracé : centre, point de départ et angle balayé (positif).
 * Un arc parcouru dans le sens horaire est décrit à partir de son autre
 * extrémité, pour que les deux sens de tracé donnent la même clé.
 */
function cleArcTrace(
  centre: { x: number; y: number },
  depart: { x: number; y: number },
  angle: number,
): string {
  let debut = depart
  if (angle < 0) {
    const radians = (angle * Math.PI) / 180
    const dx = depart.x - centre.x
    const dy = depart.y - centre.y
    debut = {
      x: centre.x + dx * Math.cos(radians) - dy * Math.sin(radians),
      y: centre.y + dx * Math.sin(radians) + dy * Math.cos(radians),
    }
  }
  const arrondi = (n: number) => Math.round(n * 100) / 100 + 0
  return `${arrondi(centre.x)};${arrondi(centre.y)}|${arrondi(debut.x)};${arrondi(debut.y)}|${Math.round(Math.abs(angle))}`
}

function arcsAttendusDansLeCarre(arcs: FormeDansLeCarre): string[] {
  return arcs.map((arc) => {
    const E1 = pointAPArtirDuNumero(arc.extremite1)
    const E2 = pointAPArtirDuNumero(arc.extremite2)
    const centre = pointAbstrait(arc.xCentre ?? 0, arc.yCentre ?? 0)
    return cleArcTrace(centre, E1, angleOriente(E1, centre, E2))
  })
}

type ArcApigeom = {
  center: { x: number; y: number }
  start: { x: number; y: number }
  dynamicAngle: { value: number }
}

function arcsTracesDansFigure(figure: Figure): string[] {
  return [...figure.elements.values()]
    .filter((element) => element.type === 'ArcByCenterAndTwoPoints')
    .map((element) => {
      const arc = element as unknown as ArcApigeom
      return cleArcTrace(arc.center, arc.start, arc.dynamicAngle.value)
    })
    .filter((cle, index, cles) => cles.indexOf(cle) === index)
}

export const titre = 'Reproduire une forme avec des arcs de cercles'
export const uuid = 'ebaef'
export const dateDePublication = '20/08/2026'
export const dateDeModifImportante = '10/10/2026'

export const refs = {
  'fr-fr': ['6G2B-1'],
  'fr-2016': [],
  'fr-ch': ['PRQES02C-3', '9R1ES7A-3', '9R2ES7A-3', '9R3ES7A-3'],
}
/**
 * @author Jean-Claude Lhote
 * Rémi Angot pour les modifications de l'interactivité
 */
export default class FormeDansLeCarreATracer extends Exercice {
  arcsAttendus: string[][] = []
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.besoinFormulaireNumerique = [
      'Type d’exercice',
      2,
      '1 : Rédiger un programme de construction\n2 : Reproduire la forme',
    ]
    this.sup = 1
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    this.arcsAttendus = []
    const forme = creerForme()
    const conditionsInitiales: InstructionIep[] = [
      ...pointsDuCarre.map(({ nom, x, y }) => ({
        type: 'point' as const,
        nom,
        x,
        y,
      })),
      { type: 'polygoneRapide', sommets: 'A,D,G,J' },
      { type: 'trait', p1: 'B', p2: 'I' },
      { type: 'trait', p1: 'C', p2: 'H' },
      { type: 'trait', p1: 'L', p2: 'E' },
      { type: 'trait', p1: 'K', p2: 'F' },
    ]
    const instructionsDisponibles: TypeInstructionIep[] = [
      'arcPointPointCentre',
    ]
    const programmeAttendu: InstructionIep[] = forme.map((arc) => ({
      type: 'arcPointPointCentre',
      p1: nomPointDepuisCoordonnees(arc.xCentre ?? 0, arc.yCentre ?? 0),
      p2: pointsDuCarre[arc.extremite1].nom,
      p3: pointsDuCarre[arc.extremite2].nom,
    }))
    // La correction est générée avant l'énoncé : addEditeurIep() déclare le
    // format interactif de la question, que figureApigeom() doit pouvoir remplacer.
    this.listeCorrections[0] = `Voici un programme de construction de la forme demandée :<br>
        ${addEditeurIep(this, 0, {
          id: `IepEditeur-corr-Ex${this.numeroExercice}Q0`,
          conditionsInitiales,
          interactivityOn: false,
          masquerEtapesInitiales: true,
          programmeInitial: programmeAttendu,
          instructionsDisponibles,
        })}`
    if (this.sup === 2) {
      this.listeQuestions[0] = this.enonceReproduction(forme)
    } else {
      const consigne =
        'Rédiger un programme de construction de la forme ci-dessous, en utilisant uniquement des arcs de cercle définis par leur centre et leurs deux extrémités, choisis parmi les points nommés. Entre deux extrémités, l’arc tracé est le plus petit des deux arcs possibles ; pour un demi-cercle, il est tracé de la première à la seconde extrémité dans le sens inverse des aiguilles d’une montre.'
      if (this.interactif) {
        const editeur = addEditeurIep(this, 0, {
          conditionsInitiales,
          instructionsDisponibles,
          programmeAttendu,
          masquerEtapesInitiales: true,
          verifyCallbackName: VERIFICATION_FORME_DANS_LE_CARRE_CALLBACK_NAME,
        })
        handleAnswers(
          this,
          0,
          {
            reponse: { value: JSON.stringify(programmeAttendu) },
          },
          { formatInteractif: 'alea-iep-editeur' },
        )
        this.listeQuestions[0] = `${consigne}<br>${traceShape(forme)}${editeur}`
      } else {
        this.listeQuestions[0] = `${consigne}<br>${traceShape(forme, true)}`
      }
    }

    listeQuestionsToContenu(this)
  }

  /**
   * Énoncé de la version « Reproduire la forme » : sur papier, l'élève trace la
   * forme dans un carré de 9 cm ; en interactif, il la trace dans une figure
   * apiGeom avec l'outil « arc de cercle de centre donné entre deux points ».
   */
  private enonceReproduction(forme: FormeDansLeCarre): string {
    const i = 0
    if (!this.interactif || !context.isHtml) {
      return `Reproduire la forme ci-dessous dans un carré de $9\\text{ cm}$ de côté.<br>${traceShape(forme)}`
    }
    this.arcsAttendus[i] = arcsAttendusDansLeCarre(forme)
    const figure = new Figure({
      xMin: -1,
      yMin: -1,
      width: 440,
      height: 440,
      pixelsPerUnit: 40,
    })
    this.figuresApiGeom = [figure]
    const pointsFigure = new Map(
      pointsDuCarre.map(({ nom, x, y }) => [
        nom,
        figure.create('Point', {
          x,
          y,
          label: nom,
          shape: 'x',
          isFree: false,
          isDeletable: false,
          labelDxInPixels: 8,
          labelDyInPixels: 16,
        }),
      ]),
    )
    for (const [nom1, nom2] of [
      ['A', 'D'],
      ['D', 'G'],
      ['G', 'J'],
      ['J', 'A'],
      ['B', 'I'],
      ['C', 'H'],
      ['L', 'E'],
      ['K', 'F'],
    ]) {
      figure.create('Segment', {
        point1: pointsFigure.get(nom1)!,
        point2: pointsFigure.get(nom2)!,
        color: 'gray',
        isSelectable: false,
        isDeletable: false,
      })
    }
    figure.setToolbar({
      tools: ['ARC_CENTER_TWO_POINTS', 'DRAG', 'REMOVE', 'UNDO', 'REDO'],
      position: 'top',
    })
    const consigne =
      'Reproduire la forme ci-dessous dans le carré. Pour tracer un arc de cercle, choisir l’outil arc de cercle, puis cliquer sur son centre, sur sa première extrémité et enfin sur sa seconde extrémité. L’arc est tracé de la première à la seconde extrémité dans le sens inverse des aiguilles d’une montre.'
    return `${consigne}<br>${traceShape(forme)}${figureApigeom({
      exercice: this,
      i,
      figure,
      defaultAction: 'ARC_CENTER_TWO_POINTS',
    })}`
  }

  correctionInteractive = (i: number) => {
    const figure = this.figuresApiGeom?.[i]
    if (figure === undefined) return 'KO'
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[figure.id] = figureAnswerJson(figure)
    const arcsEleve = arcsTracesDansFigure(figure)
    const arcsAttendus = this.arcsAttendus[i] ?? []
    const nbArcsCorrects = arcsAttendus.filter((arc) =>
      arcsEleve.includes(arc),
    ).length
    const nbArcsFaux = arcsEleve.filter(
      (arc) => !arcsAttendus.includes(arc),
    ).length
    const isOk = nbArcsCorrects === arcsAttendus.length && nbArcsFaux === 0
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    if (divFeedback != null) {
      divFeedback.innerHTML = isOk
        ? 'Bravo !'
        : `${nbArcsCorrects} arc${nbArcsCorrects > 1 ? 's' : ''} sur ${arcsAttendus.length} ${nbArcsCorrects > 1 ? 'sont corrects' : 'est correct'}${nbArcsFaux > 0 ? ` et ${nbArcsFaux} arc${nbArcsFaux > 1 ? 's ne font' : ' ne fait'} pas partie de la forme` : ''}.`
    }
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    return isOk ? 'OK' : 'KO'
  }
}
