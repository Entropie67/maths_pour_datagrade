import TablesDeMultiplications from '../6e/_Tables_de_multiplications'

export const titre = 'Réviser les tables de multiplication'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '15/07/2026'
/**
 * Tables de multiplication classiques, à trou ou un mélange des deux.
 *
 * Par défaut ce sont les tables de 2 à 9 mais on peut choisir les tables que l'on veut
 * @author Éric Elter
 */
export const uuid = '717cb'

export const refs = {
  'fr-fr': ['5N1autoC-1', '5N3autoA-1', '5N4autoA-1'],
  'fr-ch': ['9R1NO6A-5', '9R2NO6A-5', '9R3NO6A-5'],
}
export default class TablesParametres extends TablesDeMultiplications {
  constructor() {
    super()
    this.sup = '2-3-4-5-6-7-8-9-10'
    this.sup2 = '2'
  }
}
