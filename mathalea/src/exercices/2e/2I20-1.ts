import CoefficientEvolution from '../3e/3P10-1'
export const titre =
  "Calculer un CM à partir d'un taux d'évolution et inversement"
export const interactifReady = true

export const uuid = '05db7'
export const refs = {
  'fr-fr': ['2I20-1', 'BP2CCF9', 'BP1CF06'],
  'fr-ch': ['NR'],
}
export default class CoefficientEvolution2nde extends CoefficientEvolution {
  constructor() {
    super()
    this.version = 2
  }
}
