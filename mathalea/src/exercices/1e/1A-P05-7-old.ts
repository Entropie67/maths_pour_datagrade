// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid da49c continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ProbaCond from '../can/1e/can1P12-04'
export const titre =
  'Calculer une probabilité conditionnelle (tirage sans remise dans une urne)'
export const dateDePublication = '20/02/2026'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can3S2-01 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'da49c'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AP057Old extends ProbaCond {
  constructor() {
    super()
    this.versionQcm = true
  }
}
