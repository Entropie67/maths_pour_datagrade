import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un prix après une réduction'
export const interactifReady = true

export const uuid = 'idhrn'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q22 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '€.' }
  }

  enonce(prix?: number, reduction?: number) {
    if (prix == null || reduction == null) {
      // Version aléatoire
      prix = choice([300, 350, 400, 450, 500])
      reduction = choice([10, 20])
    }

    const montantReduction = (prix * reduction) / 100
    const nouveauPrix = prix - montantReduction

    this.question = `Une console de jeu à $${prix}$ € est vendue avec une réduction de $${reduction}\\,\\%$.<br>
Son nouveau prix est `

    this.correction = `On calcule d'abord le montant de la réduction.<br>
Pour calculer $${reduction}\\,\\%$ d'une quantité, on commence par calculer $10\\,\\%$ en divisant par $10$ :<br>
$10\\,\\%$ de $${prix}$ est égal à $${prix}\\div 10=${texNombre(prix / 10, 0)}$.<br>
${
  reduction === 10
    ? `La réduction est donc de : $${texPrix(montantReduction)}$ €.<br>`
    : `$${reduction}\\,\\%$ de $${prix}$ est donc égal à $${texNombre(prix / 10, 0)}\\times ${texNombre(reduction / 10, 0)}=${texNombre(montantReduction, 2)}$.<br>
La réduction est donc de : $${texPrix(montantReduction)}$ €.<br>`
}Le nouveau prix est de $${prix}-${texNombre(montantReduction)}= ${miseEnEvidence(texPrix(nouveauPrix))}$ €.`

    this.reponse = nouveauPrix
    this.canEnonce = `Une console de jeu à $${prix}$ € est vendue avec une réduction de $${reduction}\\,\\%$.<br>
Son nouveau prix est :`
    this.canReponseACompleter = '$\\ldots$ €'

    if (!this.interactif) {
      this.question += ' $\\ldots$ €.'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(450, 10)
    else this.enonce()
  }
}
