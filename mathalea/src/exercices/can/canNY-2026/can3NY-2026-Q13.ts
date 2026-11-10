import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'

import { codageSegments } from '../../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { mathalea2d } from '../../../modules/mathalea2d'
export const titre = 'Trouver une longueur'
export const interactifReady = true

export const uuid = 'olnpp'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class longueurDansTriangle2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const objets = []
    const a = this.canOfficielle ? 1500 : this.quotaRandint('a', 11, 15) * 100
    const b = 2026
    const A = pointAbstrait(0, 0, 'A', 'below')
    const B = pointAbstrait(5, 0, 'B', 'below')
    const C = pointAbstrait(2.5, 2, 'C', 'below')
    const s1 = segment(A, B)
    const s2 = segment(B, C)
    const s3 = segment(A, C)

    objets.push(
      codageSegments('||', bleuMathalea, B, C),
      codageSegments('||', bleuMathalea, C, A),
      latex2d(
        `${texNombre(b, 0)} \\text{ cm}`,
        milieu(A, B).x,
        milieu(A, B).y - 0.7,
        { letterSize: 'scriptsize' },
      ),
      latex2d('?', milieu(B, C).x + 1, milieu(B, C).y + 0.5, {
        letterSize: 'scriptsize',
      }),
      s1,
      s2,
      s3,
    )

    this.question = `Le périmètre de ce triangle est $${texNombre(2 * a + b)}\\text{ cm}$. <br>
        Que vaut la longueur indiquée par le point d'interrogation ?`
    this.reponse = a
    this.correction = `Le triangle est isocèle, il possède donc deux longueurs égales.<br>
            Puisque le périmètre est $${texNombre(2 * a + b)}\\text{ cm}$, on obtient la somme des deux longueurs égales du triangle en effectuant la différence $${texNombre(2 * a + b)}-${texNombre(b)}=${texNombre(2 * a)}\\text{ cm}$.<br>
            On obtient la longueur cherchée en divisant par $2$, soit $${texNombre(2 * a)}\\div 2=${miseEnEvidence(texNombre(a))}\\text{ cm}$.`
    this.question +=
      '<br>' +
      mathalea2d(
        {
          xmin: -0.5,
          ymin: -1,
          xmax: 6,
          ymax: 2.5,
          scale: 0.7,
          center: !context.isHtml,
        },
        objets,
      )

    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$\\ldots\\text{ cm}$'
  }
}
