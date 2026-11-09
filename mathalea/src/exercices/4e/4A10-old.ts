// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid bdb18 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import PremierOuPas from '../3e/3A10-1'
export const titre = 'Nombre premier ou pas'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const uuid = 'bdb18'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PremierOuPas4eOld extends PremierOuPas {
  constructor() {
    super()
    this.sup2 = false
    this.sup3 = true
  }
}
