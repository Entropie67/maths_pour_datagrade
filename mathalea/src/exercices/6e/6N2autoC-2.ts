import MultiplierUnNombreParPuissanceDeDix from './6N2B-4'

export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre =
  'Par combien multiplier un nombre pour que le chiffre des unités devienne le chiffre des ... ?'

export const dateDePublication = '25/09/2026'

/**
 * @author Éric Elter
 */

export const uuid = '57b46'

export const refs = {
  'fr-fr': ['6N2autoC-2'],
  'fr-ch': ['9R1NO6E-8', '9R2NO6E-8', '9R3NO6E-8'],
}
export default class MultiplierUnNombreParPuissanceDeDixPositive extends MultiplierUnNombreParPuissanceDeDix {
  constructor() {
    super()
    this.sup3 = 1
  }
}
