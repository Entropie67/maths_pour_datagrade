import CalculDAngle from '../3e/3G31'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre =
  "Utiliser le cosinus pour calculer la mesure d'un angle dans un triangle rectangle"
export const uuid = '22810'
export const refs = {
  'fr-fr': ['4G41'],
  'fr-ch': ['NR'],
}
export default class CalculDAngle4e extends CalculDAngle {
  constructor() {
    super()
    this.level = 4
    this.sup = true
  }
}
