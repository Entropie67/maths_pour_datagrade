import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec les tables de multiplication'
export const interactifReady = true

export const uuid = 'bb525'
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
    if (this.canOfficielle) {
      this.reponse = 18
      this.question = '$6\\times 3$ '
      this.correction = `$6\\times 3=${miseEnEvidence(18)}$`
    } else {
      const a = this.quotaRandint('a', 3, 6)
      const b = this.quotaRandint('b', 5, 9)
      this.reponse = a * b
      this.question = `$${a} \\times ${b}$ `
      this.correction = `$${a} \\times ${b}=${miseEnEvidence(texNombre(this.reponse, 0))}$`
    }
  }
}
