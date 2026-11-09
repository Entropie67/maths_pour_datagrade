import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Compléter une suite logique'
export const interactifReady = true

export const uuid = '43038'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 31
      this.question = `Compléter la suite logique : <br>
      $19$ ${sp(2)} ; ${sp(2)} $22$ ${sp(2)} ; ${sp(2)} $25$ ${sp(2)} ; ${sp(2)} $28$ ${sp(2)} ; ${sp(2)} ?`
      this.correction = `On obtient un terme de cette suite en ajoutant $3$ au terme précédent.<br>
      Ainsi, ? $=${miseEnEvidence(31)}$.`
      this.canEnonce = `Compléter la suite logique : <br>
   $19$ ${sp(2)} ; ${sp(2)} $22$ ${sp(2)} ; ${sp(2)} $25$ ${sp(2)} ; ${sp(2)} $28$ ${sp(2)} ; ${sp(2)} ?`
    } else {
      const a = choice([18, 19, 28, 29, 38, 39, 48, 49, 58, 59])
      const k = randint(3, 6)
      this.reponse = a + 4 * k
      this.question = `Compléter la suite logique : <br>
      $${a}$ ${sp(2)} ; ${sp(2)} $${a + k}$ ${sp(2)} ; ${sp(2)} $${a + 2 * k}$ ${sp(2)} ; ${sp(2)} $${a + 3 * k}$ ${sp(2)} ; ${sp(2)} ?`
      this.correction = `On obtient un terme de cette suite en ajoutant $${k}$ au terme précédent.<br>
      Ainsi, ? $=${miseEnEvidence(a + 4 * k)}$.`
      this.canEnonce = `Compléter la suite logique : <br>
     $${a}$ ${sp(2)} ; ${sp(2)} $${a + k}$ ${sp(2)} ; ${sp(2)} $${a + 2 * k}$ ${sp(2)} ; ${sp(2)} $${a + 3 * k}$ ${sp(2)} ; ${sp(2)} ?`
    }

    this.canReponseACompleter = '? $=\\ldots$'
    if (!this.interactif) {
      this.question += '<br>? $=\\ldots$'
    } else {
      this.question += '<br>? $=$'
    }
  }
}
