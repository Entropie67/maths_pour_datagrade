import ExercicePerimetresEtAires from './_Exercice_perimetres_et_aires'
export const titre = 'Calculer le périmètre de polygones usuels'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDePublication = '28/07/2025'

/**
 * @author Éric Elter
 */
export const uuid = '9ff3c'

export const refs = {
  'fr-fr': ['6M1autoE-3', '6AutoL3-2'],
  'fr-2016': ['6M10a'],
  'fr-ch': ['9R1GM1A-3', '9R2GM1A-3', '9R3GM1A-3', 'PRQMG01B-5'],
}

export default class Reglages6M1autoE3 extends ExercicePerimetresEtAires {
  constructor() {
    super()
    this.sup = '1-2-3'
    this.exo = 'NoDisk'
    this.besoinFormulaire4CaseACocher = false
    this.besoinFormulaireTexte = [
      'Type de figures',
      'Nombres séparés par des tirets :\n1 : Carré\n2 : Rectangle\n3 : Triangle rectangle\n4 : Mélange',
    ]
    this.sup5 = 1
    this.besoinFormulaire5Numerique = false
  }
}
