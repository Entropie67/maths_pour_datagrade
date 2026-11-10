import PerimetreOuAireDeFiguresComposees from '../5e/5G2E-5'

export const titre = 'Décomposer une figure complexe en figures simples'
export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDePublication = '28/10/2023'

/**
 * @author Guillaume Valmont
 */
export const uuid = 'ebaff'

export const refs = {
  'fr-fr': ['6M1D-1'],
  'fr-2016': ['6M11-0'],
  'fr-ch': ['9R1GM2E-2', '9R2GM2E-2', '9R3GM2E-2', '10CTGM1C-3', '10LCGM1C-3', '10LSGM1C-3', 'PRQMG01C-12'],
}
export default class DecomposerFigureComplexe extends PerimetreOuAireDeFiguresComposees {
  constructor() {
    super()
    this.sup3 = 1
    this.sup4 = 4
    this.besoinFormulaire3Numerique = false
    this.besoinFormulaire4Numerique = false
  }
}
