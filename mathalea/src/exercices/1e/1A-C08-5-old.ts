// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c4012 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ReduireDecimaux from '../can/4e/can4L2-06'

export const uuid = 'c4012'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Réduire une expression littérale avec des décimaux'
export const dateDePublication = '05/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC08eOld extends ReduireDecimaux {
  constructor() {
    super()
    this.versionQcm = true
  }
}
