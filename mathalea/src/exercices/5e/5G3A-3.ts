import ConstruireParSymetrie from '../6e/_Construire_par_symetrie'
export const titre = "Construire l'image d'un triangle par symétrie centrale"
export const interactifReady = false
export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '14/11/2021'
/**
 * @author Jean-claude Lhote
 * Fonction générale pour les exercices de construction de symétriques (centrale/axiale et points/triangles)
 * Permet une sortie html/pdf sur petits carreaux/gros carreaux/papier blanc
 */
export const uuid = '49786'

export const refs = {
  'fr-fr': ['5G3A-3'],
  'fr-2016': ['5G11-2'],
  'fr-ch': ['9R1ES4D-4', '9R2ES4D-4', '9R3ES4D-4'],
}
export default class ConstruireParSymetrieCentraleFigure extends ConstruireParSymetrie {
  constructor() {
    super()
    this.version = 5
    this.figure = true
    this.besoinFormulaireNumerique = false
    this.besoinFormulaire3Texte = false
  }
}
