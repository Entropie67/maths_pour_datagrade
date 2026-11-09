import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier un entier avec un décimal'
export const interactifReady = true

export const uuid = '26491'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class MultiplierEntierDecimal extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.canOfficielle = true
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = texNombre(5.6, 1)
      this.question = '$0,7\\times 8$ '
      this.correction = `$0,7\\times 8=${miseEnEvidence(this.reponse)}$`
      this.canEnonce = '$0,7\\times 8$'
    } else {
      const a = new Decimal(randint(6, 9)).div(10)
      const b = randint(5, 9)
      this.reponse = texNombre(new Decimal(a).mul(b), 1)
      this.question = `$${texNombre(a, 1)} \\times ${b}$ `
      this.correction = `$${texNombre(a, 1)} \\times ${b}=${miseEnEvidence(this.reponse)}$`
      this.canEnonce = `$${texNombre(a, 1)} \\times ${b}$`
    }
  }
}
