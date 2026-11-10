import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Effectuer des conversions entre grammes et kilogrammes'
export const interactifReady = true

export const uuid = 's5og8'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q13 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(sens?: string, valeur?: number) {
    if (sens == null) {
      sens = choice(['g_vers_kg', 'kg_vers_g'])
    }

    if (sens === 'g_vers_kg') {
      // De g vers kg : valeurs comme 1200, 2300, 3400, etc.
      if (valeur == null) {
        valeur = randint(11, 99, [20, 30, 40, 50, 60, 70, 80, 90]) * 100
      }

      const valeurDecimal = new Decimal(valeur)
      const resultat = valeurDecimal.dividedBy(1000)

      this.reponse = resultat.toNumber()
      this.formatChampTexte = KeyboardType.clavierDeBase
      this.question = `$${texNombre(valeur, 0)}\\text{ g}=$`

      this.correction = `Comme $1\\text{ kg}=1\\,000\\text{ g}$, alors $1\\text{ g}=0,001\\text{ kg}$.<br>
Ainsi, pour passer des g aux kg, on divise par $1\\,000$.<br>
Comme $${texNombre(valeur, 0)}\\div 1\\,000=${texNombre(resultat.toNumber(), 3)}$, alors $${texNombre(valeur, 0)}\\text{ g}=${miseEnEvidence(texNombre(resultat.toNumber(), 3))}\\text{ kg}$.`

      this.canEnonce = 'Complète.'
      this.canReponseACompleter = `$${texNombre(valeur, 0)}\\text{ g}=\\ldots\\ldots\\text{ kg}$`
      this.optionsChampTexte = { texteApres: ' $\\text{kg}$' }

      if (this.interactif) {
        this.question += ' '
      } else {
        this.question += ' $\\ldots$ kg'
      }
    } else {
      // De kg vers g : valeurs comme 1,2 / 2,5 / 3,8 / 5,8 etc.
      if (valeur == null) {
        const partieEntiere = randint(1, 9)
        const partieDecimale = choice([2, 3, 4, 5, 6, 7, 8, 9])
        valeur = partieEntiere + partieDecimale / 10
      }

      const valeurDecimal = new Decimal(valeur)
      const resultat = valeurDecimal.times(1000)

      this.reponse = resultat.toNumber()
      this.formatChampTexte = KeyboardType.clavierDeBase
      this.question = `$${texNombre(valeur, 1)}\\text{ kg}=$`

      this.correction = `Comme $1\\text{ kg}=1\\,000\\text{ g}$, pour passer des kg aux g, on multiplie par $1\\,000$.<br>
Comme $${texNombre(valeur, 1)}\\times 1\\,000=${texNombre(resultat.toNumber(), 0)}$, alors $${texNombre(valeur, 1)}\\text{ kg}=${miseEnEvidence(texNombre(resultat.toNumber(), 0))}\\text{ g}$.`

      this.canEnonce = 'Complète.'
      this.canReponseACompleter = `$${texNombre(valeur, 1)}\\text{ kg}=\\ldots\\ldots\\text{ g}$`
      this.optionsChampTexte = { texteApres: ' $\\text{g}$' }

      if (this.interactif) {
        this.question += ' '
      } else {
        this.question += ' $\\ldots$ g'
      }
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('g_vers_kg', 1500)
    else this.enonce()
  }
}
