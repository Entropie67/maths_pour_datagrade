// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 8d5ec continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import EquationsCarree from '../can/2e/can2L2-05'
export const titre = 'Résoudre une équation du type $(x+a)^2=k$'
export const dateDePublication = '27/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2L14 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '8d5ec'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC10bOld extends EquationsCarree {
  constructor() {
    super()
    this.versionQcm = true
  }
}
