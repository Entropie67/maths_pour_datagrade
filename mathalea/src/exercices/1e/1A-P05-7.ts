import ProbaCond from '../can/1e/can1P12-04'
export const titre =
  'Calculer une probabilité conditionnelle (tirage sans remise dans une urne)'
export const dateDePublication = '20/02/2026'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can3S2-01 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = 'd0470'

export const refs = {
  'fr-fr': ['1A-P05-7'],
  'fr-ch': [],
}
export default class Auto1AP057 extends ProbaCond {
  constructor() {
    super()
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.versionQcm = false
  }
}
