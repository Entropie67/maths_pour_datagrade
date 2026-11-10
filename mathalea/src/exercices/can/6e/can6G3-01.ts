import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { codageSegments } from '../../../lib/2d/CodageSegment'
import { droite } from '../../../lib/2d/droites'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import {
  segment,
  segmentAvecExtremites,
} from '../../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../../lib/2d/textes'
import { tracePointSurDroite } from '../../../lib/2d/TracePointSurDroite'
import { bleuMathalea } from '../../../lib/colors'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre un problème de longueurs'
export const dateDePublication = '2/11/2021'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * @author Jean-claude Lhote
 * Créé le 2/11/2021

 */
export const uuid = 'd30d1'

export const refs = {
  'fr-fr': ['can6G3-01', '6M1E-flash1'],
  'fr-ch': [],
}
export default class ProblemesDeLongueurs extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.typeExercice = 'simple'

    this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
  }

  nouvelleVersion() {
    const objets = []
    const pointsSurDE = []
    const pointsSurAB = []
    const b = this.quotaRandint('b', 2, 5)
    const a = randint(2, 8 - b)
    const c = this.quotaRandint('c', 2, 9)
    const A = pointAbstrait(0, 0, 'A', 'below')
    const B = pointAbstrait(16, 0, 'B', 'below')
    const AB = segmentAvecExtremites(A, B)
    objets.push(labelPoint(A, B), AB)
    const dd = droite(A, B)
    for (let i = 1; i < b; i++) {
      pointsSurAB.push(
        pointAbstrait((i * 16) / b, 0),
        pointAbstrait((i * 16) / b, 0),
      )
      objets.push(tracePointSurDroite(pointsSurAB[2 * (i - 1)], dd))
    }
    pointsSurAB[2 * (b - 2)].nom = 'C'
    pointsSurAB[2 * (b - 2)].positionLabel = 'below'
    objets.push(codageSegments('//', 'red', A, ...pointsSurAB, B))
    const D = pointAbstrait(((b - 1) * 16) / b, 2, 'D', 'above')
    const x = D.x
    const E = pointAbstrait(16, 2, 'E', 'above')
    const l = E.x - D.x
    const F = pointAbstrait(x + ((a - 1) * l) / a, 2, 'F', 'above')
    const DE = segmentAvecExtremites(D, E)
    const d = droite(D, E)
    objets.push(DE, labelPoint(D, E, pointsSurAB[2 * (b - 2)]))
    for (let i = 1; i < a; i++) {
      pointsSurDE.push(
        pointAbstrait(x + (i * l) / a, 2),
        pointAbstrait(x + (i * l) / a, 2),
      )
      objets.push(tracePointSurDroite(pointsSurDE[2 * (i - 1)], d))
    }
    const s1 = segment(pointsSurAB[pointsSurAB.length - 1], D, 'green')
    const s2 = segment(B, E, 'green')
    s1.pointilles = 2
    s2.pointilles = 2
    const abc = a * b * c
    objets.push(
      // texteSurSegment(String(c), F, E),
      labelPoint(F),
      codageSegments('/', bleuMathalea, D, ...pointsSurDE, E),
      s1,
      s2,
    )
    this.question =
      `Sachant que $FE=${c}\\text{ cm}$ et que $CB=DE$, déterminer $AB$.<br>

    ` +
      mathalea2d(
        {
          xmin: -0.5,
          ymin: -2,
          xmax: 16.5,
          ymax: 3.5,
          scale: 0.45,
          center: !context.isHtml,
        },
        objets,
      )
    this.reponse = abc
    this.correction = `Comme $AB=${b}\\times DE$ et $DE=${a}\\times FE$, alors $AB=${b}\\times${a}\\times ${c} \\text{ cm} =${miseEnEvidence(this.reponse)}\\text{ cm}$.`
  }
}
