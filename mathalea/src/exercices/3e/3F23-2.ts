import ExoCompletAffine from '../2e/2F21-9'
import {
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'

export const titre = 'Étudier une fonction affine'
export const interactifReady = true
export const uuid = 'd451f'

export const refs = {
  'fr-fr': ['3F23-2'],
  'fr-ch': [],
}
export const dateDePublication = '08/10/2024'
export const dateDeModifImportante = '20/08/2026'

const formulaireSansTableauSignes: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'typeCoefDir',
      label: 'Types de coefficients directeurs',
      items: [
        {
          nom: '1',
          label: 'Entier relatif',
          poids: 1,
        },
        {
          nom: '2',
          label: 'rationnel',
          poids: 1,
        },
      ],
    },
    {
      type: 'listePonderee',
      nom: 'typeAntecedent',
      label: "Types d'antécédents",
      items: [
        { nom: '1', label: 'Entier relatif' },
        { nom: '2', label: 'Rationnel' },
      ],
    },
  ],
}

export default class ExerciceBilanAffine extends ExoCompletAffine {
  override get formulaireComplexe(): FormulaireComplexe {
    return formulaireSansTableauSignes
  }

  constructor() {
    super()
    this.withSignTab = false
    this.sup = serialiseFormulaireComplexe(
      this.formulaireComplexe,
      valeursParDefaut(this.formulaireComplexe),
    )
  }
}
