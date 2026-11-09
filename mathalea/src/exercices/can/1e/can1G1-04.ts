import { orangeMathalea } from '../../../lib/colors'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer une coordonnée avec un produit scalaire'
export const interactifReady = true

export const dateDePublication = '29/06/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 *
*/
export const uuid = '14aa1'

export const refs = {
  'fr-fr': ['can1G1-04'],
  'fr-ch': ['3G95-12'],
}
export default class RechercheCoordonneesProdScal extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const ux = randint(-10, 10, 0)
    const uy = randint(-10, 10, 0)
    const vx = randint(-10, 10, 0)
    const vy = randint(-10, 10, 0)
    const f1 = new FractionEtendue(-ux * vx, vy)
    const f2 = new FractionEtendue(-uy * vy, ux)
    switch (
      this.quotaChoice('type', [1, 2]) //
    ) {
      case 1:
        this.question = ` Dans un repère orthonormé $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$, on considère les vecteurs :<br>
    $\\vec{u}\\begin{pmatrix}${ux}${sp(1)} \\\\ ${sp(1)}x\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${vx}${sp(1)} \\\\ ${sp(1)}${vy}\\end{pmatrix}$<br>
  
    Que vaut $x$ si $\\vec{u}$ et $\\vec{v}$ sont orthogonaux ?`

        this.correction = `Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont orthogonaux, donc $\\vec{u}\\cdot\\vec{v}=0$.<br>
    On en déduit : $${ux}\\times ${ecritureParentheseSiNegatif(vx)}+x\\times ${ecritureParentheseSiNegatif(vy)}=0$, soit $${ux * vx}${ecritureAlgebriqueSauf1(vy)}x=0$.<br>
    Cette équation a pour solution ${vy === 1 ? `$x=${miseEnEvidence(-ux * vx)}$.` : `$x=${f1.estIrreductible && f1.num * f1.den > 0 ? miseEnEvidence(`\\dfrac{${-ux * vx}}{${vy}}`) : `\\dfrac{${-ux * vx}}{${vy}}${f1.texSimplificationAvecEtapes('none', orangeMathalea)}`}$.`}
   `
        this.reponse = f1
        break
      case 2:
        this.question = ` Dans un repère orthonormé $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$, on considère les vecteurs :<br>
        $\\vec{u}\\begin{pmatrix}${ux}${sp(1)} \\\\ ${sp(1)}${uy}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x${sp(1)} \\\\ ${sp(1)}${vy}\\end{pmatrix}$<br>
        
        Que vaut $x$ si $\\vec{u}$ et $\\vec{v}$ sont orthogonaux ?`

        this.correction = `Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont orthogonaux, donc $\\vec{u}\\cdot\\vec{v}=0$.<br>
        On en déduit : $${ux}\\times x+${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vy)}=0$, soit $${rienSi1(ux)}x ${ecritureAlgebrique(uy * vy)}=0$.<br>
        Cette équation a pour solution 
        ${ux === 1 ? `$x=${miseEnEvidence(-uy * vy)}$.` : `$x=${f2.estIrreductible && f2.num * f2.den > 0 ? miseEnEvidence(`\\dfrac{${-uy * vy}}{${ux}}`) : `\\dfrac{${-uy * vy}}{${ux}}${f2.texSimplificationAvecEtapes('none', orangeMathalea)}`}$.`}`
        this.reponse = f2
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$x=\\ldots$'
  }
}
