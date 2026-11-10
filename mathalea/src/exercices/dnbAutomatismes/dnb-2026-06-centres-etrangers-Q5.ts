import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cea05'
export const refs = {
  'fr-fr': ['3AutoN07-4'],
  'fr-ch': ['10CTNO5A-6', '10LCNO5A-6', '10LSNO5A-6', '11CTNO3A-6', 'PRQNO07C-6'],
}
export const interactifReady = true
export const titre = "Donner l'écriture scientifique d'un très grand nombre"
export const dateDePublication = '11/08/2026'

/**
 * DNB Centres étrangers juin 2026 - Question 5
 * @author Jean-Claude Lhote
 */
export default class AutoQ5CentresEtrangersBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  enonce(n?: number, entreQuoi?: string) {
    if (n == null) {
      n = randint(1000, 9999) * 100000
      entreQuoi = 'entre $2$ planètes'
    }
    const exposant = Math.floor(Math.log10(n))
    const mantisse = n / 10 ** exposant
    this.question = `La distance ${entreQuoi} est environ égale à $${texNombre(n, 0)}$ kilomètres.<br>
Donner la notation scientifique de $${texNombre(n, 0)}$.`
    this.reponse = `${texNombre(mantisse, exposant)}\\times 10^{${exposant}}`
    this.correction = `$${texNombre(n, 0)}=${miseEnEvidence(`${texNombre(mantisse, exposant)}\\times 10^{${exposant}}`)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(311200000, 'entre la Terre et Mars')
    } else {
      this.enonce()
    }
  }
}
