import PlacerPointsSurAxe from '../6e/6N1H-2'
export const titre = "Placer un point d'abscisse décimale"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '23/09/2025' // Réparation de l'interactivité par Éric Elter
/**
 * Clone de 6N1H-2 pour les 2nde
 *
 * @author Jean-claude Lhote et Rémi Angot
 */
export const uuid = '8164e'

export const refs = {
  'fr-fr': ['2N11-1'],
  'fr-ch': ['NR'],
}
export default class PlacerPointsSurAxe2nde extends PlacerPointsSurAxe {
  constructor() {
    super()
    this.sup = 3
  }
}
