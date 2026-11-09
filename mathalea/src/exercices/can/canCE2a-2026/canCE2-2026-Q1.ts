import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Trouver le facteur manquant'
export const interactifReady = true

export const uuid = '3c326'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q1 extends ExerciceCan {
  enonce(facteur1?: number, produit?: number) {
    if (facteur1 == null || produit == null) {
      facteur1 = randint(3, 9)
      const facteur2 = randint(2, 9)
      produit = facteur1 * facteur2
    }

    this.reponse = produit / facteur1
    this.question = `Complète.<br>`
    this.correction = `$${facteur1}\\times ${miseEnEvidence(texNombre(this.reponse, 0))}=${produit}$`
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${facteur1}\\times \\ldots =${produit}$`

    if (this.interactif) {
      this.optionsChampTexte = {
        texteAvant: `$${facteur1}\\times$`,
        texteApres: `$=${produit}$`,
      }
    } else {
      this.question += `$${facteur1}\\times \\ldots =${produit}$`
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(8, 24)
    else this.enonce()
  }
}
