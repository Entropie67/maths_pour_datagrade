import ConstruireParSymetrie from './_Construire_par_symetrie'
export const titre =
  "Construire le symétrique d'une figure par rapport à une droite (cas simples)"
export const dateDeModifImportante = '23/02/2026'
export const interactifReady = false
export const amcReady = true
export const amcType = 'AMCOpen'

/**

 * @author Jean-claude Lhote   (Ajout AMC par Éric Elter)
 */
export const uuid = 'adfb6'

export const refs = {
  'fr-fr': ['6G7B-2'],
  'fr-2016': ['6G24-2'],
  'fr-ch': ['NR'],
}
export default class SymetrieAxialeFigure6e extends ConstruireParSymetrie {
  constructor() {
    super()
    this.figure = true
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Type de questions',
      4,
      '1 : Axe horizontal ou vertical\n2 : Axe oblique à 45°\n3 : Axe avec une légère pente\n4 : Toutes les symétries axiales',
    ]
  }
}
