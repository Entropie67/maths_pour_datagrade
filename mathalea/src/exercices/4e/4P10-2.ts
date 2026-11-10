import EqResolvantesThales from '../3e/3L13-2'
export const titre = 'Déterminer une quatrième proportionnelle dans un tableau'
export const interactifReady = true

export const dateDePublication = '15/12/2020'
export const dateDeModifImportante = '04/10/2026'
export const uuid = 'dda72'
export const refs = {
  'fr-fr': ['4P10-2', 'BP2AutoL1'],
  'fr-ch': ['9R1FA1B-4', '9R2FA1B-4', '9R3FA1B-4', '10CTFA1B-3', '10LCFA1B-3', '10LSFA1B-3', 'PRQPF03A-9', 'PRQPF03B-7'],
}
export default class TableauxEtQuatriemeProportionnelle extends EqResolvantesThales {
  constructor() {
    super()
    this.exo = '4P10-2'
    this.consignePluriel =
      'Déterminer la quatrième proportionnelle dans les tableaux suivants.'
    this.consigneSingulier =
      'Déterminer la quatrième proportionnelle dans le tableau suivant.'
    this.sup = 1
  }
}
