import PerimetreOuAireDeFiguresComposees from '../5e/5G2E-5'

export const titre = 'Décomposer une figure complexe en figures simples'
export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDePublication = '28/10/2023'

/**
 * @author Guillaume Valmont
 */
export const uuid = 'fbafe'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
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
