// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid fdba8 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import CalculImageSecondDegre from '../can/2e/can2F11-02'
export const titre = 'Calculer une image avec une fonction'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2F11-02 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'fdba8'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AF1Old extends CalculImageSecondDegre {
  constructor() {
    super()
    this.versionQcm = true
  }
}
