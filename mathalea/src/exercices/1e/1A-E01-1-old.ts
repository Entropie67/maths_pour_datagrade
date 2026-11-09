// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 6ffd3 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import TauxCoeff from '../can/2e/can2I2-01'
export const titre = 'Passer du taux d’évolution au coefficient multiplicateur'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '6ffd3'

export const refs = {
  'fr-fr': ['BP1CF01'],
  'fr-ch': ['NR'],
}
export default class Auto1AE1Old extends TauxCoeff {
  constructor() {
    super()
    this.versionQcm = true
  }
}
