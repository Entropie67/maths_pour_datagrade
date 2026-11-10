// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 816b8 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Exercice2F204 from '../2e/2F32-2-old'

export const titre = 'Résoudre graphiquement une équation'
export const interactifReady = true

export const dateDePublication = '13/4/2025'

export const uuid = '816b8'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class ExerciceEquationsOld extends Exercice2F204 {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.sup = '1'
  }
}
