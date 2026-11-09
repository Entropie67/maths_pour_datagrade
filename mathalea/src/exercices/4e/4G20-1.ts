import Pythagore2D from './4G20'
export const titre = 'Donner ou compléter une égalité de Pythagore'
export const interactifReady = true

export const dateDeModifImportante = '28/12/2022'

export const uuid = '40c47'

export const refs = {
  'fr-fr': ['4G20-1', 'BP2AutoR2', 'BP2G7'],
  'fr-ch': ['10LCGM3A-2', '10LSGM3A-2', '11CTGM2A-2', 'PRQMG03A-1'],
}
export default class EgalitePythagore2D extends Pythagore2D {
  constructor() {
    super()
    this.sup = 1
    this.typeDeQuestion = 'Donner égalité'
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      "1 : Donner l'égalité de Pythagore\n2 : Compléter l'égalité de Pythagore",
    ]
    // Aucune longueur n'est calculée ici : l'option sur les unités n'a pas d'objet.
    this.besoinFormulaire3CaseACocher = false
  }
}
