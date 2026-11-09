import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer un pourcentage d'une quantité"
export const interactifReady = true

export const uuid = 'kjlo6'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ9 extends ExerciceCan {
  enonce(pourcentage?: number, quantite?: number, unite?: string): void {
    if (pourcentage == null || quantite == null || unite == null) {
      pourcentage = choice([20, 30, 40])
      // quantite dont le pourcentage tombe juste

      quantite = randint(12, 19) * 10
      // Plus simple : on s'assure que pourcentage × quantite / 100 est entier

      unite = choice(['g', 'kg'])
    }

    const resultat = new Decimal(pourcentage).mul(quantite).div(100)

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = texNombre(resultat, 2)
    this.question = `Combien pèsent les $${pourcentage}\\,\\%$ de $${quantite}$ ${unite} ?<br>`
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: ` ${unite}` }
    } else {
      this.question += `$\\ldots$ ${unite}`
    }
    this.correction = `$${pourcentage}\\,\\%$ de $${quantite} \\text{ ${unite}}=${texNombre(pourcentage / 100)}\\times ${quantite}\\text{ ${unite}}=${miseEnEvidence(texNombre(resultat, 2))}$ ${unite}.`
    this.canEnonce = `Combien pèsent les $${pourcentage}\\,\\%$ de $${quantite}$ ${unite} ?`
    this.canReponseACompleter = `$\\ldots$ ${unite}`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(20, 180, 'g')
    else this.enonce()
  }
}
