// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 1e42b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import PuissancesDunRelatif1 from '../4e/4C33-1'
export const titre = 'Effectuer des calculs avec des puissances'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '09/05/2025'
export const uuid = '1e42b'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PuissancesDunRelatif12eOld extends PuissancesDunRelatif1 {
  constructor() {
    super()
    this.classe = 2
    this.correctionDetaillee = false
    this.sup2 = 3
    this.sup = 6
  }
}
