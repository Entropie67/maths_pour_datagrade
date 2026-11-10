import PremierOuPas from '../3e/3A10-1'
export const titre = 'Nombre premier ou pas'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDeModifImportante = '30/10/2026'
export const uuid = '6a0ed'
export const refs = {
  'fr-fr': ['4A10'],
  'fr-ch': ['9R2NO1F-7', '9R3NO1F-7', '10CTNO1A-7', 'PRQNO09B-9'],
}
export default class PremierOuPas4e extends PremierOuPas {
  constructor() {
    super()
    this.sup2 = false
    this.sup3 = true
    this.besoinFormulaire3CaseACocher = [
      'Que des nombres premiers inférieurs à 50',
    ]
    this.rangMaxPremierCourt = 14 // 47 est le plus grand nombre premier inférieur à 50
  }
}
