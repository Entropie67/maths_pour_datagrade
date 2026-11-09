// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 42237 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import CalculExpAvecValeurs from '../can/2e/can2L10-01'
export const titre = 'Calculer une expression avec des valeurs'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2L10-01 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '42237'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC14Old extends CalculExpAvecValeurs {
  constructor() {
    super()
    this.versionQcm = true
  }
}
