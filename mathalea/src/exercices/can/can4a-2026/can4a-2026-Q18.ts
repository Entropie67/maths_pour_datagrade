import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  "Expression du périmètre d'un rectangle en fonction de sa largeur"
export const interactifReady = true

export const uuid = 'r70zj'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ18 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsChampTexte = { texteApres: '$\\text{ cm}$.' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(longueur?: number) {
    if (longueur == null) {
      longueur = randint(5, 15)
    }

    // Rectangle de dimensions fixes pour l'affichage
    const largeur = 3
    const long = 5

    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(long, 0)
    const C = pointAbstrait(long, largeur)
    const D = pointAbstrait(0, largeur)

    const rect = polygone(A, B, C, D)

    // Codages des angles droits aux 4 coins
    const angleA = codageAngleDroit(D, A, B, 'black', 0.4)
    const angleB = codageAngleDroit(A, B, C, 'black', 0.4)
    const angleC = codageAngleDroit(B, C, D, 'black', 0.4)
    const angleD = codageAngleDroit(C, D, A, 'black', 0.4)

    // Label de la longueur (en haut, au-dessus du rectangle)
    const labelLongueur = latex2d(
      `${texNombre(longueur)} \\text{ cm}`,
      milieu(D, C).x,
      milieu(D, C).y + 0.6,
      { color: 'black' },
    )

    // Label de la largeur (à gauche du rectangle)
    const labelLargeur = latex2d(
      `x \\text{ cm}`,
      milieu(A, D).x - 1,
      milieu(A, D).y,
      { color: 'black' },
    )

    const objets = [
      rect,
      angleA,
      angleB,
      angleC,
      angleD,
      labelLongueur,
      labelLargeur,
    ]

    const bordures = fixeBordures(objets)

    const figure = mathalea2d(
      Object.assign({
        scale: 0.6,
        xmin: bordures.xmin - 1,
        xmax: bordures.xmax + 0.5,
        ymin: bordures.ymin - 0.5,
        ymax: bordures.ymax,
      }),
      objets,
    )
    this.optionsDeComparaison = { calculFormel: true }
    this.question = `${figure}
    Le périmètre de ce rectangle en fonction de $x$ est `

    this.correction = `Le périmètre d'un rectangle est donné par la formule :<br>
    $\\mathcal{P}=2\\times\\text{longueur}+2\\times\\text{largeur}$<br>
    $\\begin{aligned}
    \\mathcal{P}&=2\\times ${longueur}+2\\times x\\\\
    &=${miseEnEvidence(`${2 * longueur}+2x`)}\\text{ cm}
    \\end{aligned}$`

    this.reponse = `${2 * longueur}+2x`
    this.canReponseACompleter = ' $\\ldots\\text{ cm}$'
    if (!this.interactif) {
      this.question += ' $\\ldots \\text{ cm}$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(9)
    else this.enonce()
  }
}
