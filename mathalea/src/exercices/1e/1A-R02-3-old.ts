// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c8a75 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import CalculToutAvecPartie from '../can/2e/can2I1-02'
export const titre = 'Calculer le tout connaissant une partie'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'c8a75'

export const refs = {
  'fr-fr': ['BP1SP09'],
  'fr-ch': ['NR'],
}
export default class Auto1AR5aOld extends CalculToutAvecPartie {
  constructor() {
    super()
    this.versionQcm = true
  }
}
