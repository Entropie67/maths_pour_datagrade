import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  'Déterminer un nombre défini par une phrase (table de multiplication)'
export const interactifReady = true

export const uuid = '34aa9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q8 extends ExerciceCan {
  enonce(dividende?: number, diviseur?: number) {
    if (dividende == null || diviseur == null) {
      diviseur = choice([4, 5, 6, 7, 8, 9])
      const quotient = randint(4, 8)
      dividende = diviseur * quotient
    }

    const resultat = dividende / diviseur

    this.question = `Dans $${dividende}$ combien de fois $${diviseur}$ ?`

    this.correction = `$${dividende}\\div ${diviseur}=${miseEnEvidence(resultat)}$<br>
    Dans $${dividende}$, il y a $${resultat}$ fois $${diviseur}$.`

    this.reponse = resultat
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: '' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(36, 6)
    else this.enonce()
  }
}
