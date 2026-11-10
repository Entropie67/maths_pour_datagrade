import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { grille } from '../../../lib/2d/Grille'
import { PointAbstrait } from '../../../lib/2d/PointAbstrait'
import { Polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer la longueur d'un contour"
export const interactifReady = true

export const uuid = '86c44'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025CM1Q15 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: 'u' }
  }

  nouvelleVersion() {
    const grillage = grille(3, 0, 10, 5, 'gray', 1, 1)
    const A = new PointAbstrait(4, 4)
    const B = new PointAbstrait(5, 4)
    const E = new PointAbstrait(6, 1)
    const F = new PointAbstrait(9, 1)
    const G = new PointAbstrait(9, 2)
    const H = new PointAbstrait(8, 2)
    const I = new PointAbstrait(8, 3)
    const J = new PointAbstrait(9, 3)
    const K = new PointAbstrait(9, 4)
    const L = new PointAbstrait(6, 4)
    const poly1 = new Polygone([E, F, G, H, I, J, K, L])
    const segU = segment(A, B)
    poly1.epaisseur = 3
    segU.epaisseur = 4
    const Unite = latex2d('1 \\text{u}', 4.4, 4.7, { letterSize: 'normalsize' })
    const objets = [grillage, poly1, Unite, segU]
    this.question = 'Donne la longueur du contour de cette figure.<br> '
    this.question += mathalea2d(
      Object.assign(
        { scale: 0.5, center: !context.isHtml },
        fixeBordures(objets),
      ),
      objets,
    )
    /* 
      this.canReponseACompleter = 'Figure $\\ldots$'
      */
    this.reponse = 14
    this.canEnonce = mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )
    this.canReponseACompleter =
      'La longueur du contour de cette figure est $\\ldots$ u.'

    this.correction = ` La longueur du contour est $${miseEnEvidence(14)}$ u.`
  }
}
