import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer et convertir'
export const interactifReady = true

export const uuid = '37a4e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N62Q13 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: 'g.' }
  }

  nouvelleVersion() {
    const prefixes = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']

    const a = this.canOfficielle ? 25 : choice([3, 5, 7, 9, 11]) * 5
    const b = 100 - a

    const k = this.canOfficielle ? 6 : randint(3, 6)
    const choix = this.canOfficielle ? 3 : randint(1, 3)
    this.question = `Compléter : <br>
            $${a}\\text{ ${prefixes[k]}}+${b}\\text{ ${prefixes[k]}}= ${this.interactif ? '' : `\\ldots \\text{ ${prefixes[k - choix]}}`}$`
    this.correction = `$${a}\\text{ ${prefixes[k]}}+${b}\\text{ ${prefixes[k]}}=100 \\text{ ${prefixes[k]}}$ <br>`
    if (choix === 1) {
      this.reponse = 10
      this.correction += `Puisque  $1\\text{ ${prefixes[k]}} =0,1\\text{ ${prefixes[k - choix]}}$, on divise par $10$.<br>
      Ainsi, $${a}\\text{ ${prefixes[k]}}+${b}\\text{ ${prefixes[k]}}=${miseEnEvidence(`${texNombre(this.reponse)}`)} \\text{ ${prefixes[k - choix]}}$.`
    } else if (choix === 2) {
      this.reponse = 1
      this.correction += `Puisque  $1\\text{ ${prefixes[k]}} =0,01\\text{ ${prefixes[k - choix]}}$, on divise par $100$.<br>
      Ainsi, $${a}\\text{ ${prefixes[k]}}+${b}\\text{ ${prefixes[k]}}=${miseEnEvidence(`${texNombre(this.reponse)}`)} \\text{ ${prefixes[k - choix]}}$.`
    } else {
      this.reponse = 0.1
      this.correction += `Puisque  $1\\text{ ${prefixes[k]}} =${texNombre(0.001, 3)}\\text{ ${prefixes[k - choix]}}$, on divise par $${texNombre(1000, 0)}$.<br>
      Ainsi, $${a}\\text{ ${prefixes[k]}}+${b}\\text{ ${prefixes[k]}}=${miseEnEvidence(`${texNombre(this.reponse)}`)} \\text{ ${prefixes[k - choix]}}$.`
    }

    this.optionsChampTexte = { texteApres: `$\\text{ ${prefixes[k - choix]}}$` }

    this.canEnonce = 'Compléte. '
    this.canReponseACompleter = ` $${a}\\text{ ${prefixes[k]}}+${b}\\text{ ${prefixes[k]}}= \\ldots \\text{ ${prefixes[k - choix]}}$`
  }
}
