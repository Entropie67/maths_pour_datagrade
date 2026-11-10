// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 1b91d continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceDecomposerEnFacteursPremiers from '../../5e/5N1L-4'
export const interactifReady = true

export const titre = 'Décomposer en produit de facteurs premiers'
export const uuid = '1b91d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class DecomposerFacteursPremierSimpleOld extends ExerciceDecomposerEnFacteursPremiers {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup2 = false
    this.sup = 1

    this.consigne = 'Décomposer en produit de facteurs premiers :'
  }
}
