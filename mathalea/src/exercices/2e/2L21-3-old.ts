// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 7959f continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import EqResolvantesThales from '../3e/3L13-2-old'
export const titre =
  'Résoudre une équation $\\dfrac{x}{a}=b$ ou $ \\dfrac{a}{x}=b$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const uuid = '7959f'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class EqResolvantesThales2ndeOld extends EqResolvantesThales {
  constructor() {
    super()
    this.exo = '4L15-1'
    this.sup = 1
  }
}
