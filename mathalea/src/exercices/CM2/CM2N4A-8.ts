import TablesDeMultiplications from '../6e/_Tables_de_multiplications'

export const titre = 'Connaître ses tables de multiplication'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '27/08/2024'

/**
 * Tables de multiplication classiques, à trou ou un mélange des deux.
 *
 * Par défaut ce sont les tables de 2 à 9 mais on peut choisir les tables que l'on veut
 * @author Rémi Angot
 */
export const uuid = '665a0'

export const refs = {
  'fr-fr': [''], // Identique à CM2N4A-1
  'fr-2016': ['CM001'],
  'fr-ch': ['NR'],
}
export default class TablesParametres extends TablesDeMultiplications {
  constructor(tablesParDefaut = '2-3-4-5-6-7-8-9') {
    super(tablesParDefaut)
  }
}
