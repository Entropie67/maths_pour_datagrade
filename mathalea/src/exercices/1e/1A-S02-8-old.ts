// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 51125 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import MoyenneStat from '../can/3e/can3S1-02'
export const titre = 'Calculer une moyenne'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can3S1-02 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '51125'

export const refs = {
  'fr-fr': ['3AutoS02-3', 'BP1AUTO042'],
  'fr-ch': ['NR'],
}
export default class Auto1AS4Old extends MoyenneStat {
  constructor() {
    super()
    this.versionQcm = true
  }
}
