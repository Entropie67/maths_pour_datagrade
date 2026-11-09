import ExercicePerimetresEtAires from '../6e/_Exercice_perimetres_et_aires'

export const titre =
  "Calculer la valeur arrondie du périmètre ou de l'aire de disques ou demi-disques"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDePublication = '22/05/2026'

/** */
export const uuid = '72489'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class Reglages5M112bOld extends ExercicePerimetresEtAires {
  constructor() {
    super()
    this.sup = '4-5'
    this.exo = 'OnlyDisk'
    this.valeurArrondie = true
    this.besoinFormulaireTexte = [
      'Types de figures',
      'Nombres séparés par des tirets :\n4 : Disque\n5 : Demi-disque\n6 : Mélange',
    ]
  }
}
