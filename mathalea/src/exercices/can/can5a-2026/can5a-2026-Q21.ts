import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Effectuer des conversions de volumes entre m³ et dm³'
export const interactifReady = true

export const uuid = '50n52'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1GM4E-2', '9R2GM4E-2', '9R3GM4E-2'],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q21 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(valeur?: number, sens?: string) {
    if (valeur == null || sens == null) {
      sens = choice(['m3versdm3', 'dm3versm3'])

      if (sens === 'm3versdm3') {
        // m³ → dm³ : nombres de 0,01 à 0,99
        valeur = randint(1, 99) / 100
      } else {
        // dm³ → m³ : nombres de 10 à 990
        valeur = randint(1, 99) * 10
      }
    }

    if (sens === 'm3versdm3') {
      // Conversion m³ → dm³
      this.reponse = valeur * 1000
      this.question = `$${texNombre(valeur, 2)}\\text{ m}^3=$`
      this.correction = `$1\\text{ m}^3=${texNombre(1000, 0)}\\text{ dm}^3$<br>
Ainsi, $${texNombre(valeur, 2)}\\text{ m}^3=${texNombre(valeur, 2)}\\times ${texNombre(1000)}\\text{ dm}^3=${miseEnEvidence(texNombre(valeur * 1000))}\\text{ dm}^3$.`
      this.optionsChampTexte = { texteApres: ' $\\text{ dm}^3$' }
      this.canEnonce = `$${texNombre(valeur, 2)}\\text{ m}^3=$`
      this.canReponseACompleter = '$\\ldots\\text{ dm}^3$'
      if (!this.interactif) {
        this.question += '$\\ldots\\text{ dm}^3$'
      }
    } else {
      // Conversion dm³ → m³
      this.reponse = valeur / 1000
      this.question = `$${texNombre(valeur, 0)}\\text{ dm}^3=$`
      this.correction = `$1\\text{ dm}^3=${texNombre(0.001, 3)}\\text{ m}^3$<br>
Ainsi, $${texNombre(valeur, 0)}\\text{ dm}^3=${texNombre(valeur, 0)}\\times ${texNombre(0.001, 3)}\\text{ m}^3=${miseEnEvidence(texNombre(valeur / 1000))}\\text{ m}^3$.`
      this.optionsChampTexte = { texteApres: ' $\\text{ m}^3$' }
      this.canEnonce = `$${texNombre(valeur, 0)}\\text{ dm}^3=$`
      this.canReponseACompleter = '$\\ldots\\text{ m}^3$'
      if (!this.interactif) {
        this.question += '$\\ldots\\text{ m}^3$'
      }
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(0.05, 'm3versdm3')
    else this.enonce()
  }
}
