import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Déterminer le reste d'une division euclidienne"
export const interactifReady = true

export const uuid = '422ef'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ19 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '.' }
  }

  enonce(dividende?: number, diviseur?: number) {
    if (dividende == null || diviseur == null) {
      diviseur = 5
      const quotient = randint(15, 29)
      const reste = randint(1, 4)
      dividende = quotient * diviseur + reste
    }

    const quotient = Math.floor(dividende / diviseur)
    const reste = dividende % diviseur
    const plusGrandMultiple = quotient * diviseur
    const terminaison = plusGrandMultiple % 10 === 0 ? '0' : '5'

    this.question = `Le reste de la division euclidienne de $${dividende}$ par $${diviseur}$ est `

    this.correction = `Les multiples de $${diviseur}$ se terminent par $0$ ou $5$.<br>
    Le plus grand multiple de $${diviseur}$ inférieur ou égal à $${dividende}$ est $${plusGrandMultiple}$ (il se termine par $${terminaison}$).<br>
    Le reste de la division euclidienne est donc $${miseEnEvidence(reste)}$.`

    this.reponse = reste

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(519, 5)
    else this.enonce()
  }
}
