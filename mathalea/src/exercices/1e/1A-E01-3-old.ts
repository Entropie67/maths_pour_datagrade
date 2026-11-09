// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 04c8b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import CoeffMul from '../can/2e/can2I2-03'
export const titre = 'Calculer un coefficient multiplicateur'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '04c8b'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AE1bOld extends CoeffMul {
  constructor() {
    super()
    this.versionQcm = true
  }
}
