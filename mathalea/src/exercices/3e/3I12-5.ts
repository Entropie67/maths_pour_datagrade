import TrouverLeBonProgramme from '../6e/6I1B-6'

export const interactifReady = true

export const dateDePublication = '14/02/2026'

export const titre = 'Trouver le bon programme Scratch'
export const uuid = 'e9cae'

export const refs = {
  'fr-fr': ['3I12-5'],
  'fr-2016': [],
  'fr-ch': [],
}

export default class TrouverLeBonProgramme3e extends TrouverLeBonProgramme {
  niveau = '3'
  constructor() {
    super()
    this.sup = '1'
    this.besoinFormulaireTexte = [
      'Types de programmes',
      'Nombres séparés par des tirets\n1 : Avancer\n2 : Tourner\n3 : Ajouter\n4 : Polygone\n5 : Carré\n6 : Rebours\n7 : Escalier\n0 : Mélange',
    ]
  }
}
