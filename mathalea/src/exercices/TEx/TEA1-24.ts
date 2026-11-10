import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer les diviseurs et les quotients possibles connaissant le reste d’une division euclidienne'
export const dateDePublication = '10/10/2026'
export const uuid = '47773'
export const refs = { 'fr-fr': ['TEA1-24'], 'fr-ch': [] }

/** @author Stéphane Guyon */
export default class DiviseursEtQuotientsPossibles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    // Ces produits se factorisent avec les petits nombres premiers 2, 3, 5
    // et 7. Même avec le reste maximal, le dividende reste inférieur à 100.
    const products = [
      12, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 35, 36, 40, 42, 45, 48,
      49, 50, 54, 56, 60, 63, 64, 70, 72, 75, 80, 81, 84, 90,
    ]
    const product = products[randint(0, products.length - 1)]
    const remainder = randint(1, 9)
    const dividend = product + remainder
    const divisors = listeDesDiviseurs(product).filter(
      (divisor) => divisor > remainder,
    )
    const divisorList = divisors
      .map((divisor) => `$${texNombre(divisor)}$`)
      .join(', ')
      .replace(/, ([^,]+)$/, ' et $1')
    const pairs = divisors.map(
      (divisor) => `(${texNombre(divisor)};${texNombre(product / divisor)})`,
    )
    const divisorSentence =
      divisors.length === 1
        ? `Le seul diviseur de $${texNombre(product)}$ strictement supérieur à $${texNombre(remainder)}$ est ${divisorList}.`
        : `Les diviseurs de $${texNombre(product)}$ strictement supérieurs à $${texNombre(remainder)}$ sont ${divisorList}.`
    const divisorValuesSentence =
      divisors.length === 1
        ? `La seule valeur possible pour $b$ est donc ${divisorList}.`
        : `Les valeurs possibles pour $b$ sont donc ${divisorList}.`
    const quotientDetails = divisors
      .map(
        (divisor) =>
          `pour $b=${texNombre(divisor)}$, $q=\\dfrac{${texNombre(product)}}{${texNombre(divisor)}}=${texNombre(product / divisor)}$`,
      )
      .join(' ; ')
    const solutionSet = `\\{${pairs.join('\\,;\\,')}\\}`

    this.listeQuestions[0] = `Dans la division euclidienne de $${texNombre(dividend)}$ par un entier naturel $b$ non nul, le reste est $${texNombre(remainder)}$. Donner les valeurs possibles de $b$ et du quotient $q$ associé.`

    this.listeCorrections[0] = `On a $${texNombre(dividend)}=qb+${texNombre(remainder)}$, avec $0\\leqslant ${texNombre(remainder)}< b$, soit $b>${texNombre(remainder)}$.<br>
    On en déduit que $qb=${texNombre(dividend)}-${texNombre(remainder)}=${texNombre(product)}$.<br>
    $q$ et $b$ sont donc deux diviseurs de $${texNombre(product)}$.<br>
    ${divisorSentence}<br>
    ${divisorValuesSentence}<br>
    Comme $q=\\dfrac{${texNombre(product)}}{b}$, on en déduit que ${quotientDetails}.<br>
    Réciproquement, chacun de ces couples vérifie l’égalité $${texNombre(dividend)}=qb+${texNombre(remainder)}$ et la condition $0\\leqslant ${texNombre(remainder)}< b$.<br>
    L’ensemble des couples $(b;q)$ solutions est donc $S=${miseEnEvidence(solutionSet)}$.`

    listeQuestionsToContenu(this)
  }
}
