import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Trouver l'extremum à partir d'une forme canonique"
export const interactifReady = true

export const uuid = 'daf1d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q28 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: ' $\\vec{u}\\cdot \\vec{v}=$' }
  }

  nouvelleVersion() {
    const xu = this.canOfficielle ? 2 : randint(2, 5)
    const yu = this.canOfficielle ? 3 : randint(-5, 5, [0, 1])
    const xv = this.canOfficielle ? 4 : randint(-5, 5, [0, 1])
    const yv = this.canOfficielle ? -5 : randint(-5, 5, [0, 1])
    this.reponse = texNombre(xu * xv + yu * yv, 0)
    this.question = `Soient $\\vec{u}\\begin{pmatrix}${xu} \\\\${yu}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${xv} \\\\${yv}\\end{pmatrix}$ dans une base orthonormée.<br>`
    if (!this.interactif) {
      this.question += '$\\vec{u}\\cdot \\vec{v}=\\ldots$'
    }
    this.correction = `$\\vec{u}\\cdot \\vec{v}=${xu}\\times ${ecritureParentheseSiNegatif(xv)}+${ecritureParentheseSiNegatif(yu)}\\times ${ecritureParentheseSiNegatif(yv)}=${miseEnEvidence(this.reponse)}$`
    this.canEnonce = `Soient $\\vec{u}\\begin{pmatrix}${xu} \\\\${yu}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${xv} \\\\${yv}\\end{pmatrix}$ dans une base orthonormée.`
    this.canReponseACompleter = '$\\vec{u}\\cdot \\vec{v}=\\ldots$'
  }
}
