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
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { mathalea2d } from '../../../modules/mathalea2d'
export const titre = "Déterminer le périmètre d'un triangle"
export const interactifReady = true

export const uuid = '31871'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class SommeDeProduitsCompleter extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const objets = []
    const a = this.quotaRandint('a', 11, 15) * 100
    const b = 2025
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
        `${texNombre(2025, 0)} \\text{ cm}`,
        milieu(A, B).x,
        milieu(A, B).y - 0.7,
        { letterSize: 'scriptsize' },
      ),
      latex2d(
        `${texNombre(a, 0)} \\text{ cm}`,
        milieu(B, C).x + 1,
        milieu(B, C).y + 0.5,
        { letterSize: 'scriptsize' },
      ),
      s1,
      s2,
      s3,
    )
    this.question = 'Quel est  le périmètre de ce triangle ?'
    this.reponse = 2 * a + b
    this.correction = `Le triangle est isocèle.<br>
            Son périmètre est : $(2\\times ${texNombre(a)}\\text{ cm}$) + $${texNombre(b)}\\text{ cm}$ $=${miseEnEvidence(texNombre(2 * a + b))}\\text{ cm}$.`

    this.question +=
      '<br>' +
      mathalea2d(
        {
          xmin: -0.5,
          ymin: -0.9,
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
