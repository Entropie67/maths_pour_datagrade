import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un produit scalaire avec les coordonnées'
export const interactifReady = true

export const dateDePublication = '26/01/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

 *
*/
export const uuid = '4a643'

export const refs = {
  'fr-fr': ['canTSpeE04'],
  'fr-ch': ['3G95-13'],
}
export default class ProduitScalaireCoordonnees extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const ux = randint(-10, 10)
    const uy = randint(-10, 10, 0)
    const uz = randint(-10, 10, 0)
    const vx = randint(-10, 10, 0)
    const vy = randint(-10, 10, 0)
    const vz = randint(-10, 10, 0)

    this.question = ` Dans un repère orthonormé de l'espace $\\big(O ; \\vec \\imath,\\vec \\jmath, \\vec k\\big)$, on donne deux vecteurs :<br>
    $\\vec{u}\\begin{pmatrix}${ux}${sp(1)} \\\\ ${sp(1)}${uy}\\\\ ${sp(1)}${uz}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${vx}${sp(1)} \\\\ ${sp(1)}${vy}\\\\ ${sp(1)}${vz}\\end{pmatrix}$<br>

    Alors $\\vec{u}\\cdot\\vec{v}=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `$\\begin{aligned}
    \\vec{u}\\cdot\\vec{v}&=${ux}\\times ${ecritureParentheseSiNegatif(vx)}+${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vy)}+${ecritureParentheseSiNegatif(uz)}\\times ${ecritureParentheseSiNegatif(vz)}\\\\
    &=${ux * vx} ${ecritureAlgebrique(uy * vy)}${ecritureAlgebrique(uz * vz)}\\\\
    &=${miseEnEvidence(ux * vx + uy * vy + uz * vz)}
    \\end{aligned}$`
    this.reponse = ux * vx + uy * vy + uz * vz
  }
}
