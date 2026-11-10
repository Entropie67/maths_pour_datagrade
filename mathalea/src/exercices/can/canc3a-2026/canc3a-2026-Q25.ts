import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../../lib/2d/CodageSegment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Donner la nature d'un quadrilatère"
export const interactifReady = true

export const uuid = '7372a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can20266Q25 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  enonce() {
    // Carré posé sur une pointe (rotation 45°)
    const A = pointAbstrait(0, 2)
    const B = pointAbstrait(2, 0)
    const C = pointAbstrait(0, -2)
    const D = pointAbstrait(-2, 0)
    const carre = polygone(A, B, C, D)
    carre.epaisseur = 2
    const marques = codageSegments('|', 'black', A, B, B, C, C, D, D, A)
    const angleA = codageAngleDroit(D, A, B, 'black', 0.4)
    const angleB = codageAngleDroit(A, B, C, 'black', 0.4)
    const angleC = codageAngleDroit(B, C, D, 'black', 0.4)
    const angleD = codageAngleDroit(C, D, A, 'black', 0.4)

    const objets = [carre, marques, angleA, angleB, angleC, angleD]
    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 0.7, mainlevee: true },
        fixeBordures(objets, {
          rxmin: -0.5,
          rxmax: 0.5,
          rymin: -0.5,
          rymax: 0.5,
        }),
      ),
      objets,
    )

    this.question =
      `${context.isHtml ? '<u>Vrai - Faux</u><br>' : '\\underline{Vrai - Faux}<br>'}
    Ce quadrilatère est un carré.<br>` + figure

    this.autoCorrection[0] = {
      enonce: this.question,
      options: { vertical: false },
      propositions: [
        {
          texte: 'Vrai',
          statut: true,
        },
        {
          texte: 'Faux',
          statut: false,
        },
      ],
    }
    const monQcm = propositionsQcm(this, 0)
    this.question += monQcm.texte

    this.correction = `${texteEnCouleurEtGras('Vrai')}. Ce quadrilatère a $4$ côtés de même longueur et $4$ angles droits : c'est bien un carré.`

    this.canEnonce =
      `\\underline{Vrai - Faux}<br>
    Ce quadrilatère est un carré.<br>` +
      figure +
      `
    ${texteEnCouleurEtGras('Entoure la bonne réponse', 'black')}`
    this.canReponseACompleter = 'Vrai \\quad Faux'
  }

  nouvelleVersion() {
    this.enonce()
  }
}
