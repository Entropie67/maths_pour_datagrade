import { PointAbstrait } from '../../lib/2d/PointAbstrait'
import {
  addEditeurIep,
  ElementIepEditeur,
  pointsConstruitsDepuisProgramme,
  type ElementIepVerificationCallback,
  type InstructionIep,
  type TypeInstructionIep,
} from '../../lib/customElements/ElementIepEditeur'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { troisLongueursPourTriangle } from '../../modules/Triangle'
import Exercice from '../Exercice'

export const titre =
  "Construire un triangle aux instruments (deux côtés et l'angle correspondant)"

export const dateDePublication = '04/08/2026'
export const interactifReady = true

export const uuid = 'd8d99'
export const refs = {
  'fr-fr': ['5G5B-5'],
  'fr-ch': ['9R1ES2B-10', '9R2ES2B-10', '9R3ES2B-10', 'PRQES04B-6'],
}

const VERIFICATION_TRIANGLE_CALLBACK_NAME = '5G5B-5-verification-triangle'
const TOLERANCE_DIFF_SCALAIRE = 1e-5

type TriangleTrace = {
  sommets: [PointAbstrait, PointAbstrait, PointAbstrait]
}

function produitScalaireDeuxCotes(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
) {
  return (A.x - B.x) * (C.x - B.x) + (A.y - B.y) * (C.y - B.y)
}

function lireSommetsPolygone(sommets: string) {
  return sommets
    .split(/[,\s;]+/)
    .map((nom) => nom.trim())
    .filter((nom) => nom !== '')
}

function trianglesDuProgramme(programme: InstructionIep[]) {
  const points = pointsConstruitsDepuisProgramme(programme)
  const triangles: TriangleTrace[] = []
  for (const instruction of programme) {
    if (
      instruction.type !== 'polygone' &&
      instruction.type !== 'polygoneRapide'
    ) {
      continue
    }
    const noms = lireSommetsPolygone(instruction.sommets)
    if (noms.length !== 3) continue
    const sommets = noms.map((nom) => points.get(nom))
    if (sommets.some((sommet) => sommet == null)) continue
    const [A, B, C] = sommets as [PointAbstrait, PointAbstrait, PointAbstrait]
    triangles.push({ sommets: [A, B, C] })
  }
  return triangles
}

function produiScalaireDeuxPremiersCotes(programme: InstructionIep[]) {
  const triangles = trianglesDuProgramme(programme)
  if (triangles.length > 1)
    return { scalaire: 0, nomsCotes: [], message: 'Trop de triangles' }
  if (triangles.length === 0)
    return {
      scalaire: 0,
      nomsCotes: [],
      message: "Il n'y  pas de triangle tracé",
    }
  const [A, B, C] = triangles[0].sommets
  const nomsCotes = [`${B.nom}${A.nom}`, `${B.nom}${C.nom}`]
  return { scalaire: produitScalaireDeuxCotes(A, B, C), nomsCotes, message: '' }
}

function verifierNomsTriangles(nomEleve: string[], nomsAttendus: string[]) {
  let isEqual = true
  for (let i = 0; i < nomsAttendus.length; i++) {
    if (nomEleve[i] !== nomsAttendus[i]) {
      isEqual = false
      break
    }
  }
  return isEqual
}

export const verifierTriangle: ElementIepVerificationCallback = ({
  studentProgram,
  expectedRaw,
}) => {
  const parsedExpected = JSON.parse(String(expectedRaw))
  const programmeAttendu: InstructionIep[] = Array.isArray(parsedExpected)
    ? parsedExpected
    : [
        ...(parsedExpected.conditionsInitiales as InstructionIep[]),
        ...(parsedExpected.programmeAttendu as InstructionIep[]),
      ]
  const resultatAttendu = produiScalaireDeuxPremiersCotes(programmeAttendu)
  const resultatEleve = produiScalaireDeuxPremiersCotes(studentProgram)
  if (resultatEleve.message !== '') {
    return {
      isOk: false,
      feedback: resultatEleve.message,
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    }
  }
  const differenceScalaires = Math.abs(
    resultatAttendu.scalaire - resultatEleve.scalaire,
  )
  const isOk =
    differenceScalaires < TOLERANCE_DIFF_SCALAIRE &&
    verifierNomsTriangles(resultatEleve.nomsCotes, resultatAttendu.nomsCotes)
  return isOk
    ? {
        isOk,
        feedback: 'Bravo ! Le triangle tracé est le bon',
        score: {
          nbBonnesReponses: 1,
          nbReponses: 1,
        },
      }
    : differenceScalaires < TOLERANCE_DIFF_SCALAIRE
      ? {
          isOk: false,
          feedback: `Le triangle tracé est correct mais les noms des sommets ne correspondent pas à ceux attendus.`,
          score: {
            nbBonnesReponses: 0,
            nbReponses: 1,
          },
        }
      : verifierNomsTriangles(
            resultatEleve.nomsCotes,
            resultatAttendu.nomsCotes,
          )
        ? {
            isOk: false,
            feedback: `Le triangle ${resultatAttendu.nomsCotes[0][1]}${resultatAttendu.nomsCotes[0][0]}${resultatAttendu.nomsCotes[1].slice(1)} n'a pas les bonnes dimensions.`,
            score: {
              nbBonnesReponses: 0,
              nbReponses: 1,
            },
          }
        : {
            isOk: false,
            feedback: `Le triangle tracé n'est pas correct et les noms des sommets ne correspondent pas à ceux attendus.`,
            score: {
              nbBonnesReponses: 0,
              nbReponses: 1,
            },
          }
}

ElementIepEditeur.registerVerificationCallback(
  VERIFICATION_TRIANGLE_CALLBACK_NAME,
  verifierTriangle,
)

/**
 * On donne un angle et les deux longueurs des côtés de cet angle et il faut construire ce triangle.
 * @author Jean-Claude Lhote
 */
export default class TracerTriangleAngle2cotes extends Exercice {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.consigne = ''
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de constructions',
      '0: Mélange\n1: triangle donné par 2 côtés et l’angle compris\n2: triangle donné par 3 longueurs de côtés\n3: triangle donné par 2 angles et le côté commun',
    ]
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 1,
      melange: 0,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let programmeAttendu: InstructionIep[] = []
      let conditionsInitiales: InstructionIep[] = []
      let instructionsDisponibles: TypeInstructionIep[] = []
      let texte = ''
      let donnees: number[] = []
      const nom = creerNomDePolygone(3, 'Q')

      switch (listeTypeDeQuestions[i]) {
        case 1: {
          const AB = randint(4, 8)
          const BC = randint(3, 7, AB)
          const ABC = randint(20, 70)
          donnees = [AB, BC, ABC]

          texte = `Construire le triangle $${nom}$ tel que $\\widehat{${nom[0]}${nom[1]}${nom[2]}} = ${ABC}^\\circ$ et $${nom[0]}${nom[1]}=${AB}\\text{ cm}$ et $${nom[1]}${nom[2]}=${BC}\\text{ cm}$.<br>`
          instructionsDisponibles = [
            'cercleRayon',
            'droite',
            'segment',
            'polygone',
            'intersection',
            'demiDroiteAngle',
            'pointADistance',
          ]
          conditionsInitiales = [{ type: 'point', nom: nom[1], x: 0, y: 0 }]
          programmeAttendu = [
            ...conditionsInitiales,
            {
              type: 'pointADistance',
              nom: nom[0],
              p1: nom[1],
              distance: AB,
              angle: 0,
            },
            {
              type: 'demiDroiteAngle',
              p1: nom[1],
              p2: nom[0],
              angle: ABC,
            },
            { type: 'cercleRayon', p1: nom[1], r: BC },
            {
              type: 'intersection',
              etape1: 2,
              etape2: 3,
              nom: nom[2],
              choix: 1,
            },
            { type: 'polygone', sommets: Array.from(nom).join(',') },
          ]
          break
        }
        case 2: {
          const [l0, l1, l2] = troisLongueursPourTriangle(8, false)
          texte = `Construire le triangle $${nom}$ tel que $${nom[0]}${nom[1]}=${l0}\\text{ cm}$, $${nom[1]}${nom[2]}=${l1}\\text{ cm}$ et $${nom[2]}${nom[0]}=${l2}\\text{ cm}$.<br>`
          donnees = [l0, l1, l2]
          instructionsDisponibles = [
            'cercleRayon',
            'segment',
            'polygone',
            'intersection',
            'demiDroiteAngle',
            'pointADistance',
          ]
          conditionsInitiales = [{ type: 'point', nom: nom[0], x: 0, y: 0 }]
          programmeAttendu = [
            ...conditionsInitiales,
            {
              type: 'pointADistance',
              nom: nom[1],
              p1: nom[0],
              distance: l0,
              angle: 0,
            },
            {
              type: 'cercleRayon',
              p1: nom[1],
              r: l1,
            },
            { type: 'cercleRayon', p1: nom[0], r: l2 },
            {
              type: 'intersection',
              etape1: 2,
              etape2: 3,
              nom: nom[2],
              choix: 1,
            },
            { type: 'polygone', sommets: Array.from(nom).join(',') },
          ]
          break
        }
        case 3: {
          const BAC = randint(20, 70)
          const ABC = randint(20, 70, BAC)
          const l0 = randint(4, 8)
          texte = `Construire le triangle $${nom}$ tel que $\\widehat{${nom[1]}${nom[0]}${nom[2]}} = ${BAC}^\\circ$, $\\widehat{${nom[0]}${nom[1]}${nom[2]}} = ${ABC}^\\circ$ et $${nom[0]}${nom[1]}=${l0}\\text{ cm}$.<br>
          (Pour construire un angle dans le sens indirect, mettre un signe - devant)<br>`
          donnees = [l0, BAC, ABC]
          instructionsDisponibles = [
            'cercleRayon',
            'segment',
            'polygone',
            'intersection',
            'demiDroiteAngle',
            'pointADistance',
          ]
          conditionsInitiales = [{ type: 'point', nom: nom[0], x: 0, y: 0 }]
          programmeAttendu = [
            ...conditionsInitiales,
            {
              type: 'pointADistance',
              nom: nom[1],
              p1: nom[0],
              distance: l0,
              angle: 0,
            },
            {
              type: 'demiDroiteAngle',
              p1: nom[1],
              p2: nom[0],
              angle: BAC,
            },
            {
              type: 'demiDroiteAngle',
              p1: nom[0],
              p2: nom[1],
              angle: -ABC,
            },
            {
              type: 'intersection',
              etape1: 2,
              etape2: 3,
              nom: nom[2],
              choix: 1,
            },
            { type: 'polygone', sommets: Array.from(nom).join(',') },
          ]
          break
        }
      }

      if (this.questionJamaisPosee(i, ...donnees)) {
        const programmeAjoute = programmeAttendu.slice(
          conditionsInitiales.length,
        )
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
          instructionsDisponibles,
          verifyCallbackName: VERIFICATION_TRIANGLE_CALLBACK_NAME,
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
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
