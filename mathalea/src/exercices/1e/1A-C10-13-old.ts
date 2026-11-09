// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f0230 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import SolutionInequation from '../can/2e/can2L3-01'
export const titre = 'Résoudre une inéquation $ax+b>0$'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2L05 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'f0230'

export const refs = {
  'fr-fr': ['BP1AUTO050'],
  'fr-ch': ['NR'],
}
export default class Auto1AC12Old extends SolutionInequation {
  constructor() {
    super()
    this.versionQcm = true
  }
}
