import ExercicePerimetresEtAires from '../6e/_Exercice_perimetres_et_aires'

export const titre =
  "Calculer une valeur approchée du périmètre ou de l'aire de disques ou demi-disques"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDeModifImportante = '30/10/2026'

/** */
export const uuid = 'd8741'

export const refs = {
  'fr-fr': ['5G2E-3', 'BP2AutoV6', 'BP1AUTO108'],
  'fr-2016': ['6M22', '5M11-2', 'BP2AutoV6'],
  'fr-ch': ['10CTGM1A-7', '10LCGM1A-7', '10LSGM1A-7', 'PRQMG01C-1'],
}
export default class Reglages5M112 extends ExercicePerimetresEtAires {
  constructor() {
    super()
    this.sup = '4-5'
    this.exo = 'OnlyDisk'
    this.valeurArrondie = false
    this.besoinFormulaireTexte = [
      'Types de figures',
      'Nombres séparés par des tirets :\n4 : Disque\n5 : Demi-disque\n6 : Mélange',
    ]
  }
}
