// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 78ab0 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ProbaEvenementContraire from '../can/3e/can3S2-02'
export const titre = 'Calculer la probabilité d’un événement contraire'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can3S2-02 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '78ab0'

export const refs = {
  'fr-fr': ['BP1SP05'],
  'fr-ch': ['NR'],
}
export default class Auto1AP2Old extends ProbaEvenementContraire {
  constructor() {
    super()
    this.versionQcm = true
  }
}
