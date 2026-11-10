import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Convertir $\\mu\\text{m}$ <---> $\\text{cm}$'
export const interactifReady = true

export const uuid = 'z9nhc'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q13 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(valeur?: number, sens?: boolean) {
    if (valeur == null || sens == null) {
      sens = choice([true, false])
      if (sens) {
        valeur = new Decimal(randint(1, 99)).div(10).toNumber()
      } else {
        valeur = randint(2, 30)
      }
    }

    if (sens) {
      const a = new Decimal(valeur)
      const reponse = a.mul(10000)
      this.optionsChampTexte = { texteApres: ' $\\mu\\text{m}$' }
      this.question = `$${texNombre(a, 1)}\\text{ cm}$ $=${!this.interactif ? ' \\ldots \\mu\\text{ m}' : ''}$`
      this.correction = `$1\\text{ m}$ $=10^6$ $\\mu\\text{m}$, donc $1\\text{ cm}$ $=10^4 =${texNombre(10000, 0)}$ $\\mu\\text{m}$.<br>
Ainsi, $${texNombre(a, 1)}\\text{ cm}$ $=${miseEnEvidence(texNombre(reponse, 0))}$ $\\mu\\text{m}$.`
      this.reponse = reponse
      this.canEnonce = `$${texNombre(a, 1)}\\text{ cm}=$`
      this.canReponseACompleter = `$\\ldots\\mu\\text{m}$ `
    } else {
      const reponse = new Decimal(valeur).div(10000)
      this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
      this.question = `$${texNombre(valeur, 1)}$ $\\mu\\text{m}=$${!this.interactif ? ' $\\ldots \\text{ cm}$' : ''}`
      this.correction = `$1$ $\\mu\\text{m}=10^{-6}\\text{ m}$, donc $1$ $\\mu\\text{m}=10^{-4}\\text{ cm}=${texNombre(0.0001, 4)}\\text{ cm}$.<br>
Ainsi, $${texNombre(valeur, 1)}$ $\\mu\\text{m}$ $=${miseEnEvidence(texNombre(reponse, 5))}\\text{ cm}$.`
      this.reponse = reponse
      this.canEnonce = `$${texNombre(valeur, 1)}$ $\\mu\\text{m}=$`
      this.canReponseACompleter = `$\\ldots\\text{cm}$ `
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2.8, true)
    else this.enonce()
  }
}
