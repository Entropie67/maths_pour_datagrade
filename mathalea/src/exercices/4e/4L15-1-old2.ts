// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 800bd continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import EqResolvantesThales from '../3e/3L13-2-old2'
export const titre =
  'Résoudre des équations du type $\\dfrac{x}{a}=\\dfrac{b}{c}$'
export const interactifReady = true

export const dateDeModifImportante = '30/09/2026'
export const uuid = '800bd'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class EquationsFractionsOld2 extends EqResolvantesThales {
  constructor() {
    super()
    this.exo = '4L15-1'
    this.sup = 1
  }
}
