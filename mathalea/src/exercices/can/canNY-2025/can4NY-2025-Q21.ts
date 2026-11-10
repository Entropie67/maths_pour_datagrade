import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../../lib/2d/CodageSegment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { mathalea2d } from '../../../modules/mathalea2d'
export const titre = 'Calculer un périmètre'
export const interactifReady = true

export const uuid = 'e45ab'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class perimetreCalcul extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const objets = []
    const diviseur = this.quotaChoice('diviseur', [1, 10, 100, 1000])
    const a = new Decimal(2025).div(diviseur)
    const A = pointAbstrait(0, 0, 'A', 'below')
    const B = pointAbstrait(6, 0, 'B', 'below')
    const C = pointAbstrait(6, 6, 'C', 'below')
    const D = pointAbstrait(0, 6, 'D', 'below')
    const s1 = segment(A, B)
    const s2 = segment(B, C)
    const s3 = segment(C, D)
    const s4 = segment(A, D)

    objets.push(
      latex2d(
        `${texNombre(new Decimal(a), 3)} \\text{ cm}`,
        8,
        milieu(B, C).y + 0.7,
        { letterSize: 'scriptsize' },
      ),
      codageSegments('||', bleuMathalea, A, B),
      codageSegments('||', bleuMathalea, B, C),
      codageSegments('||', bleuMathalea, C, D),
      codageSegments('||', bleuMathalea, A, D),
      codageAngleDroit(D, A, B),
      codageAngleDroit(A, B, C),
      codageAngleDroit(B, C, D),
      codageAngleDroit(C, D, A),
      s1,
      s2,
      s3,
      s4,
    )
    this.question = 'Quel est le périmètre de ce carré ? '

    this.question +=
      '<br>' +
      mathalea2d(
        Object.assign(
          { scale: 0.4, center: !context.isHtml },
          fixeBordures(objets),
        ),
        objets,
      )
    this.reponse = texNombre(new Decimal(a).mul(4), 4)
    this.correction = `Il s'agit d'un carré. <br>
          Son périmètre est donc
         $4$ fois la longueur de son côté, soit $4\\times ${texNombre(a)}=${miseEnEvidence(this.reponse)}\\text{ cm}$.`

    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$\\ldots\\text{ cm}$'
  }
}
