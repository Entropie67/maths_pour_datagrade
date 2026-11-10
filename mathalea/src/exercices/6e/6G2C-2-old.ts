// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid ec9ef continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import {
  addEditeurIep,
  ElementIepEditeur,
  pointsConstruitsDepuisProgramme,
  type ElementIepVerificationCallback,
  type InstructionIep,
  type TypeInstructionIep,
} from '../../lib/customElements/ElementIepEditeur'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sortRandomlyLikeV8 } from '../../lib/outils/arrayOutils'

export const interactifReady = true
export const dateDePublication = '22/08/2026'

export const titre = 'Reporter un périmètre au compas'
export const uuid = 'ec9ef'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
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
  'verification-finale-reporter-perimetre-au-compas'

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

const verifierReportPerimetreAuCompas: ElementIepVerificationCallback = ({
  studentProgram,
}) => {
  const points = pointsConstruitsDepuisProgramme(studentProgram) as Map<
    string,
    PointIEP
  >
  const longueurTotale = longueurFormeInitiale(studentProgram, points)
  const demiDroite = demiDroiteInitiale(studentProgram, points)
  if (longueurTotale === undefined || demiDroite === undefined) {
    return {
      isOk: false,
      feedback: 'La figure initiale est incomplète.',
    }
  }

  const segmentCorrect = studentProgram.some((instruction) => {
    if (
      instruction.type !== 'segment' ||
      !['red', 'blue'].includes(instruction.couleur ?? '')
    ) {
      return false
    }
    const A = points.get(instruction.p1)
    const B = points.get(instruction.p2)
    if (A === undefined || B === undefined) return false
    const bonneLongueur =
      Math.abs(distance(A, B) - longueurTotale) <= EPSILON_LONGUEUR
    return (
      bonneLongueur &&
      pointSurDemiDroite(A, demiDroite.origine, demiDroite.angle) &&
      pointSurDemiDroite(B, demiDroite.origine, demiDroite.angle)
    )
  })

  return {
    isOk: segmentCorrect,
    feedback: segmentCorrect
      ? 'Bravo, la longueur totale est bien reportée sur la demi-droite.'
      : 'On attend un segment rouge ou bleu, tracé sur la demi-droite, dont la longueur est égale à la longueur totale de la figure.',
  }
}

ElementIepEditeur.registerVerificationCallback(
  VERIFICATION_REPORTER_PERIMETRE_CALLBACK_NAME,
  verifierReportPerimetreAuCompas,
)

/**
 * @author: Jean-Claude Lhote
 */
export default class ReporterPerimetreAuCompasOld extends Exercice {
  constructor() {
    super()
    this.titre = 'Reporter un périmètre au compas'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.besoinFormulaireNumerique = [
      'Type de figure',
      5,
      formes.map((f, index) => `${index + 1} : ${f}`).join('\n'),
    ]
  }
  nouvelleVersion() {
    const f = formes[this.sup - 1] ?? formes[randint(0, formes.length - 1)]
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
      pointDepartReport = lettreDepuisChiffre(6 + i)
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
    const editeur = addEditeurIep(this, 0, {
      conditionsInitiales,
      instructionsDisponibles,
      programmeAttendu,
      tailleLabelsPoints: 12,
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
    this.listeQuestions[0] =
      f === 'Ligne brisée'
        ? `Reporter la longueur totale de la ligne brisée sur la demi-droite ci-dessous, puis, tracer un segment de cette longueur en bleu<br>${editeur}`
        : `Reporter le périmètre du ${f.toLowerCase()} sur la demi-droite ci-dessous, puis, tracer un segment de cette longueur en bleu<br>${editeur}`

    this.listeCorrections[0] = `Voici un programme de construction de la forme demandée :<br>
        ${addEditeurIep(this, 0, {
          id: `IepEditeur-corr-Ex${this.numeroExercice}Q0`,
          conditionsInitiales,
          interactivityOn: false,
          programmeInitial: programmeAttendu,
          instructionsDisponibles,
          tailleLabelsPoints: 11,
        })}`
  }
}
