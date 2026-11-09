import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une somme astucieusement'
export const interactifReady = true

export const uuid = 'bb6cd'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N6Q14 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 4.5 : choice([1.5, 2.5, 3.5, 4.5, 5.5])
    const b = this.canOfficielle ? 7.2 : randint(51, 69, 60) / 10
    const c = this.canOfficielle ? 10 - a : choice([10, 20, 30]) - a

    this.reponse = texNombre(a + b + c, 1)
    this.question = `$${texNombre(a, 1)}+${texNombre(b, 1)}+${texNombre(c, 1)}$  `
    this.correction = `$${texNombre(a, 1)}+${texNombre(b, 1)}+${texNombre(c, 1)}=\\underbrace{${texNombre(a, 1)}+${texNombre(c, 1)}}_{=${texNombre(c + a, 0)}}+${texNombre(b, 1)}=${miseEnEvidence(texNombre(a + b + c, 1))}$`
  }
}
