import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texPrix } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un prix avec une proportionnalité'
export const interactifReady = true

export const uuid = 'mdzny'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q8 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(nbDepart?: number, prixDepart?: number, nbArrivee?: number) {
    if (nbDepart == null || prixDepart == null || nbArrivee == null) {
      // Tableau de cas prédéfinis : [nbDepart, prixDepart, nbArrivee]
      // Uniquement des réponses entières ou avec 0,5
      const listeCas = [
        [12, 18, 4], // 12 gommes → 18€, combien pour 4 ? (6€)
        [15, 21, 5], // 15 gommes → 21€, combien pour 5 ? (7€)
        [16, 20, 4], // 16 gommes → 20€, combien pour 4 ? (5€)
        [20, 24, 5], // 20 gommes → 24€, combien pour 5 ? (6€)
        [12, 15, 3], // 12 gommes → 15€, combien pour 3 ? (3,75€) → à changer
        [16, 22, 4], // 16 gommes → 22€, combien pour 4 ? (5,5€)
        [12, 18, 3], // 12 gommes → 18€, combien pour 3 ? (4,5€)
        [20, 25, 4], // 20 gommes → 25€, combien pour 4 ? (5€)
        [16, 24, 4], // 16 gommes → 24€, combien pour 4 ? (6€)
        [20, 30, 5], // 20 gommes → 30€, combien pour 5 ? (7,5€)
      ]
      const cas = this.quotaChoice('cas', listeCas)
      nbDepart = cas[0]
      prixDepart = cas[1]
      nbArrivee = cas[2]
    }

    const prixUnitaire = prixDepart / nbDepart
    const reponse = prixUnitaire * nbArrivee
    const facteur = nbDepart / nbArrivee

    this.reponse = reponse.toFixed(2)
    this.question = `$${nbDepart}$ gommes identiques coûtent $${texPrix(prixDepart)}$ €.<br>
Combien ${nbArrivee === 1 ? 'coûte' : 'coûtent'} $${nbArrivee}$ ${nbArrivee === 1 ? 'gomme' : 'de ces gommes'} ? `

    this.correction = `On a le prix de $${nbDepart}$ gommes.<br>
On veut le prix de $${facteur}$ fois moins de gommes.<br>
On divise donc le prix de $${nbDepart}$ gommes par $${facteur}$.<br>
$${texPrix(prixDepart)}\\div ${facteur}=${miseEnEvidence(texPrix(reponse))}$ €`

    this.canReponseACompleter = '$\\ldots$ €'

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>', texteApres: '€' }
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(12, 18, 3)
    else this.enonce()
  }
}
