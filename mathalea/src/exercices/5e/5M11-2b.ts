import ExercicePerimetresEtAires from '../6e/_Exercice_perimetres_et_aires'

export const titre =
  "Calculer la valeur arrondie du périmètre ou de l'aire de disques ou demi-disques"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDePublication = '22/05/2026'

/** */
export const uuid = '57f65'

export const refs = {
  'fr-fr': ['5G2E-4', 'BP2AutoV6b'],
  'fr-2016': ['5M11-2b', 'BP2AutoV6b'],
  'fr-ch': ['10CTGM1A-10', '10LCGM1A-10', '10LSGM1A-10', 'PRQMG01C-9'],
}
export default class Reglages5M112b extends ExercicePerimetresEtAires {
  constructor() {
    super()
    this.sup = '4'
    this.sup5 = 2
    this.exo = 'OnlyDisk'
    this.valeurArrondie = true
    this.besoinFormulaireTexte = [
      'Types de figures',
      'Nombres séparés par des tirets :\n4 : Disque\n5 : Demi-disque\n6 : Mélange',
    ]
  }
}
