import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une dérivée'
export const interactifReady = true

export const uuid = '5494d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ24 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.lycee
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: ' $x=$', texteApres: '.' }
  }

  nouvelleVersion() {
    const xu = this.canOfficielle ? -3 : randint(-5, 3, 0)
    const yu = this.canOfficielle ? 2 : randint(-5, 5, [0, 1])
    const xv = this.canOfficielle ? 4 : yu * randint(-3, 3, 0)

    this.reponse = texNombre((xu * xv) / -yu, 0)
    this.question = `Dans une base orthonormée, $\\vec{u}\\begin{pmatrix}${xu} \\\\${yu}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${xv} \\\\x\\end{pmatrix}$ sont orthogonaux si `
    if (!this.interactif) {
      this.question += '$x=\\ldots$'
    }
    this.correction = `Les vecteurs sont orthogonaux si leur produit scalaire est nul.<br>
    $\\vec{u}\\cdot \\vec{v}=${xu}\\times ${ecritureParentheseSiNegatif(xv)}+${ecritureParentheseSiNegatif(yu)}\\times x=${xu * xv}${ecritureAlgebriqueSauf1(yu)}x$.<br>
    On cherche $x$ tel que $${xu * xv}${ecritureAlgebriqueSauf1(yu)}x=0$, on trouve $x=${miseEnEvidence(this.reponse)}$.`
    this.canEnonce = `Dans une base orthonormée, $\\vec{u}\\begin{pmatrix}${xu} \\\\${yu}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${xv} \\\\x\\end{pmatrix}$ sont orthogonaux si `
    this.canReponseACompleter = '$x=\\ldots$'
  }
}
