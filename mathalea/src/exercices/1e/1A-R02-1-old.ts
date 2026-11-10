// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 458eb continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import CalculPartieAvecTout from '../can/5e/can5P1-06'
export const titre = 'Déterminer un pourcentage de proportion'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '458eb'

export const refs = {
  'fr-fr': ['BP1SP07'],
  'fr-ch': ['NR'],
}
export default class Auto1AR4Old extends CalculPartieAvecTout {
  constructor() {
    super()
    this.versionQcm = true
  }
}
