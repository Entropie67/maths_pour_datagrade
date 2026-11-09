import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'ceb14'
export const refs = {
  'fr-fr': ['3AutoS01'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = 'Calculer une probabilité'
export const dateDePublication = '11/08/2026'

/**
 * DNB Polynésie juin 2026 - Question 4
 * @author Jean-Claude Lhote
 */
export default class AutoQ4PolynesieBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }
  }

  enonce(n1?: number, n2?: number, n3?: number, parfums?: string[]) {
    if (n1 == null || n2 == null || n3 == null || parfums == null) {
      n1 = randint(2, 6)
      n2 = randint(3, 8, n1)
      n3 = randint(4, 10, n2)
      parfums = shuffle([
        "à l'abricôt",
        'au chocolat',
        'à la pomme',
        'à la fraise',
        'à la cerise',
        'à la poire',
        'au caramel',
      ]).slice(0, 3)
    }
    const total = n1 + n2 + n3
    this.question = `Une boîte opaque contient des beignets tous identiques fourrés de garnitures différentes :<br>
    ${createList({
      items: [
        `$${n1}$ sont ${parfums[0]}.`,
        `$${n2}$ sont ${parfums[1]}.`,
        `$${n3}$ sont ${parfums[2]}.`,
      ],
      style: 'fleches',
    })}<br>
     Déterminer la probabilité de piocher au hasard un beignet ${parfums[2]}.`
    this.reponse = `\\dfrac{${n3}}{${total}}`
    this.correction = `Il y a $${n3}$ beignets ${parfums[2]} parmi $${total}$ beignets au total.<br>
La probabilité de piocher un beignet ${parfums[2]} est donc $${miseEnEvidence(`\\dfrac{${n3}}{${total}}`)}$.`
    if (pgcd(n3, total) > 1) {
      this.correction += `<br>On peut simplifier la fraction en divisant le numérateur et le dénominateur par leur plus grand commun diviseur $${pgcd(n3, total)}$.<br>
On peut donc écrire cette probabilité $\\dfrac{${n3 / pgcd(n3, total)}}{${total / pgcd(n3, total)}}$.`
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(6, 5, 4, ["à l'abricôt", 'à la pomme', 'à la framboise'])
    } else {
      this.enonce()
    }
  }
}
