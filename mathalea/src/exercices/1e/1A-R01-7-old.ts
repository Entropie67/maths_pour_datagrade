// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 8fed0 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import calculAvecPourcentage from '../can/2e/can2I10-03-old'
export const titre = "Calculer un effectif à partir d'un pourcentage"
export const dateDePublication = '23/03/2026'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2I1-03 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '8fed0'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AR1gOld extends calculAvecPourcentage {
  constructor() {
    super()
    this.versionQcm = true
  }
}
