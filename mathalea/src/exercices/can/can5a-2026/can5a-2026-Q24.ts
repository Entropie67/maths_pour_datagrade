import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texPrix } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer le périmètre d'un rectangle"
export const interactifReady = true

export const uuid = '4ih30'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q24 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' €' }
  }

  enonce(quantite?: number, prixUnitaire?: number) {
    if (quantite == null || prixUnitaire == null) {
      // Tableau de cas prédéfinis [quantite, prixUnitaire]
      // Tous avec billet de 10 €, sans retenue dans la multiplication
      const listeCas = [
        [2, 2.3], // 2 × 2,30 = 4,60 → monnaie = 5,40
        [2, 3.2], // 2 × 3,20 = 6,40 → monnaie = 3,60
        [2, 1.5], // 2 × 1,50 = 3,00 → monnaie = 7,00
        [2, 2.5], // 2 × 2,50 = 5,00 → monnaie = 5,00
        [2, 3.5], // 2 × 3,50 = 7,00 → monnaie = 3,00
        [2, 4.2], // 2 × 4,20 = 8,40 → monnaie = 1,60
        [3, 1.2], // 3 × 1,20 = 3,60 → monnaie = 6,40
        [3, 2.3], // 3 × 2,30 = 6,90 → monnaie = 3,10
        [3, 1.5], // 3 × 1,50 = 4,50 → monnaie = 5,50
        [3, 2.2], // 3 × 2,20 = 6,60 → monnaie = 3,40
        [3, 3.1], // 3 × 3,10 = 9,30 → monnaie = 0,70
        [2, 3.4], // 2 × 3,40 = 6,80 → monnaie = 3,20
        [2, 4.3], // 2 × 4,30 = 8,60 → monnaie = 1,40
        [3, 1.1], // 3 × 1,10 = 3,30 → monnaie = 6,70
        [3, 2.1], // 3 × 2,10 = 6,30 → monnaie = 3,70
      ]
      const cas = choice(listeCas)
      quantite = cas[0]
      prixUnitaire = cas[1]
    }

    const billet = 10
    const prixUnitaireDecimal = new Decimal(prixUnitaire)
    const quantiteDecimal = new Decimal(quantite)
    const billetDecimal = new Decimal(billet)

    const prixTotal = prixUnitaireDecimal.mul(quantiteDecimal)
    const monnaie = billetDecimal.minus(prixTotal)

    this.question = `Tom achète ${quantite === 2 ? 'deux' : 'trois'} cahiers à $${texPrix(prixUnitaire)}$ € l'unité.<br>
Il paie avec un billet de $${billet}$ €.<br>
Combien va-t-on lui rendre ?`

    this.correction = `Le prix total est : $${quantite}\\times ${texPrix(prixUnitaire)}=${texPrix(prixTotal)}$ €.<br>
La monnaie à rendre est : $${billet}-${texPrix(prixTotal)}=${miseEnEvidence(texPrix(monnaie))}$ €.`

    this.reponse = monnaie.toNumber()

    this.canReponseACompleter = '$\\ldots$ €'
    if (!this.interactif) {
      this.question += '<br>$\\ldots$ €'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 2.3)
    else this.enonce()
  }
}
