import ExercicePerimetresEtAiresOld from '../6e/_Exercice_perimetres_et_aires-old'

export const titre =
  "Calculer le périmètre et l'aire de disques ou demi-disques"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDeModifImportante = '11/04/2023'

/** */
export const uuid = 'ac571'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6M22', 'BP2AutoV6'],
  'fr-ch': [],
}
export default class Reglages6M22 extends ExercicePerimetresEtAiresOld {
  constructor() {
    super()
    this.sup = '4-5'
    this.exo = 'OnlyDisk'
    this.besoinFormulaireTexte = [
      'Types de figures',
      'Nombres séparés par des tirets :\n4 : Disque\n5 : Demi-disque\n6 : Mélange',
    ]
  }
}
