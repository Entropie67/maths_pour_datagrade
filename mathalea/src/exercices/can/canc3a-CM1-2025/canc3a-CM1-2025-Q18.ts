import { PointAbstrait, pointAbstrait } from '../../../lib/2d/PointAbstrait'
import ExerciceSimple from '../../ExerciceSimple'

import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { Polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
export const titre =
  "Calculer la longueur d'un côté d'un triangle connaissant la longueur de son contour"
export const interactifReady = true

export const uuid = '66e74'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025CM1Q18 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: '$\\text{ cm}$.' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const A = new PointAbstrait(0, 0)
    const B = new PointAbstrait(6, 0)
    const C = new PointAbstrait(2.5, 3.3)
    const triangle = new Polygone([A, B, C])
    const cote1 = segment(pointAbstrait(0, -0.5), pointAbstrait(6, -0.5))
    const cote2 = segment(pointAbstrait(6.4, 0.2), pointAbstrait(2.65, 3.6))
    const cote3 = segment(pointAbstrait(2, 3.45), pointAbstrait(-0.3, 0.28))
    cote1.styleExtremites = '<->'
    cote2.styleExtremites = '<->'
    cote3.styleExtremites = '<->'
    triangle.epaisseur = 2
    const l1 = this.canOfficielle ? 6 : randint(5, 9)
    const l2 = this.canOfficielle ? 5 : l1 - 1
    const l3 = this.canOfficielle ? 4 : l1 - choice([2, 3])
    const longueur1 = latex2d(`${l1} \\text{ cm}`, 3, -1, {
      letterSize: 'normalsize',
    })
    const longueur2 = latex2d(`${l2} \\text{ cm}`, 5.5, 2, {
      letterSize: 'normalsize',
    })
    const longueur3 = latex2d('\\ldots \\text{ cm}', -0.5, 2, {
      letterSize: 'normalsize',
    })
    const objets = [
      triangle,
      cote1,
      cote2,
      cote3,
      longueur1,
      longueur2,
      longueur3,
    ]

    this.question = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'block', pixelsParCm: 25 } as const,
        fixeBordures(objets),
      ),
      objets,
    )
    this.question += `La longueur du contour de ce triangle est de $${l1 + l2 + l3}\\text{ cm}$.<br>`
    if (!this.interactif) {
      this.question += 'Complète.'
    } else {
      this.question += 'La longueur manquante est : '
    }
    this.canEnonce = `La longueur du contour de ce triangle est de $${l1 + l2 + l3}\\text{ cm}$.<br>
    Complète. `
    this.canReponseACompleter = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'block', pixelsParCm: 25 } as const,
        fixeBordures(objets),
      ),
      objets,
    )
    this.reponse = texNombre(l3, 0)
    this.correction = `La longueur du côté est donnée par : <br>
    $${l1 + l2 + l3}-${l1}-${l2}=${miseEnEvidence(l3)}\\text{ cm}$.`
  }
}
