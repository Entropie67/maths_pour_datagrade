import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un produit scalaire'
export const interactifReady = true

export const uuid = 'elg20'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q10 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(ux?: number, uy?: number, vx?: number, vy?: number): void {
    if (ux == null || uy == null || vx == null || vy == null) {
      ux = randint(-5, 5, 0)
      uy = randint(-9, 9, 0)
      vx = randint(-5, 5, 0)
      vy = randint(-5, 5, 0)
    }

    const resultat = ux * vx + uy * vy

    this.reponse = resultat
    this.question = `Dans une base orthonormée $(\\vec{\\imath},\\vec{\\jmath})$, on donne deux vecteurs : $\\vec{u}(${ux}\\,;\\,${uy})$ et  $\\vec{v}(${vx}\\,;\\,${vy})$.<br>
    $\\vec{u}\\cdot\\vec{v}=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `$\\begin{aligned}
        \\vec{u}\\cdot\\vec{v}&=${ux}\\times ${ecritureParentheseSiNegatif(vx)}+${ecritureParentheseSiNegatif(uy)}\\times${ecritureParentheseSiNegatif(vy)}\\\\
        &=${miseEnEvidence(resultat)}
        \\end{aligned}$`
    this.canEnonce = `Dans une base orthonormée $(\\vec{\\imath},\\vec{\\jmath})$, on donne deux vecteurs : $\\vec{u}(${ux}\\,;\\,${uy})$ et  $\\vec{v}(${vx}\\,;\\,${vy})$.<br>`
    this.canReponseACompleter = '$\\vec{u}\\cdot\\vec{v}=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(0, -4, 2, 1)
    else this.enonce()
  }
}
