import type Point from 'apigeom/src/elements/points/Point'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { projectionOrtho, rotation } from '../../lib/2d/transformations'
import { angle } from '../../lib/2d/utilitairesGeometriques'
import { orthoCentre } from '../../lib/2d/utilitairesTriangle'
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

export const titre = 'Tracer une hauteur dans un triangle aux instruments'

export const dateDePublication = '30/07/2026'
export const interactifReady = true

export const uuid = 'd7d78'
export const refs = {
  'fr-fr': ['5G5E-3'],
  'fr-ch': ['9R1ES2E-4', '9R2ES2E-4', '9R3ES2E-4', 'PRQES04B-10'],
}

const VERIFICATION_HAUTEUR_CALLBACK_NAME = '5G5E-3-verification-hauteur'
const TOLERANCE_HAUTEUR = 1e-6

type TraceDroit = {
  A: PointAbstrait
  B: PointAbstrait
  infini: boolean
}

function pointsDuProgramme(programme: InstructionIep[]) {
  const points = new Map<string, PointAbstrait>()
  for (const instruction of programme) {
    if (instruction.type === 'point') {
      points.set(
        instruction.nom,
        pointAbstrait(instruction.x, instruction.y, instruction.nom),
      )
    }
  }
  return points
}

function produitVectoriel(
  A: PointAbstrait,
  B: PointAbstrait,
  M: PointAbstrait,
) {
  return (B.x - A.x) * (M.y - A.y) - (B.y - A.y) * (M.x - A.x)
}

function produitScalaireDirections(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  D: PointAbstrait,
) {
  return (B.x - A.x) * (D.x - C.x) + (B.y - A.y) * (D.y - C.y)
}

function tracePasseParPoint(trace: TraceDroit, point: PointAbstrait) {
  if (Math.abs(produitVectoriel(trace.A, trace.B, point)) > TOLERANCE_HAUTEUR) {
    return false
  }
  if (trace.infini) return true
  const minX = Math.min(trace.A.x, trace.B.x) - TOLERANCE_HAUTEUR
  const maxX = Math.max(trace.A.x, trace.B.x) + TOLERANCE_HAUTEUR
  const minY = Math.min(trace.A.y, trace.B.y) - TOLERANCE_HAUTEUR
  const maxY = Math.max(trace.A.y, trace.B.y) + TOLERANCE_HAUTEUR
  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  )
}

function traceColineaire(
  trace: TraceDroit,
  A: PointAbstrait,
  B: PointAbstrait,
) {
  return (
    Math.abs(produitVectoriel(A, B, trace.A)) <= TOLERANCE_HAUTEUR &&
    Math.abs(produitVectoriel(A, B, trace.B)) <= TOLERANCE_HAUTEUR
  )
}

function tracePerpendiculaireA(
  trace: TraceDroit,
  A: PointAbstrait,
  B: PointAbstrait,
) {
  return (
    Math.abs(produitScalaireDirections(A, B, trace.A, trace.B)) <=
    TOLERANCE_HAUTEUR
  )
}

function segmentProlonge(
  A: PointAbstrait,
  B: PointAbstrait,
  longueurTrace = 12,
) {
  const dx = B.x - A.x
  const dy = B.y - A.y
  const longueurAB = Math.hypot(dx, dy)
  if (longueurAB <= TOLERANCE_HAUTEUR) return { A, B, infini: false }
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
  if (
    instruction.type === 'polygone' ||
    instruction.type === 'polygoneRapide'
  ) {
    return undefined
  }
  return undefined
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

function extraitDonneesAttendues(programme: InstructionIep[]) {
  const points = pointsDuProgramme(programme)
  const hauteur = programme.findLast(
    (instruction) =>
      instruction.type === 'perpendiculaireAObjet' ||
      instruction.type === 'perpendiculaire',
  )
  if (hauteur == null) return undefined
  if (hauteur.type === 'perpendiculaire') {
    const A = points.get(hauteur.p1)
    const B = points.get(hauteur.p2)
    const C = points.get(hauteur.p3)
    if (A == null || B == null || C == null) return undefined
    return { A, B, C }
  }
  const baseInstruction = programme[hauteur.etape]
  if (
    baseInstruction?.type !== 'droite' &&
    baseInstruction?.type !== 'segment'
  ) {
    return undefined
  }
  const A = points.get(baseInstruction.p1)
  const B = points.get(baseInstruction.p2)
  const C = points.get(hauteur.p1)
  if (A == null || B == null || C == null) return undefined
  return { A, B, C }
}

function verifieProgrammeHauteur(
  studentProgram: InstructionIep[],
  expectedProgram: InstructionIep[],
) {
  const donnees = extraitDonneesAttendues(expectedProgram)
  if (donnees == null) {
    return { hauteurTracee: false, piedMaterialise: false }
  }
  const { A, B, C } = donnees
  const pied = projectionOrtho(C, droite(A, B))
  const pointsEleve = pointsDuProgramme([...expectedProgram, ...studentProgram])
  const traces = tracesDuProgramme(studentProgram, pointsEleve)
  const tracesHauteur = traces.filter(
    (trace) =>
      tracePerpendiculaireA(trace, A, B) &&
      tracePasseParPoint(trace, C) &&
      tracePasseParPoint(trace, pied),
  )
  const tracesBase = traces.filter(
    (trace) => traceColineaire(trace, A, B) && tracePasseParPoint(trace, pied),
  )
  return {
    hauteurTracee: tracesHauteur.length > 0,
    piedMaterialise: tracesHauteur.length > 0 && tracesBase.length > 0,
  }
}

export const verifierHauteur: ElementIepVerificationCallback = ({
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
    if (Array.isArray(parsed)) {
      expectedProgram = parsed as InstructionIep[]
    } else if (parsed != null && typeof parsed === 'object') {
      const expectedData = parsed as {
        conditionsInitiales?: InstructionIep[]
        programmeAttendu?: InstructionIep[]
      }
      expectedProgram = [
        ...(expectedData.conditionsInitiales ?? []),
        ...(expectedData.programmeAttendu ?? []),
      ]
    } else {
      return {
        isOk: false,
        feedback: 'Réponse attendue invalide.',
      }
    }
  } catch {
    return {
      isOk: false,
      feedback: 'Réponse attendue invalide.',
    }
  }
  const { hauteurTracee, piedMaterialise } = verifieProgrammeHauteur(
    studentProgram,
    expectedProgram,
  )
  const isOk = hauteurTracee && piedMaterialise
  let feedback = ''
  if (isOk) {
    feedback =
      'Bravo ! La perpendiculaire est correcte et le pied de la hauteur est matérialisé.'
  } else if (!hauteurTracee && !piedMaterialise) {
    feedback =
      "La perpendiculaire à $(AB)$ passant par $C$ n'est pas correctement tracée, et le pied de la hauteur n'est pas matérialisé par deux tracés qui se coupent."
  } else if (!hauteurTracee) {
    feedback =
      "Le pied de la hauteur est matérialisé, mais la perpendiculaire à $(AB)$ passant par $C$ n'est pas correctement tracée."
  } else {
    feedback =
      "La perpendiculaire à $(AB)$ passant par $C$ est bien tracée, mais le pied de la hauteur n'est pas matérialisé : il faut que deux tracés se coupent au pied de la hauteur."
  }
  return {
    isOk,
    feedback,
    score: {
      nbBonnesReponses: Number(hauteurTracee) + Number(piedMaterialise),
      nbReponses: 2,
    },
  }
}
ElementIepEditeur.registerVerificationCallback(
  VERIFICATION_HAUTEUR_CALLBACK_NAME,
  verifierHauteur,
)
/**
 * Tracer une hauteur
 * deux cas intérieure, exterieure, deux vocabulaire  isssue du sommet, relative à la base
 * @author Jean-Claude Lhote
 */
export default class TracerHauteurAuxInstruments extends Exercice {
  pA: Point[] = []
  pB: Point[] = []
  pC: Point[] = []
  relative: boolean[] = []

  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.consigne = ''
    this.besoinFormulaireTexte = [
      'Type de hauteur',
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Intérieure',
        '2 : Extérieure',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de vocabulaire',
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Hauteur issue du sommet',
        '2 : Relative à la base',
      ].join('\n'),
    ]

    this.sup = '0'
    this.sup2 = '0'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const typeHauteurDisponibles = ['interieure', 'exterieure']
    const typesDeHauteurDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 0,
      listeOfCase: typeHauteurDisponibles,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeHauteur = combinaisonListes(
      typesDeHauteurDisponibles,
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
      this.relative[i] = listeTypeVocabulaire[i] === 'base'
      let angleDepart = 0 // randint(-17, 18) * 10 //0
      const AB = 8
      const S: PointAbstrait[] = []
      let P = pointAbstrait(0, 0)

      let k = 0
      let angA = 0
      let angB = 0
      let angC = 0
      do {
        k++
        S[0] = pointAbstrait(0, 0)
        angleDepart = randint(-17, 18) * 10
        const coordC = choice(seriecoordC)
        S[1] = rotation(pointAbstrait(AB, 0), S[0], angleDepart)
        S[2] = rotation(pointAbstrait(coordC.x, coordC.y), S[0], angleDepart)
        P = orthoCentre(S[0], S[1], S[2])
        if (listeTypeHauteur[i] === 'exterieure') {
          //const P = orthoCentre(S[0], S[1], S[2])

          S[2] = P
          const permut = choice([true, false])
          if (permut) {
            const ptemp = S[0]
            S[0] = S[1]
            S[1] = ptemp
          }
          //S = decale(S)
          const ptemp = S[0]
          S[0] = S[1]
          S[1] = S[2]
          S[2] = ptemp
        }
        S[0] = pointAbstrait(Math.round(S[0].x), Math.round(S[0].y))
        S[1] = pointAbstrait(Math.round(S[1].x), Math.round(S[1].y))
        S[2] = pointAbstrait(Math.round(S[2].x), Math.round(S[2].y))

        angA = angle(S[0], S[1], S[2])
        angB = angle(S[2], S[0], S[1])
        angC = angle(S[1], S[2], S[0])
      } while (
        listeTypeHauteur[i] === 'exterieure' &&
        !(angA > 100 || angB > 100 || angC > 100) &&
        k < 10
      )
      P = orthoCentre(S[0], S[1], S[2])
      P.color = colorToLatexOrHTML(bleuMathalea)
      const nomDuTriangleEnonce = creerNomDePolygone(3, 'Q')
      P.nom = choice(
        ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S'],
        Array.from(nomDuTriangleEnonce),
      )
      const nomSommets = combinaisonListes(Array.from(nomDuTriangleEnonce), 3)
      for (let j = 0; j < 3; j++) {
        S[j].nom = nomSommets[j]
      }

      texte += `Dans le triangle $${nomDuTriangleEnonce}$, tracer la hauteur ${listeTypeVocabulaire[i] === 'sommet' ? `issue de $${S[2].nom}$` : `relative au côté $[${S[0].nom}${S[1].nom}]$`}.<br>`

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
        'segment',
        'polygoneRapide',
        'perpendiculaire',
        'milieu',
        'droite',
        'prolongerObjet',
        'intersection',
      ]
      const programmeAttendu: InstructionIep[] = conditionsInitiales.slice()
      programmeAttendu.push(
        {
          type: 'droite',
          p1: S[0].nom,
          p2: S[1].nom,
        },
        { type: 'perpendiculaireAObjet', etape: 4, p1: S[2].nom },
      )
      const programmeAjoute = programmeAttendu.slice(conditionsInitiales.length)
      handleAnswers(this, i, {
        reponse: {
          value: JSON.stringify({
            conditionsInitiales,
            programmeAttendu: programmeAjoute,
          }),
        },
      })
      texte += addEditeurIep(this, i, {
        masquerEtapesInitiales: true,
        sansOutils: true,
        conditionsInitiales,
        instructionsDisponibles /*: */,
        verifyCallbackName: VERIFICATION_HAUTEUR_CALLBACK_NAME,
      })
      const texteCorr = `Voici un programme le programme de construction attendu :<br>
      ${addEditeurIep(this, i, {
        masquerEtapesInitiales: true,
        sansOutils: true,
        id: `IepEditeur-corr-Ex${this.numeroExercice}Q${i}`,
        conditionsInitiales,
        interactivityOn: false,
        programmeInitial: programmeAjoute,
      })}`
      if (this.questionJamaisPosee(i, angA, angB, angC)) {
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
