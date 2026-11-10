import MultipleOuDivisible from '../../5e/5N1I-6'
export const titre = 'Déterminer un multiple'
export const interactifReady = true

export const dateDePublication = '17/04/2023'
export const dateDeModifImportante = '18/09/2026'
/**
 * Clone de 5N1I-6 pour la course aux nombres : uniquement le cas "multiple
 * de" (plus grand multiple inférieur / plus petit multiple supérieur à une
 * borne), avec toutes les difficultés de diviseurs.
 * @author Gilles Mora
 */
export const uuid = 'e1b05'

export const refs = {
  'fr-fr': ['can5C6-05', '2N20-flash2'],
  'fr-ch': ['NR'],
}
export default class PlusGrandMultiple extends MultipleOuDivisible {
  constructor() {
    super()
    this.nbQuestions = 1
    this.can = true
    this.sup = '2'
    this.sup2 = '4'
  }
}
