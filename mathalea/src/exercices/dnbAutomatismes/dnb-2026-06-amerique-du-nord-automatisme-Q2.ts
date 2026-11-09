import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'c2a4b'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['10CTFA1E-12', '10LCFA1E-12', '10LSFA1E-12', 'PRQPF05B-9'],
}
export const interactifReady = true

export const titre = 'Appliquer une réduction en pourcentage'
export const dateDePublication = '06/06/2026'

/**
 * DNB Amérique du Nord juin 2026 - Question 2
 * @author Rémi Angot
 */
export default class AutoQ2ANbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: ' €' }
  }

  enonce(prix?: number, pourcentage?: number) {
    if (prix == null || pourcentage == null) {
      prix = randint(1, 10) * 10 + 5
      pourcentage = 10
    }
    const reduction = (prix * pourcentage) / 100
    const prixFinal = prix - reduction

    this.reponse = prixFinal
    this.question = `Un article coûte $${texNombre(prix)}~\\text{€}$. Quel sera son prix après une réduction de $${pourcentage}\\,\\%$ ?`
    if (this.interactif) this.question += '<br>'

    this.correction = `La réduction est de $${texNombre(prix)}~\\text{€} \\times ${texPrix(pourcentage / 100)}=${texPrix(reduction)}~\\text{€}$.<br>
Le prix après réduction est donc :<br>
$${texPrix(prix)}~\\text{€}-${texPrix(reduction)}~\\text{€}=${miseEnEvidence(`${texPrix(prixFinal)}`)}~\\text{€}$.`
  }

  nouvelleVersion() {
    // 45 € − 10 % → 40,5 €
    if (this.canOfficielle) {
      this.enonce(45, 10)
    } else {
      this.enonce()
    }
  }
}
