import { codageSegments } from '../../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segmentAvecExtremites } from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer l’abscisse d’un milieu'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication sptembre 2021
*/
export const dateDeModifImportante = '06/12/2021'
export const uuid = '9ae55'

export const refs = {
  'fr-fr': ['can3C4-03'],
  'fr-ch': [],
}
export default class MilieuEntre1EtFraction extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 5)
    const c = this.quotaRandint('c', 1, 9)
    const b = arrondi(a + c + this.quotaRandint('b', 1, 9, [5]) / 5)
    const A = pointAbstrait(0, 0, '1', 'below')
    const B = pointAbstrait(4, 0, 'M', 'below')
    const C = pointAbstrait(8, 0)
    const objets = []
    objets.push(
      segmentAvecExtremites(A, B),
      segmentAvecExtremites(B, C),
      codageSegments('||', bleuMathalea, A, B, B, C),
    )
    objets.push(
      texteParPosition(`${stringNombre(a)}`, 0, -0.7, 0, 'black', 1.5),
    )
    objets.push(texteParPosition('M', 4, -0.7, 0, 'black', 1.5))
    objets.push(
      texteParPosition(`${stringNombre(b, 1)}`, 8, -0.7, 0, 'black', 1.5),
    )
    this.question = `Donner l'abscisse du point $M$ sous forme décimale.<br>
    
    `
    this.question += mathalea2d(
      {
        xmin: -1,
        ymin: -3,
        xmax: 10,
        ymax: 1,
        pixelsParCm: 30,
        mainlevee: false,
        amplitude: 0.5,
        scale: 0.6,
        center: !context.isHtml,
      },
      objets,
    )
    this.correction = `On calcule la moyenne de $${texNombre(a)}$ et $${texNombre(b)}$ :<br>
    $x_M=\\dfrac{${texNombre(a)}+${texNombre(b)}}{2}=
    \\dfrac{${texNombre(a + b)}}{2}=${miseEnEvidence(texNombre((a + b) / 2))}$`

    this.reponse = (a + b) / 2
  }
}
