import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Déterminer le prix en fonction d’un tarif proportionnel'
export const interactifReady = true

export const uuid = 'h66n9'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q8 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(nbDepart?: number, prixDepart?: number, nbArrivee?: number): void {
    if (nbDepart == null || prixDepart == null || nbArrivee == null) {
      // Tableau de cas prédéfinis : [nbDepart, prixDepart, nbArrivee]
      // UNIQUEMENT des réponses finissant par 0,5
      const listeCas: [number, number, number][] = [
        [12, 18, 3], // 4,5€
        [16, 22, 4], // 5,5€
        [20, 30, 5], // 7,5€
        [18, 27, 3], // 4,5€
        [12, 21, 2], // 3,5€
        [14, 21, 3], // 4,5€
        [10, 15, 3], // 4,5€
        [16, 26, 4], // 6,5€
        [6, 9, 3], // 4,5€
      ]
      const cas: [number, number, number] = choice(listeCas)
      nbDepart = cas[0]
      prixDepart = cas[1]
      nbArrivee = cas[2]
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
    const prixUnitaire = prixDepart / nbDepart
    const reponse = prixUnitaire * nbArrivee
    const facteur = nbDepart / nbArrivee

    this.reponse = texNombre(reponse, 2)
    this.question = `$${nbDepart}$ gommes identiques coûtent $${texPrix(prixDepart)}$ €.<br>
Combien ${nbArrivee === 1 ? 'coûte' : 'coûtent'} $${nbArrivee}$ ${nbArrivee === 1 ? 'gomme' : 'de ces gommes'} ?`

    this.correction = `On a le prix de $${nbDepart}$ gommes.<br>
On veut le prix de $${texNombre(facteur)}$ fois moins de gommes.<br>
On divise donc le prix de $${nbDepart}$ gommes par $${texNombre(facteur)}$.<br>
$${texPrix(prixDepart)}\\div ${texNombre(facteur)}=${miseEnEvidence(texPrix(reponse))}$ €`

    this.canReponseACompleter = '$\\ldots$ €'

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' €' }
    }
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(12, 18, 3)
    else this.enonce()
  }
}
