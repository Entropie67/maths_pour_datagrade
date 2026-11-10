// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 5fb9e continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import MinutesHeuresDecimale from '../can/6e/can6D3-02'

export const uuid = '5fb9e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Transformer des minutes en heures décimales'
export const dateDePublication = '04/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC7Old extends MinutesHeuresDecimale {
  constructor() {
    super()
    this.versionQcm = true
  }
}
