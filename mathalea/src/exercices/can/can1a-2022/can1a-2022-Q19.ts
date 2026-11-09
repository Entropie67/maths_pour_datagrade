import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import Hms from '../../../modules/Hms'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Convertir des heures décimales en heures/minutes'
export const interactifReady = true

export const uuid = 'emmg3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q19 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierHms
    this.optionsDeComparaison = { HMS: true }
  }

  enonce(heures?: number, fraction?: number) {
    if (heures == null || fraction == null) {
      heures = randint(1, 5)
      fraction = choice([0.5, 0.25, 0.75])
    }

    const total = heures + fraction
    const minutes = new Decimal(fraction).mul(60).toNumber()

    this.reponse = new Hms({ hour: heures, minute: minutes })

    this.question = `Convertir en heures/minutes : <br>$${texNombre(total)}$ h $=$`
    this.correction = `$${texNombre(total, 2)}$ h $ = ${heures}$ h $ + ${texNombre(fraction, 2)} \\times 60$ min $ = $ $${miseEnEvidence(heures)}\\text{ h }${miseEnEvidence(minutes)}\\text{ min}$`
    this.canEnonce = `$${texNombre(total)}$ h $=$`
    this.canReponseACompleter = '$\\ldots$ h $\\ldots$ min'

    if (!this.interactif) {
      this.question += ' $\\ldots$ h $\\ldots$ min'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, 0.75)
    else this.enonce()
  }
}
