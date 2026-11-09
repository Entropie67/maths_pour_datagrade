// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c3c84 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ppcmEngrenages from '../3e/3A12-old'
export const titre = 'Utiliser des multiples appliqués aux engrenages'
export const interactifReady = false
export const dateDeModifImportante = '14/11/2021'
export const uuid = 'c3c84'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PpcmEngrenages2ndeOld extends ppcmEngrenages {
  constructor() {
    super()
    this.sup = true
    this.besoinFormulaireCaseACocher = false
  }
}
