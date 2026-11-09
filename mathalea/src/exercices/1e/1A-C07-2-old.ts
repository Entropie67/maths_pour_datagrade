// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 42707 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import HeureDecimalesMinutes from '../can/6e/can6D3-03'

export const uuid = '42707'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Transformer des heures décimales en minutes'
export const dateDePublication = '05/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC7aOld extends HeureDecimalesMinutes {
  constructor() {
    super()
    this.versionQcm = true
  }
}
