import CalculsAvecPuissancesDeDix from '../4e/4C32-1'
export const titre =
  'Donner le résultat de nombres écrits avec des puissances de $10$ en notation scientifique'
export const amcReady = true
export const amcType = 'qcmMono'

export const interactifReady = true
export const dateDePublication = '08/09/2023'
export const uuid = '816c8'
export const refs = {
  'fr-fr': ['2N42-2', 'BP2AutoF2'],
  'fr-ch': ['NR'],
}
export default class CalculsAvecPuissancesDeDixEn2nde extends CalculsAvecPuissancesDeDix {
  constructor() {
    super()
    this.sup = 2
    this.classe = 2
  }
}
