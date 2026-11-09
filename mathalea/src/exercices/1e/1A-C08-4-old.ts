// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c1c68 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ReduireAvecFraction from '../can/3e/can3L2-01'

export const uuid = 'c1c68'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Réduire une expression avec une fraction'
export const dateDePublication = '18/02/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC8dOld extends ReduireAvecFraction {
  constructor() {
    super()
    this.versionQcm = true
  }
}
