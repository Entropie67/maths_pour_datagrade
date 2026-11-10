import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Probabilités'
export const interactifReady = true

export const uuid = 'afrce'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q14 extends ExerciceCan {
  enonce(a?: number, b?: number, couleur1?: string, couleur2?: string) {
    const listeCouleurs = [
      'noire',
      'rouge',
      'verte',
      'bleue',
      'jaune',
      'blanche',
    ]
    if (a == null || b == null || couleur1 == null || couleur2 == null) {
      a = randint(5, 15)
      b = randint(20, 25, 2 * a) - a
      couleur1 = choice(listeCouleurs)
      couleur2 = choice(listeCouleurs.filter((c) => c !== couleur1))
    }
    const reponse = new FractionEtendue(b, a + b)
    this.reponse = reponse.texFraction
    this.question = `Dans un sac opaque, il y a $${a}$ billes ${couleur1}s et $${b}$ billes ${couleur2}s. <br>
    Quelle est la probabilité de tirer une bille ${couleur2} ?`
    this.correction = `Il y a $${b}$ billes ${couleur2}s sur un total de $${a + b}$ billes, donc la probabilité de tirer une bille ${couleur2} est de $${miseEnEvidence(reponse.texFraction)}$.`

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    if (this.interactif) {
      this.question += '<br><br>'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(12, 7, 'noire', 'rouge')
    else this.enonce()
  }
}
