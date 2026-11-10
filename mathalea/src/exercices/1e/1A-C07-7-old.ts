// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 816f5 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ConversionEnTousSens from '../can/6e/can6M4-03'
export const titre = 'Convertir une unité de longueur, masse ou capacité'
export const dateDePublication = '25/08/2026'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can6M4-03 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '816f5'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC077Old extends ConversionEnTousSens {
  constructor() {
    super()
    this.versionQcm = true
  }
}
