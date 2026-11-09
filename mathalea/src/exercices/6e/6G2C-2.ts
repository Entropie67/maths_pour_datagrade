import {
  addEditeurIep,
  addFigureEnonceIep,
  ElementIepEditeur,
  pointsConstruitsDepuisProgramme,
  type ElementIepVerificationCallback,
  type InstructionIep,
  type TypeInstructionIep,
} from '../../lib/customElements/ElementIepEditeur'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sortRandomlyLikeV8 } from '../../lib/outils/arrayOutils'

export const interactifReady = true
export const dateDePublication = '22/08/2026'

export const titre = 'Reporter un périmètre au compas'
export const dateDeModifImportante = '14/10/2026'

export const uuid = 'd7c5c'

export const refs = {
  'fr-fr': ['6G2C-2', '6AutoG2-3'],
  'fr-2016': [],
  'fr-ch': ['PRQES02C-9', '9R1ES7B-4', '9R2ES7B-4', '9R3ES7B-4'],
}

type PointIEP = {
  nom: string
  x: number
  y: number
}
type PolyIEP = PointIEP[]
type FormeIep = {
  points: PolyIEP
  sommets: string
  fermee: boolean
}

const EPSILON_LONGUEUR = 0.25
const EPSILON_ALIGNEMENT = 0.1

const formes = [
  'Carré',
  'Rectangle',
  'Triangle',
  'Quadrilatère quelconque',
  'Ligne brisée',
] as const

function tourneEtPlace(points: PolyIEP): PolyIEP {
  const angle = (randint(0, 359) * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const centre = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 },
  )
  centre.x /= points.length
  centre.y /= points.length
  return points.map((point) => {
    const x = point.x - centre.x
    const y = point.y - centre.y
    return {
      nom: point.nom,
      x: Number((4 + x * cos - y * sin).toFixed(2)),
      y: Number((4 + x * sin + y * cos).toFixed(2)),
    }
  })
}

function creerForme(typeForme: (typeof formes)[number]): FormeIep {
  let points: PolyIEP
  switch (typeForme) {
    case 'Carré': {
      const c = randint(20, 30) / 10
      points = [
        { nom: 'B', x: 0, y: 0 },
        { nom: 'C', x: c, y: 0 },
        { nom: 'D', x: c, y: c },
        { nom: 'E', x: 0, y: c },
      ]
      break
    }
    case 'Rectangle': {
      const longueur = randint(35, 48) / 10
      const largeur = randint(15, 24) / 10
      points = [
        { nom: 'B', x: 0, y: 0 },
        { nom: 'C', x: longueur, y: 0 },
        { nom: 'D', x: longueur, y: largeur },
        { nom: 'E', x: 0, y: largeur },
      ]
      break
    }
    case 'Triangle': {
      const base = randint(35, 50) / 10
      const hauteur = randint(25, 40) / 10
      const decalageSommet = randint(10, Math.round(base * 10) - 10) / 10
      points = [
        { nom: 'B', x: 0, y: 0 },
        { nom: 'C', x: base, y: 0 },
        { nom: 'D', x: decalageSommet, y: hauteur },
      ]
      break
    }
    case 'Quadrilatère quelconque': {
      const largeur = randint(35, 45) / 10
      const hauteur = randint(20, 30) / 10
      points = [
        { nom: 'B', x: 0, y: 0 },
        { nom: 'C', x: largeur, y: randint(-5, 5) / 10 },
        { nom: 'D', x: largeur - randint(8, 18) / 10, y: hauteur },
        { nom: 'E', x: randint(-5, 8) / 10, y: hauteur - randint(0, 8) / 10 },
      ]
      break
    }
    case 'Ligne brisée': {
      const longueurs = sortRandomlyLikeV8([
        randint(18, 24),
        randint(25, 29),
        randint(30, 34),
        randint(35, 39),
      ]).map((longueur) => longueur / 10)
      const angle1 = randint(30, 90)
      const angle2 = randint(30, 90)
      const signe = randint(0, 1) === 0 ? -1 : 1
      const directions = [0, signe * angle1, 0, -signe * angle2]
      points = [{ nom: 'B', x: 0, y: 0 }]
      for (let i = 0; i < 4; i++) {
        const precedent = points[i]
        const angleRad = (directions[i] * Math.PI) / 180
        points.push({
          nom: lettreDepuisChiffre(3 + i),
          x: precedent.x + longueurs[i] * Math.cos(angleRad),
          y: precedent.y + longueurs[i] * Math.sin(angleRad),
        })
      }
      break
    }
  }
  const pointsTournes = tourneEtPlace(points)
  return {
    points: pointsTournes,
    sommets: pointsTournes.map((point) => point.nom).join(','),
    fermee: typeForme !== 'Ligne brisée',
  }
}

function codagesForme(typeForme: (typeof formes)[number]): InstructionIep[] {
  switch (typeForme) {
    case 'Carré':
      return [
        { type: 'segmentCodage', p1: 'B', p2: 'C', codage: '/' },
        { type: 'segmentCodage', p1: 'C', p2: 'D', codage: '/' },
        { type: 'segmentCodage', p1: 'D', p2: 'E', codage: '/' },
        { type: 'segmentCodage', p1: 'E', p2: 'B', codage: '/' },
        { type: 'codageAngleDroit', p1: 'B', p2: 'C', p3: 'D' },
      ]
    case 'Rectangle':
      return [
        { type: 'segmentCodage', p1: 'B', p2: 'C', codage: '/' },
        { type: 'segmentCodage', p1: 'D', p2: 'E', codage: '/' },
        { type: 'segmentCodage', p1: 'C', p2: 'D', codage: '//' },
        { type: 'segmentCodage', p1: 'E', p2: 'B', codage: '//' },
        { type: 'codageAngleDroit', p1: 'B', p2: 'C', p3: 'D' },
      ]
    case 'Triangle':
    case 'Quadrilatère quelconque':
    case 'Ligne brisée':
      return []
  }
}

const VERIFICATION_REPORTER_PERIMETRE_CALLBACK_NAME =
  'verification-finale-reporter-perimetre-au-compas-v2'

function distance(A: PointIEP, B: PointIEP) {
  return Math.hypot(B.x - A.x, B.y - A.y)
}

function pointDansDirection(A: PointIEP, angle: number) {
  const angleRad = (angle * Math.PI) / 180
  return { x: A.x + Math.cos(angleRad), y: A.y + Math.sin(angleRad) }
}

function pointSurDemiDroite(point: PointIEP, origine: PointIEP, angle: number) {
  const direction = pointDansDirection(origine, angle)
  const ux = direction.x - origine.x
  const uy = direction.y - origine.y
  const vx = point.x - origine.x
  const vy = point.y - origine.y
  const produitVectoriel = ux * vy - uy * vx
  const produitScalaire = ux * vx + uy * vy
  return (
    Math.abs(produitVectoriel) <= EPSILON_ALIGNEMENT &&
    produitScalaire >= -EPSILON_ALIGNEMENT
  )
}

function longueurFormeInitiale(
  programme: InstructionIep[],
  points: Map<string, PointIEP>,
) {
  const polygone = programme.find(
    (instruction) => instruction.type === 'polygoneRapide',
  )
  if (polygone?.type === 'polygoneRapide') {
    const sommets = polygone.sommets
      .split(/[,;\s]+/)
      .map((sommet) => sommet.trim())
      .filter((sommet) => sommet !== '')
    if (sommets.length < 3) return undefined
    let perimetre = 0
    for (let i = 0; i < sommets.length; i++) {
      const A = points.get(sommets[i])
      const B = points.get(sommets[(i + 1) % sommets.length])
      if (A === undefined || B === undefined) return undefined
      perimetre += distance(A, B)
    }
    return perimetre
  }
  const traits = programme.filter((instruction) => instruction.type === 'trait')
  if (traits.length === 0) return undefined
  let longueurTotale = 0
  for (const trait of traits) {
    if (trait.type !== 'trait') continue
    const A = points.get(trait.p1)
    const B = points.get(trait.p2)
    if (A === undefined || B === undefined) return undefined
    longueurTotale += distance(A, B)
  }
  return longueurTotale
}

function demiDroiteInitiale(
  programme: InstructionIep[],
  points: Map<string, PointIEP>,
) {
  const instruction = programme.find(
    (instruction) => instruction.type === 'demiDroitePointDirection',
  )
  if (instruction?.type !== 'demiDroitePointDirection') return undefined
  const origine = points.get(instruction.p1)
  const angle = Number(instruction.angle)
  if (origine === undefined || Number.isNaN(angle)) return undefined
  return { origine, angle }
}

export const verifierReportPerimetreAuCompas: ElementIepVerificationCallback =
  ({ studentProgram, editor }) => {
    const conditionsInitiales = JSON.parse(
      editor.getAttribute('conditions-initiales') ?? '[]',
    ) as InstructionIep[]
    const pointsInitiaux = pointsConstruitsDepuisProgramme(
      conditionsInitiales,
    ) as Map<string, PointIEP>
    const points = pointsConstruitsDepuisProgramme(studentProgram) as Map<
      string,
      PointIEP
    >
    const longueurTotale = longueurFormeInitiale(
      conditionsInitiales,
      pointsInitiaux,
    )
    const demiDroite = demiDroiteInitiale(conditionsInitiales, pointsInitiaux)
    if (longueurTotale === undefined || demiDroite === undefined) {
      return {
        isOk: false,
        feedback: 'La figure initiale est incomplète.',
        score: { nbBonnesReponses: 0, nbReponses: 4 },
      }
    }

    // Quatre critères indépendants, quel que soit le nombre de côtés tiré.
    const pointsRapportes = [...points.entries()]
      .filter(
        ([nom, point]) =>
          !pointsInitiaux.has(nom) &&
          pointSurDemiDroite(point, demiDroite.origine, demiDroite.angle),
      )
      .map(([, point]) => point)
    const longueurReportee = pointsRapportes.some(
      (point) =>
        Math.abs(distance(demiDroite.origine, point) - longueurTotale) <=
        EPSILON_LONGUEUR,
    )
    const segments = studentProgram
      .filter((instruction) => instruction.type === 'segment')
      .flatMap((instruction) => {
        const A = points.get(instruction.p1)
        const B = points.get(instruction.p2)
        return A === undefined || B === undefined
          ? []
          : [{ A, B, couleur: instruction.couleur }]
      })
    const surSupport = ({ A, B }: (typeof segments)[number]) =>
      distance(A, B) > EPSILON_ALIGNEMENT &&
      pointSurDemiDroite(A, demiDroite.origine, demiDroite.angle) &&
      pointSurDemiDroite(B, demiDroite.origine, demiDroite.angle)
    const bonneLongueur = ({ A, B }: (typeof segments)[number]) =>
      Math.abs(distance(A, B) - longueurTotale) <= EPSILON_LONGUEUR
    const segmentCorrect = segments.some(
      (segment) =>
        surSupport(segment) &&
        bonneLongueur(segment) &&
        segment.couleur === 'blue',
    )
    const criteres = [
      longueurReportee || segmentCorrect,
      segments.some(surSupport),
      segments.some(bonneLongueur),
      segments.some(
        (segment) =>
          surSupport(segment) &&
          bonneLongueur(segment) &&
          segment.couleur === 'blue',
      ),
    ]
    const nbBonnesReponses = criteres.filter(Boolean).length
    // Un seul message, celui de la première étape à reprendre.
    const bonSegmentNonBleu = segments.some(
      (segment) => surSupport(segment) && bonneLongueur(segment),
    )
    let feedback =
      'Bravo, la longueur totale est bien reportée sur la demi-droite.'
    if (!segmentCorrect) {
      if (bonSegmentNonBleu) {
        feedback = 'Le segment est bien placé : le tracer en bleu.'
      } else if (!longueurReportee) {
        feedback =
          'Reporter les longueurs des côtés les unes après les autres sur la demi-droite, en partant de A.'
      } else {
        feedback =
          'Tracer en bleu le segment qui va de A au dernier point obtenu sur la demi-droite.'
      }
    }
    return {
      isOk: segmentCorrect,
      score: { nbBonnesReponses, nbReponses: 4 },
      feedback,
    }
  }

ElementIepEditeur.registerVerificationCallback(
  VERIFICATION_REPORTER_PERIMETRE_CALLBACK_NAME,
  verifierReportPerimetreAuCompas,
)

/**
 * @author: Jean-Claude Lhote
 */
export default class ReporterPerimetreAuCompas extends Exercice {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.titre = 'Reporter un périmètre au compas'
    this.nbQuestions = 1
    this.comment =
      'En interactif, la construction est notée sur 4 points : un point pour la longueur totale reportée sur la demi-droite, un pour un segment tracé sur la demi-droite, un pour un segment de la bonne longueur et un pour ce segment tracé en bleu. Les reports intermédiaires des côtés ne rapportent pas de point à eux seuls.'
    this.nbQuestionsModifiable = false
    this.sup = '6'
    this.besoinFormulaireTexte = [
      'Type de figure',
      'Nombres séparés par des tirets :\n' +
        formes.map((f, index) => `${index + 1} : ${f}`).join('\n') +
        '\n6 : Mélange',
    ]
  }
  nouvelleVersion() {
    const [typeForme] = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: formes.length,
      melange: 6,
      defaut: 6,
      nbQuestions: 1,
    }).map(Number)
    const f = formes[typeForme - 1]
    const forme = creerForme(f)
    const conditionsInitiales: InstructionIep[] = []
    conditionsInitiales.push(
      ...forme.points.map((point): InstructionIep => ({
        type: 'point',
        nom: point.nom,
        x: point.x,
        y: point.y,
      })),
      ...codagesForme(f),
      { type: 'point', nom: 'A', x: -5, y: 0 },
    )
    if (forme.fermee) {
      conditionsInitiales.splice(forme.points.length, 0, {
        type: 'polygoneRapide',
        sommets: forme.sommets,
        couleur: 'gray',
      })
    } else {
      conditionsInitiales.splice(
        forme.points.length,
        0,
        ...forme.points.slice(0, -1).map((point, index): InstructionIep => ({
          type: 'trait',
          p1: point.nom,
          p2: forme.points[index + 1].nom,
        })),
      )
    }
    const etapeDemiDroite = conditionsInitiales.length
    conditionsInitiales.push({
      type: 'demiDroitePointDirection',
      p1: 'A',
      angle: 0.5,
      couleur: 'gray',
    })
    conditionsInitiales.push({
      type: 'prolongerObjet',
      etape: etapeDemiDroite,
      longueur: 20,
      couleur: 'gray',
    })
    const instructionsDisponibles: TypeInstructionIep[] = [
      'reporterLongueurCompas',
      'intersection',
      'segment',
    ]
    const programmeAttendu: InstructionIep[] = []
    let prochainIndexProgrammeComplet = conditionsInitiales.length
    let pointDepartReport = 'A'
    const nombreSegments = forme.fermee
      ? forme.points.length
      : forme.points.length - 1
    for (let i = 0; i < nombreSegments; i++) {
      const A = forme.points[i]
      const B = forme.points[(i + 1) % forme.points.length]
      const etapeArc = prochainIndexProgrammeComplet
      programmeAttendu.push({
        type: 'reporterLongueurCompas',
        p1: A.nom,
        p2: B.nom,
        p3: pointDepartReport,
        angle: 0.5,
      })
      prochainIndexProgrammeComplet++
      pointDepartReport = lettreDepuisChiffre(2 + forme.points.length + i)
      programmeAttendu.push({
        type: 'intersection',
        etape1: etapeDemiDroite,
        etape2: etapeArc,
        nom: pointDepartReport,
        choix: 1,
      })
      prochainIndexProgrammeComplet++
    }
    programmeAttendu.push({
      type: 'segment',
      p1: 'A',
      p2: pointDepartReport,
      couleur: 'blue',
    })
    this.listeCorrections[0] = `Voici un programme de construction de la forme demandée :<br>
        ${addEditeurIep(this, 0, {
          id: `IepEditeur-corr-Ex${this.numeroExercice}Q0`,
          conditionsInitiales,
          interactivityOn: false,
          programmeInitial: programmeAttendu,
          instructionsDisponibles,
          tailleLabelsPoints: 11,
          masquerEtapesInitiales: true,
          sansOutils: true,
          directionReportCompas: 0.5,
        })}`
    let figureOuEditeur: string
    if (this.interactif) {
      figureOuEditeur = addEditeurIep(this, 0, {
        conditionsInitiales,
        instructionsDisponibles,
        programmeAttendu,
        tailleLabelsPoints: 12,
        masquerEtapesInitiales: true,
        sansOutils: true,
        directionReportCompas: 0.5,
        pointsMax: 4,
        verifyCallbackName: VERIFICATION_REPORTER_PERIMETRE_CALLBACK_NAME,
      })
      handleAnswers(
        this,
        0,
        {
          reponse: { value: JSON.stringify(programmeAttendu) },
        },
        { formatInteractif: 'alea-iep-editeur' },
      )
    } else {
      figureOuEditeur = addFigureEnonceIep({
        conditionsInitiales,
        programmeAttendu,
      })
    }
    this.listeQuestions[0] =
      f === 'Ligne brisée'
        ? `Reporter la longueur totale de la ligne brisée sur la demi-droite ci-dessous, puis tracer un segment de cette longueur en bleu.<br>${figureOuEditeur}`
        : `Reporter le périmètre du ${f.toLowerCase()} sur la demi-droite ci-dessous, puis tracer un segment de cette longueur en bleu.<br>${figureOuEditeur}`
  }
}
