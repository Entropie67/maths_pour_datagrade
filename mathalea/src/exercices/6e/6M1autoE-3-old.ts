import ExercicePerimetresEtAiresOld from './_Exercice_perimetres_et_aires-old'
export const titre = 'Calculer le périmètre de polygones usuels'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDePublication = '28/07/2025'

/**
 * @author Éric Elter
 */
export const uuid = '2a997'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}

export default class Reglages6M1autoE3Old extends ExercicePerimetresEtAiresOld {
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
