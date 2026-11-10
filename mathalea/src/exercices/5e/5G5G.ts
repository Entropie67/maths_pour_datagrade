import DroiteRemarquableDuTriangle from './5G5E'

export const titre = "Déterminer la nature d'une droite remarquable - $2$"
export const interactifReady = true

/**
 * @author Éric Elter (pour ce clone)
 */
export const uuid = 'da670'

export const refs = {
  'fr-fr': ['5G5G'],
  'fr-2016': ['5G22b'],
  'fr-ch': ['NR'],
}
export default class DroiteRemarquableDuTriangleMedianes extends DroiteRemarquableDuTriangle {
  constructor() {
    super()
    this.sup = 2
  }
}
