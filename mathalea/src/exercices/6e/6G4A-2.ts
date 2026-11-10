import { demiDroite } from '../../lib/2d/DemiDroite'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { codageAngle } from '../../lib/2d/angles'
import { texteParPoint } from '../../lib/2d/textes'
import { rotation } from '../../lib/2d/transformations'
import { triangle2points1angle1longueur } from '../../lib/2d/triangles'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

/**
 * Calcule le cosinus d'un angle en degrés
 */
function degCos(deg: number): number {
  return Math.cos((deg * Math.PI) / 180)
}

/**
 * Calcule le sinus d'un angle en degrés
 */
function degSin(deg: number): number {
  return Math.sin((deg * Math.PI) / 180)
}

export const interactifReady = true

export const amcType = 'qcmMono'
export const amcReady = true

export const titre = 'Reconnaitre un angle particulier'

export const dateDePublication = '03/12/2022'

/**
 * Reconnaitre un angle nul, aigu, droit, obtus, plat
 * @author Guillaume Valmont
 * 6G22-2
 */
export const uuid = 'fe08e'

export const refs = {
  'fr-fr': ['6G4A-2', '3AutoG03-1', '6AutoG1-6'],
  'fr-2016': ['6G22-2'],
  'fr-ch': ['9R1ES1C-2', '9R2ES1C-2', '9R3ES1C-2', 'PRQES01B-1'],
}
export default class ReconnaitreUnAngleParticulier extends Exercice {
  constructor() {
    super()

    this.correctionDetailleeDisponible = true
    this.nbQuestions = 4
    this.nbColsCorr = 2
    this.besoinFormulaireCaseACocher = [
      'Points confondus dans le cas des angles nuls',
    ]
    this.sup = false
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['nul', 'aigu', 'droit', 'obtus', 'plat']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, triangle, explications, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const objets2d = []
      const indiceNomA = randint(1, 26)
      const indiceNomB = randint(1, 26, [indiceNomA])
      const indiceNomC = randint(1, 26, [indiceNomA, indiceNomB])
      const distanceAB = 3
      const distanceCB = this.sup ? 3 : 4
      const A = pointAbstrait(0, 0, lettreDepuisChiffre(indiceNomA))
      let B = pointAdistance(A, distanceAB, lettreDepuisChiffre(indiceNomB))
      switch (listeTypeQuestions[i]) {
        case 'nul':
          triangle = triangle2points1angle1longueur(B, A, 0, distanceCB, -1)
          explications =
            'Un angle nul est un angle dont la mesure est égale à $0^\\circ$.'
          break
        case 'aigu':
          triangle = triangle2points1angle1longueur(
            B,
            A,
            randint(10, 80),
            distanceCB,
            -1,
          )
          explications =
            'Un angle aigu est un angle dont la mesure est comprise entre $0^\\circ$ et $90^\\circ$.'
          break
        case 'droit':
          triangle = triangle2points1angle1longueur(B, A, 90, distanceCB, -1)
          explications =
            'Un angle droit est un angle dont la mesure est égale à $90^\\circ$.'
          break
        case 'obtus':
          B = pointAbstrait(
            A.x + distanceAB * degCos(randint(-30, 30)),
            A.y + distanceAB * degSin(randint(-30, 30)),
            lettreDepuisChiffre(indiceNomB),
          )
          triangle = triangle2points1angle1longueur(
            B,
            A,
            randint(100, 170),
            distanceCB,
            -1,
          )
          explications =
            'Un angle obtus est un angle dont la mesure est supérieure à $90^\\circ$.'
          break
        case 'plat':
        default:
          B = pointAbstrait(
            A.x + distanceAB * degCos(randint(-30, 30)),
            A.y + distanceAB * degSin(randint(-30, 30)),
            lettreDepuisChiffre(indiceNomB),
          )
          triangle = triangle2points1angle1longueur(
            B,
            A,
            179.99,
            distanceCB,
            -1,
          )
          explications =
            'Un angle plat est un angle dont la mesure est égale à $180^\\circ$.'
          break
      }
      const C = triangle.listePoints[2]
      C.nom = lettreDepuisChiffre(indiceNomC)
      const points = [A, B, C]
      const angle = codageAngle(
        A,
        B,
        C,
        listeTypeQuestions[i] === 'droit' ? 1 : 2,
      )
      const demiDroiteBA = demiDroite(B, A)
      const demiDroiteCA = demiDroite(B, C)
      objets2d.push(
        tracePoint(...points),
        texteParPoint(A.nom, rotation(A, B, 10)),
        texteParPoint(C.nom, rotation(C, B, -10)),
        texteParPoint(B.nom, rotation(B, A, -10)),
        angle,
        demiDroiteBA,
        demiDroiteCA,
      )
      // On affiche le cadre mathalea2d
      const pointsX = []
      const pointsY = []
      for (const point of points) {
        pointsX.push(point.x)
        pointsY.push(point.y)
      }
      const xmin = Math.min(...pointsX) - 2.2
      const xmax = Math.max(...pointsX) + 2.2
      const ymin = Math.min(...pointsY) - 2.2
      const ymax = Math.max(...pointsY) + 2.2
      const parametres2d = {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 20,
        scale: 0.4,
      }
      const enonceFigure =
        'Dans la figure ci-dessous :<br>' + mathalea2d(parametres2d, objets2d)
      texte = ''
      texteCorr = ''
      // On construit les questions

      const questionReponse = {
        question:
          enonceFigure +
          '$\\widehat{' +
          A.nom +
          B.nom +
          C.nom +
          '}$ est un angle :',
        propositions: ['nul', 'aigu', 'droit', 'obtus', 'plat'],
        reponses: [listeTypeQuestions[i]],
        explications,
      }
      const propositions = []
      for (const proposition of questionReponse.propositions) {
        let statut = false
        for (const reponse of questionReponse.reponses) {
          if (proposition === reponse) statut = true
        }
        propositions.push({
          texte: proposition,
          statut,
          feedback: '',
        })
      }
      this.autoCorrection[i] = {
        enonce: questionReponse.question,
        options: { ordered: true },
        propositions,
      }
      const monQcm = propositionsQcm(this, i)
      texte += context.isAmc ? '' : questionReponse.question + '<br>'
      texte += monQcm.texte
      texteCorr += context.isAmc ? '' : questionReponse.question + '<br>'
      texteCorr += monQcm.texteCorr
      if (this.correctionDetaillee) {
        texteCorr += questionReponse.explications + '<br>'
      }
      if (
        this.questionJamaisPosee(
          i,
          ...pointsX,
          ...pointsY,
          listeTypeQuestions[i],
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
