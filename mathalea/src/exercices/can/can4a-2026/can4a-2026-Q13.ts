import { codageSegments } from '../../../lib/2d/CodageSegment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { carre } from '../../../lib/2d/polygonesParticuliers'
import { latex2d } from '../../../lib/2d/textes'
import { rotation } from '../../../lib/2d/transformations'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer l'aire d'un carré"
export const interactifReady = true

export const uuid = 'q8v1y'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ13 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: ' $\\text{ dam}^2$.' }
  }

  enonce(cote?: number) {
    if (cote == null) {
      cote = randint(5, 12)
    }
    const aire = cote ** 2

    // Carré de taille fixe (5x5)
    const taille = 5
    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(taille, 0)
    const C = pointAbstrait(taille, taille)
    const D = pointAbstrait(0, taille)

    // Rotation pour incliner le carré
    const angle = 15
    const centre = pointAbstrait(taille / 2, taille / 2)
    const A1 = rotation(A, centre, angle)
    const B1 = rotation(B, centre, angle)
    const C1 = rotation(C, centre, angle)
    const D1 = rotation(D, centre, angle)

    const carreTrace = carre(A1, B1)
    const codage = codageSegments('||', 'black', A1, B1, B1, C1, C1, D1, D1, A1)

    const objets = []

    objets.push(carreTrace, codage)
    objets.push(
      latex2d(
        `${texNombre(cote)} \\text{ dam}`,
        milieu(B1, C1).x + 1.5,
        milieu(B1, C1).y,
        { color: 'black' },
      ),
    )

    // Calculer les bordures en incluant tous les objets
    const bordures = fixeBordures(objets)

    const figure = mathalea2d(
      Object.assign({
        scale: 0.6,
        xmin: bordures.xmin - 0.5,
        xmax: bordures.xmax + 0.5,
        ymin: bordures.ymin - 0.5,
        ymax: bordures.ymax + 0.5,
      }),
      objets,
    )

    this.question = `${figure}
    L'aire de ce carré est `

    this.correction = `L'aire d'un carré de côté $${cote}\\text{ dam}$ est :<br>
    $\\begin{aligned}
    \\mathcal{A}&=${cote}\\times ${cote}\\\\
    &=${miseEnEvidence(aire)}\\text{ dam}^2
    \\end{aligned}$`

    this.reponse = aire
    this.canReponseACompleter = ' $\\ldots\\text{ dam}^2$'

    if (!this.interactif) {
      this.question += ' $\\ldots\\text{ dam}^2$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(7)
    else this.enonce()
  }
}
