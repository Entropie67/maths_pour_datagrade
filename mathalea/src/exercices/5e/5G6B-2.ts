import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { rotation, similitude, translation } from '../../lib/2d/transformations'
import { milieu, pointAdistance } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import {
  addEditeurIep,
  ElementIepEditeur,
  pointsConstruitsDepuisProgramme,
  type ElementIepVerificationCallback,
  type InstructionIep,
  type InstructionsDisponiblesIep,
} from '../../lib/customElements/ElementIepEditeur'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Construire des parallélogrammes'
export const dateDeModifImportante = '18/04/2024'
export const dateDePublication = '26/07/2026'

export const interactifReady = true

/**
 * Donner le programme de construction d'un parallélogramme dans des situations variées.
 * @author Jean-claude Lhote
 */
export const uuid = 'b612b'

export const refs = {
  'fr-fr': ['5G6B-2'],
  'fr-2016': [],
  'fr-ch': ['9R1ES2I-3', '9R2ES2I-3', '9R3ES2I-3', 'PRQES04B-13'],
}

const VERIFICATION_PARALLELOGRAMME_CALLBACK_NAME =
  '5G6B-2-verification-parallelogramme'

const memePosition = (
  point: { x: number; y: number },
  attendu: { x: number; y: number },
): boolean => Math.hypot(point.x - attendu.x, point.y - attendu.y) < 1e-6

const memeCote = (coteA: [string, string], coteB: [string, string]): boolean =>
  (coteA[0] === coteB[0] && coteA[1] === coteB[1]) ||
  (coteA[0] === coteB[1] && coteA[1] === coteB[0])

const sommetsPolygone = (sommets: string): string[] =>
  sommets
    .split(/[,\s;]+/)
    .map((sommet) => sommet.trim())
    .filter((sommet) => sommet.length > 0)

const programmeContientCote = (
  programme: InstructionIep[],
  cote: [string, string],
): boolean =>
  programme.some((instruction) => {
    if (instruction.type === 'segment') {
      return memeCote([instruction.p1, instruction.p2], cote)
    }
    if (
      instruction.type !== 'polygone' &&
      instruction.type !== 'polygoneRapide'
    ) {
      return false
    }
    const sommets = sommetsPolygone(instruction.sommets)
    return sommets.some((sommet, index) => {
      const suivant = sommets[(index + 1) % sommets.length]
      return memeCote([sommet, suivant], cote)
    })
  })

const cotesDesPolygonesDuProgramme = (
  programme: InstructionIep[],
): [string, string][] =>
  programme.flatMap((instruction) => {
    if (
      instruction.type !== 'polygone' &&
      instruction.type !== 'polygoneRapide'
    ) {
      return []
    }
    const sommets = sommetsPolygone(instruction.sommets)
    return sommets.map(
      (sommet, index) =>
        [sommet, sommets[(index + 1) % sommets.length]] satisfies [
          string,
          string,
        ],
    )
  })

const cotesUniques = (cotes: [string, string][]): [string, string][] =>
  cotes.reduce<[string, string][]>((uniques, cote) => {
    if (!uniques.some((coteUnique) => memeCote(coteUnique, cote))) {
      uniques.push(cote)
    }
    return uniques
  }, [])

const verifierParallelogramme: ElementIepVerificationCallback = ({
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
  const expectedPoints = pointsConstruitsDepuisProgramme(expectedProgram)
  const studentPoints = pointsConstruitsDepuisProgramme(studentProgram)
  const pointsOk = [...expectedPoints].every(([nom, point]) => {
    const construit = studentPoints.get(nom)
    return construit !== undefined && memePosition(construit, point)
  })
  const expectedCotes = cotesUniques(
    cotesDesPolygonesDuProgramme(expectedProgram),
  )
  const cotesOk = expectedCotes.every((cote) =>
    programmeContientCote(studentProgram, cote),
  )
  const isOk = pointsOk && cotesOk
  return {
    isOk,
    feedback: isOk
      ? 'Bravo !'
      : 'La construction ne donne pas le parallélogramme attendu.',
  }
}

ElementIepEditeur.registerVerificationCallback(
  VERIFICATION_PARALLELOGRAMME_CALLBACK_NAME,
  verifierParallelogramme,
)

export default class ProgrammesConstructionsParallelogrammes extends Exercice {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.besoinFormulaireTexte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n0: Mélange\n1 : Deux côtés consécutifs sont donnés\n2 : Trois sommets consécutifs sont donnés\n3 : Deux sommets consécutifs et le centre sont donnés\n4: Un angle et le sommet opposé',
    ]

    this.nbQuestions = 1
    this.sup = '0'
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 0,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // On prépare la figure...

      const noms = choisitLettresDifferentes(5, 'QO', true) // on choisit 5 lettres, les 4 premières sont les sommets, la 5e est le centre
      const nom = `${noms[0] + noms[1] + noms[2] + noms[3]}`
      const angleRotationFigure = randint(0, 360)
      const angleBAC = randint(30, 45)
      const A = pointAbstrait(0, 0, noms[0])
      const B = rotation(
        pointAdistance(A, 6, 0),
        A,
        angleRotationFigure,
        noms[1],
      )
      const C = similitude(B, A, angleBAC, randint(7, 9) / 10, noms[2])
      const D = translation(C, vecteur(B, A), noms[3])
      const O = milieu(A, C, noms[4], 'above right')
      const conditionsInitiales: InstructionIep[] = []
      let programmeAttendu: InstructionIep[] = []
      const instructionsDisponibles: InstructionsDisponiblesIep = []
      switch (listeTypeQuestions[i]) {
        case 1: // deux côtés consécutifs
          conditionsInitiales.push(
            { type: 'point', nom: noms[0], x: A.x, y: A.y, protege: true },
            { type: 'point', nom: noms[1], x: B.x, y: B.y, protege: true },
            { type: 'point', nom: noms[3], x: D.x, y: D.y, protege: true },
            { type: 'trait', p1: noms[0], p2: noms[1], protege: true },
            { type: 'trait', p1: noms[3], p2: noms[0], protege: true },
          )
          programmeAttendu = conditionsInitiales.slice()
          programmeAttendu.push(
            { type: 'parallele', p1: noms[0], p2: noms[1], p3: noms[3] },
            { type: 'parallele', p1: noms[3], p2: noms[0], p3: noms[1] },
            {
              type: 'intersection',
              etape1: 5,
              etape2: 6,
              choix: 1,
              nom: noms[2],
            },
            {
              type: 'polygone',
              sommets: `${noms[0]},${noms[1]},${noms[2]},${noms[3]}`,
            },
          )
          instructionsDisponibles.push(
            'parallele',
            'intersection',
            'polygone',
            'segment',
          )
          texte = `Compléter le programme de construction du parallélogramme $${nom}$ afin de terminer la figure ci-dessous.<br>`

          break
        case 2: // trois sommets consécutifs
          conditionsInitiales.push(
            { type: 'point', nom: noms[0], x: A.x, y: A.y, protege: true },
            { type: 'point', nom: noms[1], x: B.x, y: B.y, protege: true },
            { type: 'point', nom: noms[2], x: C.x, y: C.y, protege: true },
          )
          programmeAttendu = conditionsInitiales.slice()
          programmeAttendu.push(
            {
              type: 'milieu',
              p1: noms[0],
              p2: noms[2],
              protege: true,
              nom: noms[4],
            },
            { type: 'demiDroite', p1: noms[1], p2: noms[4], protege: true },
            { type: 'cercle', p1: noms[4], p2: noms[1], protege: true },
            {
              type: 'intersection',
              etape1: 4,
              etape2: 5,
              choix: D.y > B.y ? 1 : 2,
              nom: noms[3],
            },
            {
              type: 'polygone',
              sommets: `${noms[0]},${noms[1]},${noms[2]},${noms[3]}`,
            },
          )
          instructionsDisponibles.push(
            'segment',
            'intersection',
            'cercle',
            'milieu',
            'demiDroite',
            'polygone',
          )
          texte = `Compléter le programme de construction du parallélogramme $${nom}$ de centre $${noms[4]}$ afin de terminer la figure ci-dessous.<br>`
          break
        case 3: // deux sommets consécutifs et le centre
        default:
          conditionsInitiales.push(
            { type: 'point', nom: noms[0], x: A.x, y: A.y, protege: true },
            { type: 'point', nom: noms[1], x: B.x, y: B.y, protege: true },
            { type: 'point', nom: noms[4], x: O.x, y: O.y, protege: true },
          )
          programmeAttendu = conditionsInitiales.slice()
          programmeAttendu.push(
            { type: 'demiDroite', p1: noms[0], p2: noms[4], protege: true },
            { type: 'demiDroite', p1: noms[1], p2: noms[4], protege: true },
            { type: 'cercle', p1: noms[4], p2: noms[0], protege: true },
            { type: 'cercle', p1: noms[4], p2: noms[1], protege: true },
            {
              type: 'intersection',
              etape1: 3,
              etape2: 5,
              choix: 1,
              nom: noms[2],
            },
            {
              type: 'intersection',
              etape1: 4,
              etape2: 6,
              choix: 2,
              nom: noms[3],
            },
            {
              type: 'polygone',
              sommets: `${noms[0]},${noms[1]},${noms[2]},${noms[3]}`,
            },
          )
          instructionsDisponibles.push(
            'segment',
            'intersection',
            'cercle',
            'milieu',
            'demiDroite',
            'polygone',
          )
          texte = `Compléter le programme de construction du parallélogramme $${nom}$ de centre $${noms[4]}$ afin de terminer la figure ci-dessous.<br>`

          break
        case 4: {
          // un angle et le sommet opposé
          const angleAB = droite(A, B).angleAvecHorizontale
          const angleAD = droite(A, D).angleAvecHorizontale

          conditionsInitiales.push(
            { type: 'point', nom: noms[0], x: A.x, y: A.y, protege: true },
            { type: 'point', nom: noms[2], x: C.x, y: C.y, protege: true },
            {
              type: 'demiDroitePointDirection',
              p1: noms[0],
              angle: angleAB,
              protege: true,
            },
            {
              type: 'demiDroitePointDirection',
              p1: noms[0],
              angle: angleAD,
              protege: true,
            },
          )
          programmeAttendu = conditionsInitiales.slice()
          programmeAttendu.push(
            { type: 'paralleleAObjet', etape: 2, p1: noms[2] },
            { type: 'paralleleAObjet', etape: 3, p1: noms[2] },
            {
              type: 'intersection',
              etape1: 2,
              etape2: 5,
              choix: 1,
              nom: noms[1],
            },
            {
              type: 'intersection',
              etape1: 3,
              etape2: 4,
              choix: 1,
              nom: noms[3],
            },
            {
              type: 'polygone',
              sommets: `${noms[0]},${noms[1]},${noms[2]},${noms[3]}`,
            },
          )
          instructionsDisponibles.push(
            'segment',
            'intersection',
            'paralleleAObjet',
            'polygone',
            'prolongerObjet',
          )
          texte = `Compléter le programme de construction du parallélogramme $${nom}$ (sens des aiguilles d'une montre), afin de terminer la figure ci-dessous.<br>`
        }
      }

      texte += addEditeurIep(this, i, {
        masquerEtapesInitiales: true,
        sansOutils: true,
        conditionsInitiales,
        instructionsDisponibles,
        verifyCallbackName: VERIFICATION_PARALLELOGRAMME_CALLBACK_NAME,
      })
      const programmeAjoute = programmeAttendu.slice(conditionsInitiales.length)
      handleAnswers(this, i, {
        reponse: {
          value: JSON.stringify({
            conditionsInitiales,
            programmeAttendu: programmeAjoute,
          }),
        },
      })

      texteCorr = `Voici un programme de construction du parallélogramme $${nom}$ :<br>
        ${addEditeurIep(this, i, {
          masquerEtapesInitiales: true,
          sansOutils: true,
          id: `IepEditeur-corr-Ex${this.numeroExercice}Q${i}`,
          conditionsInitiales,
          interactivityOn: false,
          programmeInitial: programmeAjoute,
          instructionsDisponibles: [],
          verifyCallbackName: VERIFICATION_PARALLELOGRAMME_CALLBACK_NAME,
        })}`
      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        // Supprime b, c et d dans la ligne ci-dessus et remplace les par NombreAAjouter !
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
