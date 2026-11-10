import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'
export const titre = "Donner le nombre de faces d'un cube (QCM)"
export const interactifReady = true

export const uuid = '9552b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025CE2QXX extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  dessinerCube() {
    // Dessin du cube en perspective cavalière (3 faces visibles)
    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(3, 0)
    const C = pointAbstrait(3, 3)
    const D = pointAbstrait(0, 3)
    const F = pointAbstrait(4, 1)
    const G = pointAbstrait(4, 4)
    const H = pointAbstrait(1, 4)

    // Face avant (carré ABCD)
    const AB = segment(A, B)
    const BC = segment(B, C)
    const CD = segment(C, D)
    const DA = segment(D, A)

    // Face supérieure visible (DCGH)
    const DH = segment(D, H)
    const CG = segment(C, G)
    const GH = segment(G, H)

    // Face droite visible (BCGF)
    const BF = segment(B, F)
    const FG = segment(F, G)

    // Épaisseur pour toutes les arêtes visibles
    AB.epaisseur = 2
    BC.epaisseur = 2
    CD.epaisseur = 2
    DA.epaisseur = 2
    DH.epaisseur = 2
    CG.epaisseur = 2
    GH.epaisseur = 2
    BF.epaisseur = 2
    FG.epaisseur = 2

    const objets = [AB, BC, CD, DA, DH, CG, GH, BF, FG]

    return mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'inline-block', pixelsParCm: 20 } as const,
        fixeBordures(objets),
      ),
      objets,
    )
  }

  enonce() {
    this.autoCorrection[0] = {
      propositions: [
        {
          texte: '$3$ faces',
          statut: false,
        },
        {
          texte: '$6$ faces',
          statut: true,
        },
        {
          texte: '$8$ faces',
          statut: false,
        },
      ],
      options: { vertical: !context.isHtml },
    }

    const dessin = this.dessinerCube()

    this.consigne = `${dessin}<br>Combien le cube a-t-il de faces${sp()}?<br>Coche la bonne réponse.`
    const monQcm = propositionsQcm(this, 0)
    this.canEnonce = this.consigne
    this.question = `${monQcm.texte}`
    this.correction =
      monQcm.texteCorr + `Un cube possède $${miseEnEvidence(6)}$ faces.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    this.enonce()
  }
}
