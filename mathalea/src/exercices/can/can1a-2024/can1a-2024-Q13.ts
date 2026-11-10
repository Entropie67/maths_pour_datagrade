import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un produit scalaire'
export const interactifReady = true

export const uuid = '3828e'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ProduitScalaire extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
  }

  nouvelleVersion() {
    let ux: number
    let uy: number
    let vx: number
    let vy: number
    if (this.canOfficielle) {
      ux = 1
      uy = -3
      vx = 1
      vy = -1
      this.reponse = 4
    } else {
      ux = randint(-5, 5, 0)
      uy = randint(-9, 9, 0)
      vx = randint(-5, 5, 0)
      vy = randint(-5, 5, 0)
      this.reponse = ux * vx + uy * vy
    }
    this.question = `Dans une base orthonormée : $\\vec{u}(${ux}\\,;\\,${uy})$ et  $\\vec{v}(${vx}\\,;\\,${vy})$.<br>
    Alors $\\vec{u}\\cdot\\vec{v}=$` //
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = ` $\\begin{aligned}
        \\vec{u}\\cdot\\vec{v}&=${ux}\\times ${ecritureParentheseSiNegatif(vx)}+${ecritureParentheseSiNegatif(uy)}\\times${ecritureParentheseSiNegatif(vy)}\\\\
        &=${miseEnEvidence(this.reponse)} 
        \\end{aligned}$`
    this.canEnonce = `Dans une base orthonormée, $\\vec{u}(${ux}\\,;\\,${uy})$ et  $\\vec{v}(${vx}\\,;\\,${vy})$.<br>`
    this.canReponseACompleter = '$\\vec{u}\\cdot\\vec{v}=\\ldots$'
  }
}
