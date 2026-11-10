import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une somme'
export const interactifReady = true

export const uuid = '90b1e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ21 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    this.reponse = 5050
    this.question = '$1+2+3+\\ldots + 100=$'
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `On sait que $1+2+3+\\ldots+n=\\dfrac{n\\times (n+1)}{2}$.<br>
    Avec $n=100$, on obtient : $\\dfrac{100\\times 101}{2}=${miseEnEvidence(texNombre(5050, 0))}$.`
    this.canEnonce = 'Cette somme <br> $1+2+3+\\ldots + 100$ vaut : '
  }
}
