import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { latex2d } from '../../../lib/2d/textes'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Ordre de grandeur'
export const interactifReady = true

export const uuid = '89710'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/

export default class Can2025CE1Q15 extends ExerciceCan {
  enonce(a?: number) {
    if (a == null) {
      a = choice([0, 1, 2, 4])
    }
    const A = pointAbstrait(0, 1, 'A')
    const B = pointAbstrait(1, 0, 'B')
    const C = pointAbstrait(2, 1, 'C')
    const D = pointAbstrait(1, 2, 'D') // carré
    const E = pointAbstrait(3, 2, 'E')
    const F = pointAbstrait(6, 2, 'F')
    const G = pointAbstrait(6, 3, 'G')
    const H = pointAbstrait(3, 3, 'H') // rectangle
    const I = pointAbstrait(5, -1, 'I')
    const J = pointAbstrait(6, -1, 'J')
    const K = pointAbstrait(6, 0, 'K')
    const L = pointAbstrait(5.5, 1, 'L')
    const M = pointAbstrait(5, 0, 'M') // maison
    const N = pointAbstrait(2, -1, 'N')
    const O = pointAbstrait(3.5, -1, 'O')
    const P = pointAbstrait(4, 1, 'P')
    const Q = pointAbstrait(2, 0, 'Q')
    const poly1 = polygone([A, B, C, D], 'black')
    const poly2 = polygone([E, F, G, H], 'black')
    const poly3 = polygone([I, J, K, L, M], 'black')
    const poly4 = polygone([N, O, P, Q], 'black')
    const xmin = -0.5
    const ymin = -1.3
    const xmax = 7
    const ymax = 3.5
    const objets = []
    objets.push(poly1, poly2, poly3, poly4)
    objets.push(latex2d('1', 1, 1, { letterSize: 'scriptsize' }))
    objets.push(latex2d('2', 4.5, 2.5, { letterSize: 'scriptsize' }))
    objets.push(latex2d('3', 5.5, -0.5, { letterSize: 'scriptsize' }))
    objets.push(latex2d('4', 2.8, -0.5, { letterSize: 'scriptsize' }))
    this.autoCorrection[0] = {
      propositions: [
        {
          texte: 'Figure $1$ ',
          statut: a === 4,
        },
        {
          texte: 'Figure $2$ ',
          statut: a === 2,
        },
        {
          texte: 'Figure $3$ ',
          statut: a === 1,
        },
        {
          texte: 'Figure $4$ ',
          statut: a === 0,
        },
      ],
      options: { vertical: false },
    }
    this.formatInteractif = 'qcm'
    this.consigne =
      `Quelle est la figure ${a === 0 ? "n'" : ''}
    ayant ${a === 1 ? 'un seul axe de symétrie' : a === 0 ? 'aucun axe de symétrie' : `que $${a}$ axes de symétrie`}${sp()}?` +
      mathalea2d(
        {
          xmin,
          ymin,
          xmax,
          ymax,
          pixelsParCm: 30,
          mainlevee: false,
          amplitude: 0.5,
          scale: 0.6,
          center: !context.isHtml,
        },
        objets,
      ) 
    const monQcm = propositionsQcm(this, 0)
    this.canEnonce =
      mathalea2d(
        {
          xmin,
          ymin,
          xmax,
          ymax,
          pixelsParCm: 30,
          mainlevee: false,
          amplitude: 0.5,
          scale: 0.6,
          center: !context.isHtml,
        },
        objets,
      ) 
    this.canEnonce += `Quelle est la figure ayant ${a === 1 ? 'un seul axe de symétrie' : a === 0 ? 'aucun axe de symétrie' : `$${a}$ axes de symétrie`}${sp()}?`
    this.question = `${monQcm.texte}`
    this.correction =
      monQcm.texteCorr +
      `Le carré (figure $1$) a $4$ axes de symétrie, le rectangle (figure $2$) en a $2$, la maison (figure $3$) en a un et la figure $4$ n'en a pas. La réponse est donc la ${texteEnCouleurEtGras(`figure $\\mathbf{${[4, 2, 1, 0].indexOf(a) + 1}}$`)}.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1)
    else this.enonce()
  }
}
