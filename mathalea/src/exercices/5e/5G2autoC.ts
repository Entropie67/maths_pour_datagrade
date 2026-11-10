import ReconnaitreDesSolides from '../6e/6G8autoA'
export const titre = 'Reconnaitre des solides'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDeModifImportante = '31/08/2026'

/**
 *
 * @author Éric Elter
 */
export const uuid = '1552c'

export const refs = {
  'fr-fr': ['5G2autoC'],
  'fr-ch': ['NR'],
}
export default class ReconnaitreDesSolidesAuto5e extends ReconnaitreDesSolides {
  constructor() {
    super()
    this.sup = '5-6'
    this.sup2 = true
    this.nbQuestions = 2
  }
}
