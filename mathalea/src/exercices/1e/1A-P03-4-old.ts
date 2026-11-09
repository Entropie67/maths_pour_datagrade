// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 79057 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import CalculProbaSimple from '../can/3e/can3S2-01'

export const titre = 'Calculer une probabilité dans un cas simple'
export const dateDePublication = '06/01/2026'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can3S2-01 pour les auto 1er
 * @author Gilles Mora
 */
export const uuid = '79057'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class Auto1AP03dOld extends CalculProbaSimple {
  constructor() {
    super()
    this.versionQcm = true
  }
}
