import {
  addEditeurIep,
  ElementIepEditeur,
  lireSommetsPolygone,
  pointsConstruitsDepuisProgramme,
  type ElementIepVerificationCallback,
  type InstructionIep,
  type TypeInstructionIep,
} from '../../lib/customElements/ElementIepEditeur'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { bleuMathalea } from '../../lib/colors'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { creerNomDePolygone, sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Construire un quadrilatère'

export const interactifReady = true
export const dateDePublication = '23/08/2026'
export const dateDeModifImportante = '11/10/2026'
export const uuid = 'd1b7f'

export const refs = {
  'fr-fr': ['6G0-10'],
  'fr-2016': [],
  'fr-ch': ['9R1ES2I-12', '9R2ES2I-12', '9R3ES2I-12'],
}

const typesFigures = ['Carré', 'Rectangle', 'Losange'] as const

type TypeFigure = (typeof typesFigures)[number]
type PointIep = {
  nom: string
  x: number
  y: number
}
type FigureAConstruire = {
  type: TypeFigure
  noms: [string, string, string, string]
  points: [PointIep, PointIep, PointIep, PointIep]
  // Longueurs exactes de l'énoncé (les coordonnées des points sont arrondies)
  ab: number
  ad: number
  angleAB: number
  angleAD: number
}
type ReponseAttendue = {
  type: TypeFigure
  noms: [string, string, string, string]
  programme: InstructionIep[]
}

// Barème fixe de la question, quelle que soit la figure tirée
const POINTS_QUESTION = 4
const EPSILON_LONGUEUR = 0.1
const EPSILON_ANGLE_DROIT = 0.08

const VERIFICATION_QUADRILATERE_INSTRUMENTS_CALLBACK_NAME =
  'verification-construction-quadrilatere-instruments'

function distance(A: PointIep, B: PointIep): number {
  return Math.hypot(B.x - A.x, B.y - A.y)
}

function produitScalaire(A: PointIep, B: PointIep, C: PointIep): number {
  return (A.x - B.x) * (C.x - B.x) + (A.y - B.y) * (C.y - B.y)
}

function angleDroit(A: PointIep, B: PointIep, C: PointIep): boolean {
  const denominateur = distance(A, B) * distance(C, B)
  return (
    denominateur > 0 &&
    Math.abs(produitScalaire(A, B, C) / denominateur) <= EPSILON_ANGLE_DROIT
  )
}

function memeSegment(instruction: InstructionIep, p1: string, p2: string) {
  if (
    instruction.type !== 'segment' &&
    instruction.type !== 'trait' &&
    instruction.type !== 'segmentCodage'
  ) {
    return false
  }
  return (
    (instruction.p1 === p1 && instruction.p2 === p2) ||
    (instruction.p1 === p2 && instruction.p2 === p1)
  )
}

function segmentTrace(programme: InstructionIep[], p1: string, p2: string) {
  return programme.some((instruction) => {
    if (memeSegment(instruction, p1, p2)) return true
    if (
      instruction.type !== 'polygone' &&
      instruction.type !== 'polygoneRapide'
    ) {
      return false
    }
    const sommets = lireSommetsPolygone(instruction.sommets)
    return sommets.some((sommet, index) => {
      const suivant = sommets[(index + 1) % sommets.length]
      return (
        (sommet === p1 && suivant === p2) || (sommet === p2 && suivant === p1)
      )
    })
  })
}

function codageSegment(
  programme: InstructionIep[],
  p1: string,
  p2: string,
): string | undefined {
  const instruction = programme.find(
    (instruction) =>
      instruction.type === 'segmentCodage' && memeSegment(instruction, p1, p2),
  )
  return instruction?.type === 'segmentCodage' ? instruction.codage : undefined
}

function angleCodeDroit(
  programme: InstructionIep[],
  p1: string,
  p2: string,
  p3: string,
) {
  return programme.some(
    (instruction) =>
      instruction.type === 'codageAngleDroit' &&
      instruction.p2 === p2 &&
      ((instruction.p1 === p1 && instruction.p3 === p3) ||
        (instruction.p1 === p3 && instruction.p3 === p1)),
  )
}

function lireReponseAttendue(
  expectedRaw: unknown,
): ReponseAttendue | undefined {
  if (typeof expectedRaw !== 'string') return undefined
  try {
    const parsed = JSON.parse(expectedRaw)
    if (
      parsed == null ||
      !typesFigures.includes(parsed.type) ||
      !Array.isArray(parsed.noms) ||
      parsed.noms.length !== 4
    ) {
      return undefined
    }
    return parsed as ReponseAttendue
  } catch {
    return undefined
  }
}

/**
 * Nombre d'objets attendus correctement tracés, par catégorie :
 * - un côté est juste s'il est tracé et a la longueur attendue ;
 * - un côté est bien codé si son codage est égal à celui des côtés de même
 *   longueur et différent des autres (rectangle) ;
 * - un angle droit (carré, rectangle) est juste s'il est droit et codé.
 */
function objetsCorrects(
  reponseAttendue: ReponseAttendue,
  programmeEleve: InstructionIep[],
) {
  const { type, noms } = reponseAttendue
  const pointsEleve = pointsConstruitsDepuisProgramme(programmeEleve)
  const pointsAttendus = pointsConstruitsDepuisProgramme(
    reponseAttendue.programme,
  )
  const cotes = noms.map((nom, i) => [nom, noms[(i + 1) % 4]] as const)
  const longueurJuste = (p1: string, p2: string) => {
    const [A, B, A0, B0] = [p1, p2, p1, p2].map((nom, i) =>
      (i < 2 ? pointsEleve : pointsAttendus).get(nom),
    )
    return (
      A !== undefined &&
      B !== undefined &&
      A0 !== undefined &&
      B0 !== undefined &&
      Math.abs(distance(A, B) - distance(A0, B0)) <= EPSILON_LONGUEUR
    )
  }
  const cotesJustes = cotes.filter(
    ([p1, p2]) => segmentTrace(programmeEleve, p1, p2) && longueurJuste(p1, p2),
  ).length
  const mesures = cotes.map(([p1, p2]) => {
    const [A, B] = [pointsEleve.get(p1), pointsEleve.get(p2)]
    if (A === undefined || B === undefined) return `[${p1}${p2}] non construit`
    const mesure = `[${p1}${p2}] = ${stringNombre(distance(A, B), 2)} cm`
    return segmentTrace(programmeEleve, p1, p2)
      ? mesure
      : `${mesure} (non tracé)`
  })
  const codages = cotes.map(([p1, p2]) => codageSegment(programmeEleve, p1, p2))
  // Carré et losange : 4 côtés de même longueur ; rectangle : côtés opposés
  const memeLongueur = (i: number, j: number) =>
    type !== 'Rectangle' || i % 2 === j % 2
  const codagesJustes = codages.filter(
    (codage, i) =>
      codage !== undefined &&
      codages.every((autre, j) => (autre === codage) === memeLongueur(i, j)),
  ).length
  const anglesAttendus = type === 'Losange' ? 0 : 4
  const anglesJustes =
    anglesAttendus === 0
      ? 0
      : noms.filter((nom, i) => {
          const precedent = noms[(i + 3) % 4]
          const suivant = noms[(i + 1) % 4]
          const [P, S, Q] = [precedent, nom, suivant].map((n) =>
            pointsEleve.get(n),
          )
          return (
            P !== undefined &&
            S !== undefined &&
            Q !== undefined &&
            angleDroit(P, S, Q) &&
            angleCodeDroit(programmeEleve, precedent, nom, suivant)
          )
        }).length
  return {
    mesures,
    cotesJustes,
    codagesJustes,
    anglesJustes,
    anglesAttendus,
    aucunCodageCote: codages.every((codage) => codage === undefined),
    aucunAngleCode: !programmeEleve.some(
      (instruction) => instruction.type === 'codageAngleDroit',
    ),
  }
}

const verifierConstructionQuadrilatere: ElementIepVerificationCallback = ({
  studentProgram,
  expectedRaw,
}) => {
  const reponseAttendue = lireReponseAttendue(expectedRaw)
  if (reponseAttendue === undefined) {
    return {
      isOk: false,
      feedback: 'Réponse attendue invalide.',
      score: { nbBonnesReponses: 0, nbReponses: POINTS_QUESTION },
    }
  }
  const {
    mesures,
    cotesJustes,
    codagesJustes,
    anglesJustes,
    anglesAttendus,
    aucunCodageCote,
    aucunAngleCode,
  } = objetsCorrects(reponseAttendue, studentProgram)
  const nbObjets = 8 + anglesAttendus
  const nbObjetsJustes = cotesJustes + codagesJustes + anglesJustes
  const isOk = nbObjetsJustes === nbObjets
  const points = Math.floor((nbObjetsJustes / nbObjets) * POINTS_QUESTION)
  const bilan = [
    `Mesures des côtés de la figure : ${mesures.join(' ; ')}.`,
    `Côtés tracés à la bonne longueur : ${cotesJustes} sur 4.`,
    `Côtés correctement codés : ${codagesJustes} sur 4.${aucunCodageCote ? ' Aucun côté n’est codé.' : ''}`,
    ...(anglesAttendus > 0
      ? [
          `Angles droits construits et codés : ${anglesJustes} sur 4.${aucunAngleCode ? ' Aucun angle droit n’est codé.' : ''}`,
        ]
      : []),
  ]
  return {
    isOk,
    feedback: isOk
      ? 'Bravo, la figure est construite et correctement codée.'
      : bilan.join('<br>'),
    score: { nbBonnesReponses: points, nbReponses: POINTS_QUESTION },
  }
}

ElementIepEditeur.registerVerificationCallback(
  VERIFICATION_QUADRILATERE_INSTRUMENTS_CALLBACK_NAME,
  verifierConstructionQuadrilatere,
)

/**
 * Type de figure tiré parmi ceux de la saisie (`1-1-2` : le rectangle a deux
 * fois plus de chances d'être tiré que le carré). Un seul type ne consomme pas
 * de nombre aléatoire, et le mélange (ou une saisie invalide) tire parmi les
 * trois types : le tirage reste celui des anciens réglages numériques 1 à 4.
 */
function choisirTypeFigure(saisie: unknown): TypeFigure {
  const nombres = String(saisie).split('-').map(Number)
  const cas = nombres.filter(
    (n) => Number.isInteger(n) && n >= 1 && n <= typesFigures.length,
  )
  const melange = cas.length === 0 || nombres.includes(typesFigures.length + 1)
  const candidats = melange ? typesFigures.map((_, i) => i + 1) : cas
  if (candidats.length === 1) return typesFigures[candidats[0] - 1]
  return typesFigures[candidats[randint(0, candidats.length - 1)] - 1]
}

function creerFigure(type: TypeFigure): FigureAConstruire {
  const nom = creerNomDePolygone(4, [])
  const noms = [nom[0], nom[1], nom[2], nom[3]] as [
    string,
    string,
    string,
    string,
  ]
  const longueur = randint(40, 75) / 10
  const largeur = randint(20, longueur * 10 - 1) / 10
  const angleLosange = randint(50, 70)
  const angleRad = (angleLosange * Math.PI) / 180
  let coordonnees: Array<[number, number]>
  switch (type) {
    case 'Carré':
      coordonnees = [
        [1, 1],
        [1 + longueur, 1],
        [1 + longueur, 1 + longueur],
        [1, 1 + longueur],
      ]
      break
    case 'Rectangle':
      coordonnees = [
        [1, 1],
        [1 + longueur, 1],
        [1 + longueur, 1 + largeur],
        [1, 1 + largeur],
      ]
      break
    case 'Losange':
      coordonnees = [
        [1, 1],
        [1 + longueur, 1],
        [
          1 + longueur + longueur * Math.cos(angleRad),
          1 + longueur * Math.sin(angleRad),
        ],
        [1 + longueur * Math.cos(angleRad), 1 + longueur * Math.sin(angleRad)],
      ]
      break
  }
  const rotation = (randint(-25, 25) * Math.PI) / 180
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  const centre = coordonnees.reduce(
    (acc, [x, y]) => ({ x: acc.x + x / 4, y: acc.y + y / 4 }),
    { x: 0, y: 0 },
  )
  const points = coordonnees.map(([xInitial, yInitial], index) => {
    const x = xInitial - centre.x
    const y = yInitial - centre.y
    return {
      nom: noms[index],
      x: Number((4 + x * cos - y * sin).toFixed(2)),
      y: Number((4 + x * sin + y * cos).toFixed(2)),
    }
  }) as [PointIep, PointIep, PointIep, PointIep]
  const angleAB =
    (Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) * 180) /
    Math.PI
  const angleAD =
    (Math.atan2(points[3].y - points[0].y, points[3].x - points[0].x) * 180) /
    Math.PI
  const ad = type === 'Rectangle' ? largeur : longueur
  return { type, noms, points, ab: longueur, ad, angleAB, angleAD }
}

function programmeConstruction(figure: FigureAConstruire): InstructionIep[] {
  const [A, B, C, D] = figure.noms
  const { ab, ad } = figure
  // Pour un losange, l'angle n'est pas imposé : D est placé au hasard à la
  // bonne distance de A. Sinon, D est placé sur la perpendiculaire en A, du
  // côté où la figure a été tirée (D est plus haut que A).
  const constructionD: InstructionIep[] =
    figure.type === 'Losange'
      ? [
          {
            type: 'pointADistanceLibre',
            nom: D,
            p1: A,
            distance: ad,
            angle: Number(figure.angleAD.toFixed(1)),
          },
        ]
      : [
          { type: 'perpendiculaireAObjet', etape: 2, p1: A },
          {
            type: 'pointSurObjetADistance',
            nom: D,
            etape: 3,
            p1: A,
            distance: ad,
            choix: 1,
          },
        ]
  const etapeSegmentAB = 2
  const etapeSegmentAD = 3 + constructionD.length
  const etapeParalleleAD = etapeSegmentAD + 1
  const etapeParalleleAB = etapeSegmentAD + 2
  const codageCotes =
    figure.type === 'Rectangle'
      ? [
          { type: 'segmentCodage' as const, p1: A, p2: B, codage: '/' },
          { type: 'segmentCodage' as const, p1: C, p2: D, codage: '/' },
          { type: 'segmentCodage' as const, p1: B, p2: C, codage: '//' },
          { type: 'segmentCodage' as const, p1: D, p2: A, codage: '//' },
        ]
      : [
          { type: 'segmentCodage' as const, p1: A, p2: B, codage: '/' },
          { type: 'segmentCodage' as const, p1: B, p2: C, codage: '/' },
          { type: 'segmentCodage' as const, p1: C, p2: D, codage: '/' },
          { type: 'segmentCodage' as const, p1: D, p2: A, codage: '/' },
        ]
  const codageAngles: InstructionIep[] =
    figure.type === 'Losange'
      ? []
      : [
          { type: 'codageAngleDroit', p1: D, p2: A, p3: B },
          { type: 'codageAngleDroit', p1: A, p2: B, p3: C },
          { type: 'codageAngleDroit', p1: B, p2: C, p3: D },
          { type: 'codageAngleDroit', p1: C, p2: D, p3: A },
        ]
  return [
    {
      type: 'pointLibre',
      nom: A,
      x: figure.points[0].x,
      y: figure.points[0].y,
    },
    {
      type: 'pointADistanceLibre',
      nom: B,
      p1: A,
      distance: ab,
      angle: Number(figure.angleAB.toFixed(1)),
    },
    { type: 'segment', p1: A, p2: B },
    ...constructionD,
    { type: 'segment', p1: A, p2: D },
    { type: 'paralleleAObjet', etape: etapeSegmentAD, p1: B },
    { type: 'paralleleAObjet', etape: etapeSegmentAB, p1: D },
    {
      type: 'intersection',
      etape1: etapeParalleleAD,
      etape2: etapeParalleleAB,
      nom: C,
      choix: 1,
    },
    { type: 'polygoneRapide', sommets: figure.noms.join(',') },
    ...codageCotes,
    ...codageAngles,
  ]
}

function figureCorrection(figure: FigureAConstruire) {
  const [A, B, C, D] = figure.points.map((point) =>
    pointAbstrait(point.x, point.y, point.nom),
  )
  const contour = polygone(A, B, C, D)
  const sommets = nommePolygone(contour, figure.noms.join(''))
  const codageCotes =
    figure.type === 'Rectangle'
      ? [
          codageSegments('|', bleuMathalea, A, B, C, D),
          codageSegments('||', bleuMathalea, B, C, D, A),
        ]
      : [codageSegments('|', bleuMathalea, A, B, B, C, C, D, D, A)]
  const codageAngles =
    figure.type === 'Losange'
      ? []
      : [
          codageAngleDroit(D, A, B),
          codageAngleDroit(A, B, C),
          codageAngleDroit(B, C, D),
          codageAngleDroit(C, D, A),
        ]
  const objets = [contour, sommets, ...codageCotes, ...codageAngles]
  return mathalea2d({ ...fixeBordures(objets), scale: 0.6 }, objets)
}

function enonceFigure(figure: FigureAConstruire, interactif: boolean) {
  const [A, B, C, D] = figure.noms
  const longueurAB = texNombre(figure.ab, 1)
  const longueurBC = texNombre(figure.ad, 1)
  let consigne = ''
  switch (figure.type) {
    case 'Carré':
      consigne = `Construire le carré $${A}${B}${C}${D}$ de côté $${longueurAB}\\text{ cm}$, puis coder les côtés de même longueur et les angles droits.`
      break
    case 'Rectangle':
      consigne = `Construire le rectangle $${A}${B}${C}${D}$ tel que $${A}${B}=${longueurAB}\\text{ cm}$ et $${B}${C}=${longueurBC}\\text{ cm}$, puis coder les côtés de même longueur et les angles droits.`
      break
    case 'Losange':
      consigne = `Construire le losange $${A}${B}${C}${D}$ de côté $${longueurAB}\\text{ cm}$, puis coder les côtés de même longueur.`
      break
  }
  if (!interactif) return consigne
  return `${consigne}<br>Le polygone devra être tracé avec l'instruction «${sp()}Tracer un polygone${sp()}».`
}

/**
 * @author Jean-Claude Lhote
 */
export default class ConstruireQuadrilatereAuxInstruments extends Exercice {
  constructor() {
    super()
    // La réponse attendue est une construction géométrique.
    this.reponseCourteDisponible = false
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.besoinFormulaireTexte = [
      'Type de figure',
      [
        'Nombres séparés par des tirets  :',
        '1 : Carré',
        '2 : Rectangle',
        '3 : Losange',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    const typeFigure = choisirTypeFigure(this.sup)
    const figure = creerFigure(typeFigure)
    const sortieStatique = !context.isHtml || context.isTypst
    if (!this.interactif && sortieStatique) {
      this.listeQuestions[0] = enonceFigure(figure, false)
      this.listeCorrections[0] = figureCorrection(figure)
      listeQuestionsToContenu(this)
      return
    }
    const programmeAttendu = programmeConstruction(figure)
    const instructionsDisponibles: TypeInstructionIep[] = [
      'pointLibre',
      'pointADistanceLibre',
      'pointSurObjetADistance',
      'segment',
      'droite',
      'polygone',
      'perpendiculaireAObjet',
      'paralleleAObjet',
      'intersection',
      'cercle',
      'cercleRayon',
      'reporterLongueurCompas',
      'segmentCodage',
      'codageAngleDroit',
    ]
    if (this.interactif) {
      const editeur = addEditeurIep(this, 0, {
        instructionsDisponibles,
        programmeAttendu,
        verifyCallbackName: VERIFICATION_QUADRILATERE_INSTRUMENTS_CALLBACK_NAME,
        pointsMax: POINTS_QUESTION,
        sansOutils: true,
        clavier: [
          ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', ','],
          [...figure.noms],
        ],
      })
      handleAnswers(
        this,
        0,
        {
          reponse: {
            value: JSON.stringify({
              type: figure.type,
              noms: figure.noms,
              programme: programmeAttendu,
            } satisfies ReponseAttendue),
          },
        },
        { formatInteractif: 'alea-iep-editeur' },
      )
      this.listeQuestions[0] = `${enonceFigure(figure, true)}<br>${editeur}`
    } else {
      this.listeQuestions[0] = enonceFigure(figure, false)
    }
    const correction = addEditeurIep(this, 0, {
      id: `IepEditeur-corr-Ex${this.numeroExercice}Q0`,
      interactivityOn: false,
      masquerProgramme: !this.interactif,
      programmeInitial: programmeAttendu,
      instructionsDisponibles,
      sansOutils: true,
    })
    this.listeCorrections[0] = this.interactif
      ? `Voici une construction possible :<br>${correction}`
      : correction
    listeQuestionsToContenu(this)
  }
}
