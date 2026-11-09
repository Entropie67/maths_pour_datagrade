import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Convertir des m³ en L et inversement'
export const interactifReady = true

export const uuid = 'oedms'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q23 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, sens?: boolean) {
    if (a == null || sens == null) {
      a = (randint(1, 12) * 10 + randint(1, 9)) / 10
      sens = choice([true, false])
    }

    if (sens) {
      const reponse = a * 1000
      this.optionsChampTexte = { texteApres: ' L' }
      this.question = `$${texNombre(a, 1)}\\text{ m}^3=${!this.interactif ? '\\ldots \\text{ L}' : ''}$`
      this.correction = ` $1\\text{ m}^3$= $${texNombre(1000)}$ L donc $${texNombre(a, 1)}\\text{ m}^3=${miseEnEvidence(texNombre(reponse, 0))}$ L.`
      this.reponse = reponse.toFixed(0)

      this.canEnonce = `$${texNombre(a, 1)}\\text{ m}^3=$`
      this.canReponseACompleter = '$\\ldots$  L'
    } else {
      const reponse = a / 1000
      this.optionsChampTexte = { texteApres: '$\\text{ m}^3$' }
      this.question = `$${texNombre(a, 1)}$ L $=${!this.interactif ? '\\ldots\\text{ m}^3' : ''}$`
      this.correction = `$1$ L= $0,001\\text{ m}^3$ donc $${texNombre(a, 1)}$ L $=${miseEnEvidence(texNombre(reponse, 4))}\\text{ m}^3$.`
      this.reponse = reponse.toFixed(4)
      this.canEnonce = `$${texNombre(a, 1)}$ L $=$`
      this.canReponseACompleter = '$\\ldots\\text{ m}^3$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3.7, true)
    else this.enonce()
  }
}
