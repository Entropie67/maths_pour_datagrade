import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un produit avec des fractions'
export const interactifReady = true

export const uuid = 'ecb98'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ProduitCalculNul extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 3 : randint(3, 7)
    const reponse = 0
    this.reponse = reponse
    this.question = `$\\left(1-\\dfrac{${a - 2}}{${a}}\\right)\\left(1-\\dfrac{${a - 1}}{${a}}\\right)\\left(1-\\dfrac{${a}}{${a}}\\right)$`
    this.correction = `Le dernier facteur est égal à $0$. <br>
    Ainsi, $\\left(1-\\dfrac{${a - 2}}{${a}}\\right)\\left(1-\\dfrac{${a - 1}}{${a}}\\right)\\left(1-\\dfrac{${a}}{${a}}\\right)=${miseEnEvidence(reponse)}$.`
  }
}
