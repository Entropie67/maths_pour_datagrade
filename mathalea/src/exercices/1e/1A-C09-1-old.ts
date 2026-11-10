// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c4664 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import FatorisationEgR from '../can/2e/can2L11-06'
export const titre = 'Factoriser avec une égalité remarquable'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2L12 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'c4664'

export const refs = {
  'fr-fr': ['BP1AUTO085'],
  'fr-ch': ['NR'],
}
export default class Auto1AC9Old extends FatorisationEgR {
  constructor() {
    super()
    this.versionQcm = true
  }
}
