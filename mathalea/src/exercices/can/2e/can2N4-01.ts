import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const interactifReady = true
export const titre = 'Écrire un nombre décimal sous la forme $\\dfrac{a}{10^n}$'
export const dateDePublication = '19/10/2023'
/**
 * @author  Gilles Mora
 *

 */
export const uuid = 'e57cb'

export const refs = {
  'fr-fr': ['can2N4-01'],
  'fr-ch': [],
}
export default class DecimalForme extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { fractionIdentique: true }
  }

  nouvelleVersion() {
    const puissance = this.quotaRandint('puissance', 1, 5)
    const puissance10 = 10 ** puissance
    const a1 = randint(1, 9) * choice([1, -1])
    const a2 =
      randint(11, 99, [20, 30, 40, 50, 60, 70, 80, 90]) * choice([1, -1])
    const a3 = randint(111, 199, [120, 130, 140, 150, 160, 170, 180, 190])
    const a4 = (randint(100, 140) * 10 + randint(1, 9)) * choice([1, -1])
    const a = choice([a1, a2, a3, a4])
    const dec = new Decimal(a).div(puissance10)

    this.question = `Écrire $${texNombre(dec, 5)}$ sous la forme $\\dfrac{a}{10^n}$ avec $a\\in \\mathbb{Z}$ et $n\\in \\mathbb{N}$.`

    this.correction = `$${texNombre(dec, 5)}=${miseEnEvidence(`\\dfrac{${texNombre(a, 0)}}{10^{${puissance}}}`)}$`
    this.reponse = `\\dfrac{${a}}{10^{${puissance}}}`
  }
}
