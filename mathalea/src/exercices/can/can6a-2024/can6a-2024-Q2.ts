import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Ajouter un nombre se finissant par 9'
export const interactifReady = true

export const uuid = 'c3d56'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: ' $=$' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let a, b
    if (this.canOfficielle) {
      a = 35
      b = 19
    } else {
      a =
        this.quotaRandint('aDizaine', 3, 6) * 10 +
        this.quotaRandint('aUnite', 3, 8)
      b = this.quotaRandint('bDizaine', 1, 3) * 10 + 9
    }
    this.reponse = String(a + b)
    this.question = `$${a}+${b}$`
    this.correction = `$${a}+${b}=${a}+(${b + 1}-1)=(${a}+${b + 1})-1=${a + b + 1}-1=${miseEnEvidence(this.reponse)}$`
  }
}
