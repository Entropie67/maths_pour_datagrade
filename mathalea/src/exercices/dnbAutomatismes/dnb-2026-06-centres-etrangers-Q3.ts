import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cea03'
export const refs = {
  'fr-fr': ['3AutoS01-4'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = 'Calculer une probabilité'
export const dateDePublication = '11/08/2026'

/**
 * DNB Centres étrangers juin 2026 - Question 3
 * @author Jean-Claude Lhote
 */
export default class AutoQ3CentresEtrangersBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }
  }

  enonce(rouges?: number, vertes?: number) {
    if (rouges == null || vertes == null) {
      rouges = randint(2, 6)
      vertes = randint(3, 8, rouges)
    }
    const total = rouges + vertes
    this.question = `Une boîte opaque contient $${rouges}$ boules rouges et $${vertes}$ boules vertes identiques et indiscernables au toucher. On pioche une boule au hasard.<br>
Quelle est la probabilité qu'elle soit rouge ?`
    this.reponse = `\\dfrac{${rouges}}{${total}}`
    this.correction = `Il y a $${rouges}$ boules rouges parmi $${total}$ boules au total.<br>
La probabilité de piocher une boule rouge est donc $${miseEnEvidence(`\\dfrac{${rouges}}{${total}}`)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(3, 5)
    } else {
      this.enonce()
    }
  }
}
