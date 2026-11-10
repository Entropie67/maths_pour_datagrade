import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { grille } from '../../../lib/2d/Grille'
import { PointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Calculer la longueur d'un segment par comparaison"
export const interactifReady = true

export const uuid = 'e22ff'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025CM1Q17 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: '$\\text{ cm}$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const grillage = grille(0, 0, 8, 3, 'gray', 1, 1)
    const A = new PointAbstrait(1, 1)
    const B = new PointAbstrait(2, 1)
    const seg1 = segment(A, B)
    const C = new PointAbstrait(4, 2)
    const D = new PointAbstrait(1, 2)
    const seg2 = segment(C, D)
    const l1 = this.canOfficielle ? 27 : randint(2, 10) * 3
    const l2 = l1 / 3
    seg1.epaisseur = 3
    seg2.epaisseur = 3
    const long = latex2d(`${l1}\\text{ cm}`, 3, 2.5, {
      letterSize: 'normalsize',
    })
    const longCherche = latex2d('\\ldots \\text{ cm}', 2, 0.5, {
      letterSize: 'normalsize',
    })
    const objets = [grillage, seg1, seg2, long, longCherche]
    this.question = 'Complète.'
    this.question += mathalea2d(
      Object.assign({ scale: 0.5, pixelsParCm: 30 }, fixeBordures(objets)),
      objets,
    )
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )
    this.reponse = texNombre(l2, 0)
    this.correction = `Chaque carreau a une longueur de $${l1}\\div 3 = ${texNombre(l1 / 3, 0)}\\text{ cm}$, ainsi la longueur du segment est  $${miseEnEvidence(this.reponse)}\\text{ cm}$.`
  }
}
