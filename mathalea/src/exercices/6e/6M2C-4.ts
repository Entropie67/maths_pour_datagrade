import ExercicePerimetresEtAires from './_Exercice_perimetres_et_aires'
export const titre = "Calculer le périmètre et/ou l'aire de polygones usuels"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDeModifImportante = '11/04/2023'

/**
 * @author Rémi Angot
 */
export const uuid = '065d1'

export const refs = {
  'fr-fr': ['6M2C-4', 'BP2AutoV2'],
  'fr-2016': ['6M10', 'BP2AutoV2'],
  'fr-ch': ['9R1GM2D-2', '9R2GM2D-2', '9R3GM2D-2', '10CTGM1C-2', '10LCGM1C-2', '10LSGM1C-2', 'PRQMG01B-2', 'PRQMG01C-11'],
}
export default class Reglages6M2C4 extends ExercicePerimetresEtAires {
  constructor() {
    super()
    this.sup = '1-2-3'
    this.exo = 'NoDisk'
    this.besoinFormulaire4CaseACocher = false
    this.besoinFormulaireTexte = [
      'Type de figures',
      'Nombres séparés par des tirets :\n1 : Carré\n2 : Rectangle\n3 : Triangle rectangle\n4 : Mélange',
    ]
  }
}
