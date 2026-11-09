import {
  addEditeurIep,
  ElementIepEditeur,
  pointsConstruitsDepuisProgramme,
  type ElementIepVerificationCallback,
  type InstructionIep,
  type TypeInstructionIep,
} from '../../lib/customElements/ElementIepEditeur'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { shuffle } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Construire un triangle avec l'éditeur Instrumenpoche"

export const interactifReady = true
export const dateDePublication = '23/08/2026'
export const uuid = 'f7a61'

export const refs = {
  'fr-fr': ['6G6A-7', '6AutoG2-4'],
  'fr-2016': [],
  'fr-ch': ['9R1ES2B-12', '9R2ES2B-12', '9R3ES2B-12'],
}

type PointIEP = {
  nom: string
  x: number
  y: number
}

type TriangleAConstruire = {
  typeQuestion: number
  sommets: [string, string, string]
  points: [PointIEP, PointIEP, PointIEP]
  longueurs: {
    AB: number
    BC: number
    AC: number
  }
  angleDroitEn?: string
  hypotenuseDonnee?: boolean
  enonce: string
}

type ReponseAttendue = {
  sommets: [string, string, string]
  longueurs: {
    AB: number
    BC: number
    AC: number
  }
  angleDroitEn?: string
}

const EPSILON_LONGUEUR = 0.25
const EPSILON_ANGLE_DROIT = 0.08

const VERIFICATION_TRIANGLE_INSTRUMENTS_CALLBACK_NAME =
  'verification-construction-triangle-instruments'

function distance(A: PointIEP, B: PointIEP): number {
  return Math.hypot(B.x - A.x, B.y - A.y)
}

function pointDepuis(
  A: PointIEP,
  longueur: number,
  angleDegres: number,
  nom: string,
): PointIEP {
  const angle = (angleDegres * Math.PI) / 180
  return {
    nom,
    x: Number((A.x + longueur * Math.cos(angle)).toFixed(2)),
    y: Number((A.y + longueur * Math.sin(angle)).toFixed(2)),
  }
}

function produitScalaire(A: PointIEP, B: PointIEP, C: PointIEP): number {
  return (A.x - B.x) * (C.x - B.x) + (A.y - B.y) * (C.y - B.y)
}

function angleDroit(A: PointIEP, B: PointIEP, C: PointIEP): boolean {
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
    const sommets = instruction.sommets
      .split(/[,;\s]+/)
      .map((sommet) => sommet.trim())
      .filter((sommet) => sommet !== '')
    return sommets.some((sommet, index) => {
      const suivant = sommets[(index + 1) % sommets.length]
      return (
        (sommet === p1 && suivant === p2) || (sommet === p2 && suivant === p1)
      )
    })
  })
}

function lireReponseAttendue(
  expectedRaw: unknown,
): ReponseAttendue | undefined {
  if (typeof expectedRaw !== 'string') return undefined
  try {
    const parsed = JSON.parse(expectedRaw)
    if (
      parsed == null ||
      !Array.isArray(parsed.sommets) ||
      parsed.sommets.length !== 3 ||
      parsed.longueurs == null
    ) {
      return undefined
    }
    return parsed as ReponseAttendue
  } catch {
    return undefined
  }
}

const verifierConstructionTriangle: ElementIepVerificationCallback = ({
  studentProgram,
  expectedRaw,
}) => {
  const attendu = lireReponseAttendue(expectedRaw)
  if (attendu === undefined) {
    return { isOk: false, feedback: 'Réponse attendue invalide.' }
  }
  const points = pointsConstruitsDepuisProgramme(studentProgram) as Map<
    string,
    PointIEP
  >
  const [nomA, nomB, nomC] = attendu.sommets
  const A = points.get(nomA)
  const B = points.get(nomB)
  const C = points.get(nomC)
  if (A === undefined || B === undefined || C === undefined) {
    return {
      isOk: false,
      feedback: `Les points ${attendu.sommets.join(', ')} doivent être construits et nommés correctement.`,
    }
  }
  const longueursOk =
    Math.abs(distance(A, B) - attendu.longueurs.AB) <= EPSILON_LONGUEUR &&
    Math.abs(distance(B, C) - attendu.longueurs.BC) <= EPSILON_LONGUEUR &&
    Math.abs(distance(A, C) - attendu.longueurs.AC) <= EPSILON_LONGUEUR
  if (!longueursOk) {
    return {
      isOk: false,
      feedback:
        'Les longueurs du triangle ne correspondent pas aux mesures demandées.',
    }
  }
  if (attendu.angleDroitEn != null) {
    const angleOk =
      (attendu.angleDroitEn === nomA && angleDroit(B, A, C)) ||
      (attendu.angleDroitEn === nomB && angleDroit(A, B, C)) ||
      (attendu.angleDroitEn === nomC && angleDroit(A, C, B))
    if (!angleOk) {
      return {
        isOk: false,
        feedback: `Le triangle doit être rectangle en ${attendu.angleDroitEn}.`,
      }
    }
  }
  if (
    !segmentTrace(studentProgram, nomA, nomB) ||
    !segmentTrace(studentProgram, nomB, nomC) ||
    !segmentTrace(studentProgram, nomA, nomC)
  ) {
    return {
      isOk: false,
      feedback: 'Les trois côtés du triangle doivent être tracés.',
    }
  }
  return {
    isOk: true,
    feedback: 'Bravo, le triangle est correctement construit.',
  }
}

ElementIepEditeur.registerVerificationCallback(
  VERIFICATION_TRIANGLE_INSTRUMENTS_CALLBACK_NAME,
  verifierConstructionTriangle,
)

function typesDisponiblesDepuisSup(sup: number): number[] {
  switch (sup) {
    case 1:
      return [1]
    case 2:
      return [2]
    case 3:
      return [3]
    case 4:
      return [4]
    case 5:
      return [5]
    case 6:
      return [6]
    case 7:
      return [7]
    case 8:
      return [1, 2, 3, 4, 5, 6, 7]
    default:
      return [1, 2, 3, 4, 5, 6, 7]
  }
}

function longueursTriangleTroisCotes() {
  const AC = arrondi(randint(35, 45) / 10)
  const BC = arrondi(randint(35, 45, Math.round(AC * 10)) / 10)
  const AB = arrondi(randint(46, 60) / 10)
  return { AB, BC, AC }
}

function longueursTriangleAuto() {
  const AB = arrondi((randint(2, 5) * 20) / 10)
  const BC = arrondi(randint(30, 80, Math.round(AB * 10)) / 10)
  const min = Math.max(Math.abs(AB - BC) + 2, 3)
  const max = Math.min(AB + BC - 2, 15)
  const AC = arrondi(randint(Math.ceil(min * 10), Math.floor(max * 10)) / 10)
  return { AB, BC, AC }
}

function longueursTriangleIsocele() {
  const AB = arrondi((randint(20, 50) * 2) / 10)
  const BC = arrondi(randint(Math.round((AB / 2 + 2) * 10), 80) / 10)
  return { AB, BC, AC: BC }
}

function longueursTriangleRectangleAvecHypotenuse() {
  const AB = arrondi(randint(46, 60) / 10)
  const AC = arrondi(randint(70, 80) / 10)
  const BC = arrondi(Math.sqrt(AC * AC - AB * AB))
  return { AB, BC, AC }
}

function longueursTriangleRectangleAvecHypotenuseAuto() {
  const AB = arrondi((randint(20, 50) * 2) / 10)
  const BC = arrondi(randint(Math.round((AB + 1) * 10), 120) / 10)
  const AC = arrondi(Math.sqrt(BC * BC - AB * AB))
  return { AB, BC, AC }
}

function longueursTriangleRectangleSansHypotenuseAuto() {
  const AB = arrondi((randint(20, 50) * 2) / 10)
  const AC = arrondi(randint(30, 80, Math.round(AB * 10)) / 10)
  const BC = arrondi(Math.sqrt(AB * AB + AC * AC))
  return { AB, BC, AC }
}

function longueursTriangleEquilateral() {
  const AB = arrondi((randint(20, 60) * 2) / 10)
  return { AB, BC: AB, AC: AB }
}

function creerTriangleDepuisLongueurs(
  typeQuestion: number,
  sommets: [string, string, string],
  longueurs: { AB: number; BC: number; AC: number },
  angleDroitEn?: string,
  hypotenuseDonnee = false,
): TriangleAConstruire {
  const angleBase = randint(-15, 15)
  const A: PointIEP = { nom: sommets[0], x: 1, y: 1 }
  const B = pointDepuis(A, longueurs.AB, angleBase, sommets[1])
  let C: PointIEP
  if (angleDroitEn === sommets[0]) {
    C = pointDepuis(A, longueurs.AC, angleBase + 90, sommets[2])
  } else if (angleDroitEn === sommets[1]) {
    C = pointDepuis(B, longueurs.BC, angleBase + 90, sommets[2])
  } else {
    const projection =
      (longueurs.AB ** 2 + longueurs.AC ** 2 - longueurs.BC ** 2) /
      (2 * longueurs.AB)
    const hauteur = Math.sqrt(Math.max(0, longueurs.AC ** 2 - projection ** 2))
    const angleSommet = (Math.atan2(hauteur, projection) * 180) / Math.PI
    C = pointDepuis(A, longueurs.AC, angleBase + angleSommet, sommets[2])
  }
  return {
    typeQuestion,
    sommets,
    points: [A, B, C],
    longueurs,
    angleDroitEn,
    hypotenuseDonnee,
    enonce: enonceTriangle(
      typeQuestion,
      sommets,
      longueurs,
      angleDroitEn,
      hypotenuseDonnee,
    ),
  }
}

function enonceTriangle(
  typeQuestion: number,
  [A, B, C]: [string, string, string],
  longueurs: { AB: number; BC: number; AC: number },
  angleDroitEn?: string,
  hypotenuseDonnee = false,
) {
  if (typeQuestion === 4) {
    return `Construire aux instruments le triangle $${A}${B}${C}$ isocèle en $${C}$ tel que $${A}${B}=${texNombre(longueurs.AB)}\\text{ cm}$ et $${B}${C}=${texNombre(longueurs.BC)}\\text{ cm}$.`
  }
  if (typeQuestion === 7) {
    return `Construire aux instruments le triangle $${A}${B}${C}$ équilatéral tel que $${A}${B}=${texNombre(longueurs.AB)}\\text{ cm}$.`
  }
  if (angleDroitEn != null) {
    const donnees = hypotenuseDonnee
      ? `$${A}${B}=${texNombre(longueurs.AB)}\\text{ cm}$ et $${B}${C}=${texNombre(longueurs.BC)}\\text{ cm}$`
      : `$${A}${B}=${texNombre(longueurs.AB)}\\text{ cm}$ et $${A}${C}=${texNombre(longueurs.AC)}\\text{ cm}$`
    return `Construire aux instruments le triangle $${A}${B}${C}$ rectangle en $${angleDroitEn}$ avec ${donnees}.`
  }
  return `Construire aux instruments le triangle $${A}${B}${C}$ tel que $${A}${B}=${texNombre(longueurs.AB)}\\text{ cm}$, $${B}${C}=${texNombre(longueurs.BC)}\\text{ cm}$ et $${A}${C}=${texNombre(longueurs.AC)}\\text{ cm}$.`
}

function creerTriangle(typeQuestion: number): TriangleAConstruire {
  const nom = creerNomDePolygone(4, [])
  const noms = shuffle([nom[0], nom[1], nom[2]]) as [string, string, string]
  switch (typeQuestion) {
    case 2: {
      const longueurs = longueursTriangleRectangleAvecHypotenuse()
      return creerTriangleDepuisLongueurs(
        typeQuestion,
        noms,
        longueurs,
        noms[1],
      )
    }
    case 3:
      return creerTriangleDepuisLongueurs(
        typeQuestion,
        noms,
        longueursTriangleAuto(),
      )
    case 4:
      return creerTriangleDepuisLongueurs(
        typeQuestion,
        noms,
        longueursTriangleIsocele(),
      )
    case 5: {
      const longueurs = longueursTriangleRectangleAvecHypotenuseAuto()
      return creerTriangleDepuisLongueurs(
        typeQuestion,
        noms,
        longueurs,
        noms[0],
        true,
      )
    }
    case 6: {
      const longueurs = longueursTriangleRectangleSansHypotenuseAuto()
      return creerTriangleDepuisLongueurs(
        typeQuestion,
        noms,
        longueurs,
        noms[0],
      )
    }
    case 7:
      return creerTriangleDepuisLongueurs(
        typeQuestion,
        noms,
        longueursTriangleEquilateral(),
      )
    case 1:
    default:
      return creerTriangleDepuisLongueurs(
        typeQuestion,
        noms,
        longueursTriangleTroisCotes(),
      )
  }
}

function programmeConstruction(
  triangle: TriangleAConstruire,
): InstructionIep[] {
  const [A, B, C] = triangle.sommets
  const angleAB =
    (Math.atan2(
      triangle.points[1].y - triangle.points[0].y,
      triangle.points[1].x - triangle.points[0].x,
    ) *
      180) /
    Math.PI
  const programme: InstructionIep[] = [
    {
      type: 'point',
      nom: A,
      x: triangle.points[0].x,
      y: triangle.points[0].y,
    },
    {
      type: 'pointADistance',
      nom: B,
      p1: A,
      distance: Number(triangle.longueurs.AB.toFixed(2)),
      angle: Number(angleAB.toFixed(1)),
    },
    { type: 'segment', p1: A, p2: B },
  ]
  if (triangle.angleDroitEn === A) {
    if (triangle.hypotenuseDonnee) {
      programme.push(
        { type: 'perpendiculaireAObjet', etape: 2, p1: A },
        {
          type: 'cercleRayon',
          p1: B,
          r: Number(triangle.longueurs.BC.toFixed(2)),
        },
        { type: 'intersection', etape1: 3, etape2: 4, nom: C, choix: 1 },
        { type: 'segment', p1: A, p2: C },
        { type: 'segment', p1: B, p2: C },
        { type: 'codageAngleDroit', p1: B, p2: A, p3: C },
      )
    } else {
      programme.push(
        { type: 'perpendiculaireAObjet', etape: 2, p1: A },
        {
          type: 'cercleRayon',
          p1: A,
          r: Number(triangle.longueurs.AC.toFixed(2)),
        },
        { type: 'intersection', etape1: 3, etape2: 4, nom: C, choix: 1 },
        { type: 'segment', p1: A, p2: C },
        { type: 'segment', p1: B, p2: C },
        { type: 'codageAngleDroit', p1: B, p2: A, p3: C },
      )
    }
  } else if (triangle.angleDroitEn === B) {
    programme.push(
      { type: 'perpendiculaireAObjet', etape: 2, p1: B },
      {
        type: 'cercleRayon',
        p1: A,
        r: Number(triangle.longueurs.AC.toFixed(2)),
      },
      { type: 'intersection', etape1: 3, etape2: 4, nom: C, choix: 1 },
      { type: 'segment', p1: A, p2: C },
      { type: 'segment', p1: B, p2: C },
      { type: 'codageAngleDroit', p1: A, p2: B, p3: C },
    )
  } else {
    programme.push(
      {
        type: 'cercleRayon',
        p1: A,
        r: Number(triangle.longueurs.AC.toFixed(2)),
      },
      {
        type: 'cercleRayon',
        p1: B,
        r: Number(triangle.longueurs.BC.toFixed(2)),
      },
      { type: 'intersection', etape1: 3, etape2: 4, nom: C, choix: 1 },
      { type: 'segment', p1: A, p2: C },
      { type: 'segment', p1: B, p2: C },
    )
  }
  if (triangle.typeQuestion === 4 || triangle.typeQuestion === 7) {
    programme.push(
      { type: 'segmentCodage', p1: A, p2: C, codage: '/' },
      { type: 'segmentCodage', p1: B, p2: C, codage: '/' },
    )
    if (triangle.typeQuestion === 7) {
      programme.push({ type: 'segmentCodage', p1: A, p2: B, codage: '/' })
    }
  }
  return programme
}

/**
 * @author Jean-Claude Lhote
 */
export default class ConstruireUnTriangleEditeurIep extends Exercice {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.besoinFormulaireNumerique = [
      'Type de constructions',
      8,
      '1 : Trois longueurs\n2 : Angle droit et deux longueurs\n3 : Trois longueurs\n4 : Isocèle avec deux longueurs\n5 : Rectangle avec deux longueurs dont hypoténuse\n6 : Rectangle avec deux longueurs sans hypoténuse\n7 : Equilatéral\n8 : Aléatoire',
    ]
    this.sup = 8
  }

  nouvelleVersion() {
    const types = typesDisponiblesDepuisSup(this.sup)
    const typeQuestion = types[randint(0, types.length - 1)]
    const triangle = creerTriangle(typeQuestion)
    const programmeAttendu = programmeConstruction(triangle)
    const instructionsDisponibles: TypeInstructionIep[] = [
      'point',
      'pointADistance',
      'segment',
      'cercleRayon',
      'intersection',
      'perpendiculaireAObjet',
      'segmentCodage',
      'codageAngleDroit',
    ]
    const editeur = addEditeurIep(this, 0, {
      sansOutils: true,
      instructionsDisponibles,
      programmeAttendu,
      tailleLabelsPoints: 12,
      verifyCallbackName: VERIFICATION_TRIANGLE_INSTRUMENTS_CALLBACK_NAME,
    })
    handleAnswers(
      this,
      0,
      {
        reponse: {
          value: JSON.stringify({
            sommets: triangle.sommets,
            longueurs: triangle.longueurs,
            angleDroitEn: triangle.angleDroitEn,
          } satisfies ReponseAttendue),
        },
      },
      { formatInteractif: 'alea-iep-editeur' },
    )
    this.listeQuestions[0] = `${triangle.enonce}<br>${editeur}`
    this.listeCorrections[0] = `Voici une construction possible :<br>${addEditeurIep(
      this,
      0,
      {
        id: `IepEditeur-corr-Ex${this.numeroExercice}Q0`,
        interactivityOn: false,
        programmeInitial: programmeAttendu,
        sansOutils: true,
        instructionsDisponibles,
        tailleLabelsPoints: 12,
      },
    )}`
  }
}
