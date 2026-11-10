import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { grille } from '../../../lib/2d/Grille'
import { PointAbstrait } from '../../../lib/2d/PointAbstrait'
import { Polygone } from '../../../lib/2d/polygones'
import { latex2d } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Comparer deux périmètres'
export const interactifReady = true

export const uuid = '7d7ee'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N6Q15 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsDeComparaison = { texteSansCasse: true }
    this.optionsChampTexte = { texteAvant: 'Figure ' }
    this.formatChampTexte = KeyboardType.alphanumeric
  }

  nouvelleVersion() {
    const grillage = grille(0, 0, 10, 5, 'gray', 1, 1)
    const A = new PointAbstrait(1, 1)
    const B = new PointAbstrait(4, 1)
    const C = new PointAbstrait(4, 4)
    const D = new PointAbstrait(1, 4)
    const E = new PointAbstrait(6, 1)
    const F = new PointAbstrait(9, 1)
    const G = new PointAbstrait(9, 2)
    const H = new PointAbstrait(8, 2)
    const I = new PointAbstrait(8, 3)
    const J = new PointAbstrait(9, 3)
    const K = new PointAbstrait(9, 4)
    const L = new PointAbstrait(6, 4)
    const poly1 = new Polygone([A, B, C, D])
    const poly2 = new Polygone([E, F, G, H, I, J, K, L])
    poly1.couleurDeRemplissage = colorToLatexOrHTML('gray')
    poly2.couleurDeRemplissage = colorToLatexOrHTML('gray')
    const figureA = latex2d('\\text{A}', 2.5, 2.5, { letterSize: 'normalsize' })
    const figureB = latex2d('\\text{B}', 7, 2.5, { letterSize: 'normalsize' })
    const objets = [grillage, poly1, poly2, figureA, figureB]
    this.question = 'Quelle figure a le plus grand périmètre ? '
    this.question += mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )

    if (this.interactif) {
      this.autoCorrection[0] = {
        enonce: this.question,
        options: { vertical: false, ordered: true },
        propositions: [
          {
            texte: 'Figure $A$',
            statut: false,
          },
          {
            texte: 'Figure $B$',
            statut: true,
          },
        ],
      }
      this.formatInteractif = 'qcm'

      const monQcm = propositionsQcm(this, 0)
      this.question += this.interactif ? `${monQcm.texte}` : ''
    }

    this.reponse = 'B'
    this.canEnonce = mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )
    this.canReponseACompleter =
      'Quelle figure a le plus grand périmètre ? $\\ldots$'

    this.correction = `Le périmètre est la longueur du contour donc c'est la figure  $${miseEnEvidence('B')}$ qui a le plus grand périmètre.`

    this.canNumeroLie = 15
    this.canLiee = [16]
  }
}
