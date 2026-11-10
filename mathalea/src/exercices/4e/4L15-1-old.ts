// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid ce00c continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import EqResolvantesThales from '../3e/3L13-2-old'
export const titre =
  'Résoudre des équations du type $\dfrac{x}{a}=\dfrac{b}{c}$'
export const interactifReady = true

export const dateDeModifImportante = '04/04/2022'
export const uuid = 'ce00c'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class EquationsFractionsOld extends EqResolvantesThales {
  constructor() {
    super()
    this.exo = '4L15-1'
    this.sup = 1
  }
}
