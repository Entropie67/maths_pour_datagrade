import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une somme astucieusement'
export const interactifReady = true

export const uuid = '5ab89'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025CM1Q14 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 13 : randint(11, 14)
    const b = this.canOfficielle ? 25 : choice([25, 35])
    const c = this.canOfficielle ? 17 : choice([30, 40]) - a

    this.reponse = texNombre(a + b + c, 0)
    this.question = `$${texNombre(a, 0)}+${texNombre(b, 0)}+${texNombre(c, 0)}$  `
    this.correction = `$${texNombre(a, 0)}+${texNombre(b, 0)}+${texNombre(c, 0)}=\\underbrace{${texNombre(a, 0)}+${texNombre(c, 0)}}_{=${texNombre(c + a, 0)}}+${texNombre(b, 1)}=${miseEnEvidence(texNombre(a + b + c, 0))}$`
  }
}
