import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { rotation } from '../../lib/2d/transformations'
import { angle } from '../../lib/2d/utilitairesGeometriques'
import {
  addEditeurIep,
  ElementIepEditeur,
  pointsConstruitsDepuisProgramme,
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

export const titre = 'Construire deux triangles de même aire'

export const dateDePublication = '04/08/2026'
export const interactifReady = true

export const uuid = 'e5g3a'
export const refs = {
  'fr-fr': ['5G5G-3'],
  'fr-ch': ['9R2ES2F-3', '9R3ES2F-3'],
}

const VERIFICATION_MEME_AIRE_CALLBACK_NAME = '5G5G-3-verification-meme-aire'
const TOLERANCE_AIRE = 1e-6

type TriangleTrace = {
  sommets: [PointAbstrait, PointAbstrait, PointAbstrait]
  aire: number
}

function aireTriangle(A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) {
  return Math.abs((B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x)) / 2
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
    const aire = aireTriangle(A, B, C)
    if (aire > TOLERANCE_AIRE) triangles.push({ sommets: [A, B, C], aire })
  }
  return triangles
}

function contientDeuxTrianglesDeMemeAire(programme: InstructionIep[]) {
  const triangles = trianglesDuProgramme(programme)
  for (let i = 0; i < triangles.length; i++) {
    for (let j = i + 1; j < triangles.length; j++) {
      if (Math.abs(triangles[i].aire - triangles[j].aire) <= TOLERANCE_AIRE) {
        return { ok: true, triangles }
      }
    }
  }
  return { ok: false, triangles }
}

export const verifierDeuxTrianglesMemeAire: ElementIepVerificationCallback = ({
  studentProgram,
}) => {
  const resultat = contientDeuxTrianglesDeMemeAire(studentProgram)
  return {
    isOk: resultat.ok,
    feedback: resultat.ok
      ? 'Bravo ! Deux triangles tracés ont la même aire.'
      : resultat.triangles.length < 2
        ? 'Il faut tracer deux triangles.'
        : 'Les triangles tracés n’ont pas la même aire.',
    score: {
      nbBonnesReponses: resultat.ok ? 1 : 0,
      nbReponses: 1,
    },
  }
}

ElementIepEditeur.registerVerificationCallback(
  VERIFICATION_MEME_AIRE_CALLBACK_NAME,
  verifierDeuxTrianglesMemeAire,
)

/**
 * Construire deux triangles de même aire à partir d'un triangle.
 * @author Jean-Claude Lhote
 */
export default class ConstruireDeuxTrianglesMemeAire extends Exercice {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.consigne = ''
    this.besoinFormulaireTexte = [
      'Type de construction',
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Avec le milieu d’un côté',
        '2 : Avec le symétrique d’un sommet',
      ].join('\n'),
    ]

    this.sup = '0'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const typesDisponibles = ['milieu', 'symetrique']
    const typesDeConstructionDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 0,
      listeOfCase: typesDisponibles,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeConstruction = combinaisonListes(
      typesDeConstructionDisponibles,
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

      const nomDuTriangleEnonce = creerNomDePolygone(3, 'Q')
      const nomSommets = combinaisonListes(Array.from(nomDuTriangleEnonce), 3)
      for (let j = 0; j < 3; j++) {
        S[j].nom = nomSommets[j]
      }

      const typeConstruction = listeTypeConstruction[i]
      texte +=
        typeConstruction === 'milieu'
          ? `Dans le triangle $${nomDuTriangleEnonce}$, construire deux triangles de même aire.<br>`
          : `Tracer le triangle $${nomDuTriangleEnonce}$ et construire un deuxième triangle de même aire.<br>`

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
      ]
      if (typeConstruction === 'milieu') {
        conditionsInitiales.push({
          type: 'polygoneRapide',
          sommets: `${S[0].nom},${S[1].nom},${S[2].nom}`,
        })
      }
      const instructionsDisponibles: TypeInstructionIep[] =
        typeConstruction === 'milieu'
          ? [
              'milieu',
              'codageMilieu',
              'segment',
              'polygone',
              'polygoneRapide',
              'droite',
              'mediatrice',
            ]
          : ['demiTourPoint', 'segment', 'polygone', 'polygoneRapide']
      const programmeAttendu: InstructionIep[] =
        typeConstruction === 'milieu'
          ? [
              ...conditionsInitiales,
              { type: 'milieu', nom: 'I', p1: S[0].nom, p2: S[1].nom },
              {
                type: 'codageMilieu',
                p1: S[0].nom,
                p2: 'I',
                p3: S[1].nom,
                codage: '/',
              },
              { type: 'polygoneRapide', sommets: `${S[2].nom},${S[0].nom},I` },
              { type: 'polygoneRapide', sommets: `${S[2].nom},I,${S[1].nom}` },
            ]
          : [
              ...conditionsInitiales,
              {
                type: 'demiTourPoint',
                nom: `${S[1].nom}'`,
                p1: S[1].nom,
                p2: S[0].nom,
              },
              {
                type: 'polygoneRapide',
                sommets: `${S[2].nom},${S[0].nom},${S[1].nom}`,
              },
              {
                type: 'polygoneRapide',
                sommets: `${S[2].nom},${S[0].nom},${S[1].nom}'`,
              },
            ]
      const programmeAjoute = programmeAttendu.slice(conditionsInitiales.length)
      handleAnswers(this, i, {
        reponse: { value: JSON.stringify({ typeConstruction }) },
      })
      texte += addEditeurIep(this, i, {
        masquerEtapesInitiales: true,
        sansOutils: true,
        conditionsInitiales,
        instructionsDisponibles,
        verifyCallbackName: VERIFICATION_MEME_AIRE_CALLBACK_NAME,
      })

      const texteCorr = `${
        typeConstruction === 'milieu'
          ? `On construit le milieu $I$ du côté $[${S[0].nom}${S[1].nom}]$. La médiane issue de $${S[2].nom}$ partage le triangle $${nomDuTriangleEnonce}$ en deux triangles de même aire.`
          : `Le point $${S[0].nom}$ est le milieu du segment $[${S[1].nom}${S[1].nom}']$. Dans le triangle $${S[2].nom}${S[1].nom}${S[1].nom}'$, la droite $(${S[2].nom}${S[0].nom})$ est donc une médiane. Une médiane dans un triangle partage ce triangle en deux triangles de même aire.`
      }<br>
      ${addEditeurIep(this, i, {
        masquerEtapesInitiales: true,
        sansOutils: true,
        id: `IepEditeur-corr-Ex${this.numeroExercice}Q${i}`,
        conditionsInitiales,
        interactivityOn: false,
        programmeInitial: programmeAjoute,
      })}`
      if (this.questionJamaisPosee(i, typeConstruction, angA, angB, angC)) {
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
