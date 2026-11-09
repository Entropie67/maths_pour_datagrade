import ConservationTransformation from '../5e/5G3B-1'
export const titre =
  'Utiliser les propriétés de conservation du parallélisme, des longueurs et des angles'
export const interactifReady = false

export const dateDePublication = '16/05/2022'

/**
 * @author Guillaume Valmont
 */
export const uuid = '3174f'

export const refs = {
  'fr-fr': ['4G12-2'],
  'fr-ch': ['NR'],
}
export default class ConservationTransformation4e extends ConservationTransformation {
  constructor() {
    super()
    this.sup = 4
  }
}
