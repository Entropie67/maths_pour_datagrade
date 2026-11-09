import MultipleOuDivisible from '../../5e/5N1I-6'
export const titre = 'Déterminer un nombre divisible par un autre'
export const interactifReady = true

export const dateDePublication = '18/09/2026'
/**
 * Clone de 5N1I-6 pour la course aux nombres : uniquement le cas "divisible
 * par" (plus grand entier à deux chiffres divisible par un nombre, ou plus
 * grand/petit entier inférieur/supérieur à une borne divisible par un
 * nombre), avec toutes les difficultés de diviseurs.
 * @author Gilles Mora
 */
export const uuid = '5ffd2'

export const refs = {
  'fr-fr': ['can5C6-06'],
  'fr-ch': ['NR'],
}
export default class PlusGrandDiviseur extends MultipleOuDivisible {
  constructor() {
    super()
    this.nbQuestions = 1
    this.can = true
    this.sup = '1'
    this.sup2 = '4'
  }
}
