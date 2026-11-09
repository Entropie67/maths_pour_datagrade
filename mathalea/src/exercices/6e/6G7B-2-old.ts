import ConstruireParSymetrie from './_Construire_par_symetrie-old'
export const titre =
  "Construire le symétrique d'une figure par rapport à une droite (cas simples)"
export const dateDeModifImportante = '14/11/2021'
export const interactifReady = false
export const amcReady = true
export const amcType = 'AMCOpen'

/**

 * @author Jean-claude Lhote   (Ajout AMC par Éric Elter)
 */
export const uuid = 'adfb5'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
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
