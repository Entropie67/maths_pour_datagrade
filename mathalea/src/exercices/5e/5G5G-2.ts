import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { rotation } from '../../lib/2d/transformations'
import { angle } from '../../lib/2d/utilitairesGeometriques'
import { centreGraviteTriangle } from '../../lib/2d/utilitairesTriangle'
import { bleuMathalea } from '../../lib/colors'
import {
  addEditeurIep,
  ElementIepEditeur,
  type ElementIepVerificationCallback,
  type InstructionIep,
  type TypeInstructionIep,
} from '../../lib/customElements/ElementIepEditeur'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  shuffle2tableaux,
} from '../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Tracer une médiane dans un triangle aux instruments'

export const dateDePublication = '04/08/2026'
export const interactifReady = true

export const uuid = 'd8d88'
export const refs = {
  'fr-fr': ['5G5G-2'],
  'fr-ch': ['9R2ES2F-2', '9R3ES2F-2'],
}

const VERIFICATION_MEDIANE_CALLBACK_NAME = '5G5G-2-verification-mediane'
const TOLERANCE_MEDIANE = 1e-5

type TraceDroit = {
  A: PointAbstrait
  B: PointAbstrait
  infini: boolean
}

type DonneesMediane = {
  A: PointAbstrait
  B: PointAbstrait
  C: PointAbstrait
  typeQuestion: 'mediane' | 'centreGravite'
}

function produitVectoriel(
  A: PointAbstrait,
  B: PointAbstrait,
  M: PointAbstrait,
) {
  return (B.x - A.x) * (M.y - A.y) - (B.y - A.y) * (M.x - A.x)
}

function tracePasseParPoint(trace: TraceDroit, point: PointAbstrait) {
  if (Math.abs(produitVectoriel(trace.A, trace.B, point)) > TOLERANCE_MEDIANE) {
    return false
  }
  if (trace.infini) return true
  const minX = Math.min(trace.A.x, trace.B.x) - TOLERANCE_MEDIANE
  const maxX = Math.max(trace.A.x, trace.B.x) + TOLERANCE_MEDIANE
  const minY = Math.min(trace.A.y, trace.B.y) - TOLERANCE_MEDIANE
  const maxY = Math.max(trace.A.y, trace.B.y) + TOLERANCE_MEDIANE
  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  )
}

function pointsEgaux(A: PointAbstrait, B: PointAbstrait) {
  return Math.hypot(A.x - B.x, A.y - B.y) <= TOLERANCE_MEDIANE
}

function milieuDe(A: PointAbstrait, B: PointAbstrait, nom = '') {
  return pointAbstrait((A.x + B.x) / 2, (A.y + B.y) / 2, nom)
}

function segmentProlonge(
  A: PointAbstrait,
  B: PointAbstrait,
  longueurTrace = 12,
) {
  const dx = B.x - A.x
  const dy = B.y - A.y
  const longueurAB = Math.hypot(dx, dy)
  if (longueurAB <= TOLERANCE_MEDIANE) return { A, B, infini: false }
  const milieuX = (A.x + B.x) / 2
  const milieuY = (A.y + B.y) / 2
  const demiLongueur = Math.abs(longueurTrace) / 2
  const ux = dx / longueurAB
  const uy = dy / longueurAB
  return {
    A: pointAbstrait(milieuX - ux * demiLongueur, milieuY - uy * demiLongueur),
    B: pointAbstrait(milieuX + ux * demiLongueur, milieuY + uy * demiLongueur),
    infini: false,
  }
}

function intersectionTraces(
  d1: TraceDroit | undefined,
  d2: TraceDroit | undefined,
  nom = '',
) {
  if (d1 == null || d2 == null) return undefined
  const x1 = d1.A.x
  const y1 = d1.A.y
  const x2 = d1.B.x
  const y2 = d1.B.y
  const x3 = d2.A.x
  const y3 = d2.A.y
  const x4 = d2.B.x
  const y4 = d2.B.y
  const denominateur = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(denominateur) <= TOLERANCE_MEDIANE) return undefined
  const px =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
    denominateur
  const py =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
    denominateur
  const P = pointAbstrait(px, py, nom)
  return tracePasseParPoint(d1, P) && tracePasseParPoint(d2, P) ? P : undefined
}

function traceDepuisInstruction(
  instruction: InstructionIep | undefined,
  programme: InstructionIep[],
  points: Map<string, PointAbstrait>,
): TraceDroit | undefined {
  if (instruction == null) return undefined
  if (
    instruction.type === 'droite' ||
    instruction.type === 'segment' ||
    instruction.type === 'demiDroite'
  ) {
    const A = points.get(instruction.p1)
    const B = points.get(instruction.p2)
    if (A == null || B == null) return undefined
    return {
      A,
      B,
      infini:
        instruction.type === 'droite' || instruction.type === 'demiDroite',
    }
  }
  if (instruction.type === 'mediatrice') {
    const A = points.get(instruction.p1)
    const B = points.get(instruction.p2)
    if (A == null || B == null) return undefined
    const M = milieuDe(A, B)
    return {
      A: M,
      B: pointAbstrait(M.x - (B.y - A.y), M.y + B.x - A.x),
      infini: true,
    }
  }
  if (instruction.type === 'perpendiculaire') {
    const A = points.get(instruction.p1)
    const B = points.get(instruction.p2)
    const C = points.get(instruction.p3)
    if (A == null || B == null || C == null) return undefined
    return {
      A: C,
      B: pointAbstrait(C.x - (B.y - A.y), C.y + B.x - A.x),
      infini: true,
    }
  }
  if (instruction.type === 'perpendiculaireAObjet') {
    const base = traceDepuisInstruction(
      programme[instruction.etape],
      programme,
      points,
    )
    const C = points.get(instruction.p1)
    if (base == null || C == null) return undefined
    return {
      A: C,
      B: pointAbstrait(C.x - (base.B.y - base.A.y), C.y + base.B.x - base.A.x),
      infini: true,
    }
  }
  if (instruction.type === 'prolongerObjet') {
    const trace = traceDepuisInstruction(
      programme[instruction.etape],
      programme,
      points,
    )
    if (trace == null) return undefined
    if (trace.infini) return trace
    return segmentProlonge(trace.A, trace.B, instruction.longueur)
  }
  return undefined
}

function pointsDuProgramme(programme: InstructionIep[]) {
  const points = new Map<string, PointAbstrait>()
  programme.forEach((instruction) => {
    if (instruction.type === 'point') {
      points.set(
        instruction.nom,
        pointAbstrait(instruction.x, instruction.y, instruction.nom),
      )
    } else if (instruction.type === 'milieu') {
      const A = points.get(instruction.p1)
      const B = points.get(instruction.p2)
      if (A != null && B != null) {
        points.set(instruction.nom, milieuDe(A, B, instruction.nom))
      }
    } else if (instruction.type === 'intersection') {
      const P = intersectionTraces(
        traceDepuisInstruction(
          programme[instruction.etape1],
          programme,
          points,
        ),
        traceDepuisInstruction(
          programme[instruction.etape2],
          programme,
          points,
        ),
        instruction.nom,
      )
      if (P != null) points.set(instruction.nom, P)
    }
  })
  return points
}

function tracesDuProgramme(
  programme: InstructionIep[],
  points: Map<string, PointAbstrait>,
) {
  const traces: TraceDroit[] = []
  programme.forEach((instruction) => {
    if (
      instruction.type === 'polygone' ||
      instruction.type === 'polygoneRapide'
    ) {
      const sommets = instruction.sommets
        .split(/[,\s;]+/)
        .map((nom) => nom.trim())
        .filter((nom) => nom !== '')
      sommets.forEach((nom, sommetIndex) => {
        const A = points.get(nom)
        const B = points.get(sommets[(sommetIndex + 1) % sommets.length])
        if (A != null && B != null) traces.push({ A, B, infini: false })
      })
      return
    }
    const trace = traceDepuisInstruction(instruction, programme, points)
    if (trace != null) traces.push(trace)
  })
  return traces
}

function extraitDonneesAttendues(
  expectedRaw: unknown,
): DonneesMediane | undefined {
  if (typeof expectedRaw !== 'string') return undefined
  try {
    const parsed = JSON.parse(expectedRaw)
    if (
      !Array.isArray(parsed?.sommets) ||
      parsed.sommets.length !== 3 ||
      (parsed.typeQuestion !== 'mediane' &&
        parsed.typeQuestion !== 'centreGravite')
    ) {
      return undefined
    }
    const [A, B, C] = parsed.sommets.map(
      (point: { x: number; y: number; nom: string }) =>
        pointAbstrait(point.x, point.y, point.nom),
    )
    return { A, B, C, typeQuestion: parsed.typeQuestion }
  } catch {
    return undefined
  }
}

function medianesTracees(
  traces: TraceDroit[],
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
) {
  const milieux = [milieuDe(B, C), milieuDe(A, C), milieuDe(A, B)]
  const sommets = [A, B, C]
  return sommets.map((sommet, index) =>
    traces.some(
      (trace) =>
        tracePasseParPoint(trace, sommet) &&
        tracePasseParPoint(trace, milieux[index]),
    ),
  )
}

function milieuDuCoteCree(
  points: Map<string, PointAbstrait>,
  A: PointAbstrait,
  B: PointAbstrait,
) {
  const milieuAB = milieuDe(A, B)
  return [...points.values()].some((point) => pointsEgaux(point, milieuAB))
}

function nomsPointsEgaux(
  points: Map<string, PointAbstrait>,
  pointAttendu: PointAbstrait,
) {
  return [...points.entries()]
    .filter(([, point]) => pointsEgaux(point, pointAttendu))
    .map(([nom]) => nom)
}

function codageSegmentSur(
  instruction: InstructionIep,
  points: Map<string, PointAbstrait>,
  A: PointAbstrait,
  B: PointAbstrait,
  codage?: string,
) {
  if (instruction.type !== 'segmentCodage') return false
  if (codage != null && instruction.codage !== codage) return false
  const P = points.get(instruction.p1)
  const Q = points.get(instruction.p2)
  if (P == null || Q == null) return false
  return (
    (pointsEgaux(P, A) && pointsEgaux(Q, B)) ||
    (pointsEgaux(P, B) && pointsEgaux(Q, A))
  )
}

function codageMilieuDuCoteCree(
  programme: InstructionIep[],
  points: Map<string, PointAbstrait>,
  A: PointAbstrait,
  B: PointAbstrait,
) {
  if (pointsEgaux(A, B)) return false
  const M = milieuDe(A, B)
  const nomsMilieu = new Set(nomsPointsEgaux(points, M))
  if (nomsMilieu.size === 0) return false
  const codageDirect = programme.some((instruction) => {
    if (instruction.type !== 'codageMilieu') return false
    const P = points.get(instruction.p1)
    const I = points.get(instruction.p2)
    const Q = points.get(instruction.p3)
    if (P == null || I == null || Q == null) return false
    return (
      pointsEgaux(I, M) &&
      ((pointsEgaux(P, A) && pointsEgaux(Q, B)) ||
        (pointsEgaux(P, B) && pointsEgaux(Q, A)))
    )
  })
  if (codageDirect) return true
  for (const nomMilieu of nomsMilieu) {
    const milieuEleve = points.get(nomMilieu)
    if (milieuEleve == null) continue
    const codagesAI = programme.filter((instruction) =>
      codageSegmentSur(instruction, points, A, milieuEleve),
    )
    if (
      codagesAI.some(
        (codageAI) =>
          codageAI.type === 'segmentCodage' &&
          programme.some((instruction) =>
            codageSegmentSur(
              instruction,
              points,
              milieuEleve,
              B,
              codageAI.codage,
            ),
          ),
      )
    ) {
      return true
    }
  }
  return false
}

function centreGraviteCree(
  points: Map<string, PointAbstrait>,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
) {
  const G = centreGraviteTriangle(A, B, C)
  return [...points.values()].some((point) => pointsEgaux(point, G))
}

function verifieProgrammeMediane(
  studentProgram: InstructionIep[],
  expectedRaw: unknown,
) {
  const donnees = extraitDonneesAttendues(expectedRaw)
  if (donnees == null) {
    return { typeQuestion: 'mediane', milieuCree: false, medianeTracee: false }
  }
  const { A, B, C, typeQuestion } = donnees
  const nomsPointsEleve = new Set(
    studentProgram
      .filter((instruction) => instruction.type === 'point')
      .map((instruction) => instruction.nom),
  )
  const programmePourVerification =
    nomsPointsEleve.has(A.nom) &&
    nomsPointsEleve.has(B.nom) &&
    nomsPointsEleve.has(C.nom)
      ? studentProgram
      : ([
          { type: 'point', nom: A.nom, x: A.x, y: A.y },
          { type: 'point', nom: B.nom, x: B.x, y: B.y },
          { type: 'point', nom: C.nom, x: C.x, y: C.y },
          ...studentProgram,
        ] as InstructionIep[])
  const pointsEleve = pointsDuProgramme(programmePourVerification)
  const traces = tracesDuProgramme(programmePourVerification, pointsEleve)
  const medianes = medianesTracees(traces, A, B, C)
  const codagesMilieux = [
    codageMilieuDuCoteCree(programmePourVerification, pointsEleve, B, C),
    codageMilieuDuCoteCree(programmePourVerification, pointsEleve, A, C),
    codageMilieuDuCoteCree(programmePourVerification, pointsEleve, A, B),
  ]
  if (typeQuestion === 'centreGravite') {
    return {
      typeQuestion,
      deuxMedianesTracees: medianes.filter(Boolean).length >= 2,
      deuxMilieuxCodes: codagesMilieux.filter(Boolean).length >= 2,
      centreCree: centreGraviteCree(pointsEleve, A, B, C),
    }
  }
  return {
    typeQuestion,
    milieuCree: milieuDuCoteCree(pointsEleve, A, B),
    milieuCode: codagesMilieux[2],
    medianeTracee: medianes[2],
  }
}

export const verifierMediane: ElementIepVerificationCallback = ({
  studentProgram,
  expectedRaw,
}) => {
  const resultat = verifieProgrammeMediane(studentProgram, expectedRaw)
  if (resultat.typeQuestion === 'centreGravite') {
    const deuxMedianesTracees = Boolean(resultat.deuxMedianesTracees)
    const deuxMilieuxCodes = Boolean(resultat.deuxMilieuxCodes)
    const centreCree = Boolean(resultat.centreCree)
    const isOk = deuxMedianesTracees && deuxMilieuxCodes && centreCree
    return {
      isOk,
      feedback: isOk
        ? 'Bravo ! Au moins deux médianes sont tracées, les milieux sont codés et leur point d’intersection est le centre de gravité.'
        : !deuxMedianesTracees && !deuxMilieuxCodes && !centreCree
          ? 'Il faut construire et coder les milieux, tracer au moins deux médianes du triangle puis créer leur point d’intersection.'
          : !deuxMedianesTracees
            ? 'Le centre de gravité est créé, mais il faut aussi tracer au moins deux médianes.'
            : !deuxMilieuxCodes
              ? 'Les médianes sont tracées, mais il faut coder les milieux utilisés.'
              : 'Les deux médianes sont tracées, mais leur point d’intersection n’est pas créé.',
      score: {
        nbBonnesReponses:
          Number(deuxMedianesTracees) +
          Number(deuxMilieuxCodes) +
          Number(centreCree),
        nbReponses: 3,
      },
    }
  }
  const milieuCree = Boolean(resultat.milieuCree)
  const milieuCode = Boolean(resultat.milieuCode)
  const medianeTracee = Boolean(resultat.medianeTracee)
  const isOk = milieuCree && milieuCode && medianeTracee
  return {
    isOk,
    feedback: isOk
      ? 'Bravo ! Le milieu du côté est construit, codé et la médiane correspondante est tracée.'
      : !milieuCree && !milieuCode && !medianeTracee
        ? 'Il faut construire et coder le milieu du côté indiqué puis tracer la droite passant par ce milieu et le sommet opposé.'
        : !milieuCree
          ? 'La médiane est tracée, mais le milieu du côté indiqué doit être construit.'
          : !milieuCode
            ? 'Le milieu du côté indiqué est construit, mais il faut le coder.'
            : 'Le milieu du côté indiqué est construit et codé, mais la médiane correspondante n’est pas tracée.',
    score: {
      nbBonnesReponses:
        Number(milieuCree) + Number(milieuCode) + Number(medianeTracee),
      nbReponses: 3,
    },
  }
}
ElementIepEditeur.registerVerificationCallback(
  VERIFICATION_MEDIANE_CALLBACK_NAME,
  verifierMediane,
)

/**
 * Tracer une médiane ou le centre de gravité d'un triangle.
 * @author Jean-Claude Lhote
 */
export default class TracerMedianeAuxInstruments extends Exercice {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.consigne = ''
    this.besoinFormulaireTexte = [
      'Type de question',
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Médiane',
        '2 : Centre de gravité',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de vocabulaire',
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Médiane issue du sommet',
        '2 : Médiane relative au côté',
      ].join('\n'),
    ]

    this.sup = '0'
    this.sup2 = '0'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const typesQuestionDisponibles = ['mediane', 'centreGravite']
    const typesDeQuestionDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 0,
      listeOfCase: typesQuestionDisponibles,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeQuestion = combinaisonListes(
      typesDeQuestionDisponibles,
      this.nbQuestions,
    )
    const typeVocabulaireDisponibles = ['sommet', 'base']
    const typesDeVocabulaireDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 0,
      listeOfCase: typeVocabulaireDisponibles,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeVocabulaire = combinaisonListes(
      typesDeVocabulaireDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      const S: PointAbstrait[] = []
      let angA = 0
      let angB = 0
      let angC = 0
      let k = 0
      do {
        k++
        const angleDepart = randint(-17, 18) * 10
        const coordC = choice(seriecoordC)
        S[0] = pointAbstrait(0, 0)
        S[1] = rotation(pointAbstrait(8, 0), S[0], angleDepart)
        S[2] = rotation(pointAbstrait(coordC.x, coordC.y), S[0], angleDepart)
        S[0] = pointAbstrait(Math.round(S[0].x), Math.round(S[0].y))
        S[1] = pointAbstrait(Math.round(S[1].x), Math.round(S[1].y))
        S[2] = pointAbstrait(Math.round(S[2].x), Math.round(S[2].y))

        angA = angle(S[0], S[1], S[2])
        angB = angle(S[2], S[0], S[1])
        angC = angle(S[1], S[2], S[0])
      } while ((angA < 25 || angB < 25 || angC < 25) && k < 10)
      const G = centreGraviteTriangle(S[0], S[1], S[2])
      G.color = colorToLatexOrHTML(bleuMathalea)
      const nomDuTriangleEnonce = creerNomDePolygone(3, 'Q')
      G.nom = choice(
        ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S'],
        Array.from(nomDuTriangleEnonce),
      )
      const nomSommets = combinaisonListes(Array.from(nomDuTriangleEnonce), 3)
      for (let j = 0; j < 3; j++) {
        S[j].nom = nomSommets[j]
      }

      const typeQuestion = listeTypeQuestion[i]
      texte +=
        typeQuestion === 'centreGravite'
          ? `Dans le triangle $${nomDuTriangleEnonce}$, construire le centre de gravité.<br>`
          : `Dans le triangle $${nomDuTriangleEnonce}$, tracer la médiane ${listeTypeVocabulaire[i] === 'sommet' ? `issue de $${S[2].nom}$` : `relative au côté $[${S[0].nom}${S[1].nom}]$`}.<br>`

      const SBis = [S[0], S[1], S[2]]
      const nomSommetsBis = [nomSommets[0], nomSommets[1], nomSommets[2]]
      shuffle2tableaux(SBis, nomSommetsBis)
      const conditionsInitiales: InstructionIep[] = [
        {
          type: 'point',
          nom: nomSommetsBis[0],
          x: SBis[0].x,
          y: SBis[0].y,
          protege: true,
        },
        {
          type: 'point',
          nom: nomSommetsBis[1],
          x: SBis[1].x,
          y: SBis[1].y,
          protege: true,
        },
        {
          type: 'point',
          nom: nomSommetsBis[2],
          x: SBis[2].x,
          y: SBis[2].y,
          protege: true,
        },
        { type: 'polygoneRapide', sommets: nomSommets.slice(0, 3).join(',') },
      ]
      const instructionsDisponibles: TypeInstructionIep[] = [
        'milieu',
        'droite',
        'segment',
        'polygone',
        'polygoneRapide',
        'intersection',
        'perpendiculaire',
        'perpendiculaireAObjet',
        'mediatrice',
        'codageMilieu',
        'prolongerObjet',
      ]
      const programmeAttendu =
        typeQuestion === 'centreGravite'
          ? [
              ...conditionsInitiales,
              { type: 'milieu', nom: 'I', p1: S[1].nom, p2: S[2].nom },
              {
                type: 'codageMilieu',
                p1: S[1].nom,
                p2: 'I',
                p3: S[2].nom,
                codage: '/',
              },
              { type: 'droite', p1: S[0].nom, p2: 'I' },
              { type: 'milieu', nom: 'J', p1: S[0].nom, p2: S[2].nom },
              {
                type: 'codageMilieu',
                p1: S[0].nom,
                p2: 'J',
                p3: S[2].nom,
                codage: '//',
              },
              { type: 'droite', p1: S[1].nom, p2: 'J' },
              {
                type: 'intersection',
                nom: G.nom,
                etape1: 6,
                etape2: 9,
                choix: 0,
              },
            ]
          : [
              ...conditionsInitiales,
              { type: 'milieu', nom: 'I', p1: S[0].nom, p2: S[1].nom },
              {
                type: 'codageMilieu',
                p1: S[0].nom,
                p2: 'I',
                p3: S[1].nom,
                codage: '/',
              },
              { type: 'droite', p1: S[2].nom, p2: 'I' },
            ]
      const programmeAjoute = programmeAttendu.slice(conditionsInitiales.length)
      const reponseAttendue = {
        typeQuestion,
        sommets: S.map((sommet) => ({
          nom: sommet.nom,
          x: sommet.x,
          y: sommet.y,
        })),
      }
      handleAnswers(this, i, {
        reponse: { value: JSON.stringify(reponseAttendue) },
      })
      texte += addEditeurIep(this, i, {
        masquerEtapesInitiales: true,
        sansOutils: true,
        conditionsInitiales,
        instructionsDisponibles,
        verifyCallbackName: VERIFICATION_MEDIANE_CALLBACK_NAME,
      })
      const texteCorr = `Voici un programme de construction possible :<br>
      ${addEditeurIep(this, i, {
        masquerEtapesInitiales: true,
        sansOutils: true,
        id: `IepEditeur-corr-Ex${this.numeroExercice}Q${i}`,
        conditionsInitiales,
        interactivityOn: false,
        programmeInitial: programmeAjoute as InstructionIep[],
      })}`
      if (this.questionJamaisPosee(i, typeQuestion, angA, angB, angC)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

const seriecoordC: { x: number; y: number }[] = [
  { x: 1, y: 4 },
  { x: 2, y: 4 },
  { x: 3, y: 5 },
  { x: 3, y: 6 },
  { x: 3, y: 7 },
  { x: 4, y: 5 },
  { x: 4, y: 6 },
  { x: 5, y: 5 },
  { x: 5, y: 6 },
  { x: 5, y: 7 },
  { x: 6, y: 4 },
  { x: 7, y: 4 },
]
