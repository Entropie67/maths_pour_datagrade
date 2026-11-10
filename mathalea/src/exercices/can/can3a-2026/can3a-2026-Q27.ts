import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Convertir des volumes'
export const interactifReady = true

export const uuid = '3izfu'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q27 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(valeur?: number, sens?: 'm3_vers_dm3' | 'dm3_vers_m3') {
    if (valeur == null || sens == null) {
      // Version aléatoire : choisir le sens de conversion
      sens = choice(['m3_vers_dm3', 'dm3_vers_m3'])

      // De m³ vers dm³ : nombres décimaux entre 0,1 et 99,9
      const partieEntiere = randint(0, 99)
      const partieDecimale = randint(1, 9)
      valeur = partieEntiere + partieDecimale / 10
    }

    let reponse: Decimal
    let question: string
    let correction: string
    let unite: string

    if (sens === 'm3_vers_dm3') {
      // Conversion m³ → dm³ (×1000)
      const valeurDecimal = new Decimal(valeur)
      reponse = valeurDecimal.mul(1000)
      unite = '$\\text{dm}^3$'

      question = `$${texNombre(valeur)}\\text{ m}^3=$`

      correction = `$1\\text{ m}^3 = ${texNombre(1000)}\\text{ dm}^3$.<br>
$${texNombre(valeur)}\\text{ m}^3 = ${texNombre(valeur)}\\times ${texNombre(1000)}\\text{ dm}^3=${miseEnEvidence(texNombre(reponse))}\\text{ dm}^3$.`
    } else {
      // Conversion dm³ → m³ (÷1000)
      const valeurDecimal = new Decimal(valeur)
      reponse = valeurDecimal.div(1000)
      unite = '$\\text{m}^3$'

      question = `$${texNombre(valeur)}\\text{ dm}^3=$`

      correction = `$1\\text{ dm}^3 = 0,001\\text{ m}^3$.<br>
$${texNombre(valeur)}\\text{ dm}^3 = ${texNombre(valeur)}\\times 0,001\\text{ m}^3=${miseEnEvidence(texNombre(reponse))}\\text{ m}^3$.`
    }

    this.reponse = reponse
    this.optionsChampTexte = { texteApres: ` ${unite}` }
    this.question = question
    this.correction = correction

    if (!this.interactif) {
      this.question += ` $\\ldots$ ${unite}`
    }

    this.canEnonce = question
    this.canReponseACompleter = `$\\ldots$ ${unite}`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3.4, 'm3_vers_dm3')
    else this.enonce()
  }
}
