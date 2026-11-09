// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid bf662 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Exercice4L20 from '../4e/4L20-old2'

export const titre = 'Résoudre une équation du premier degré'
export const interactifReady = true

export const dateDePublication = '13/4/2025'

export const uuid = 'bf662'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class ExerciceEquationsOld extends Exercice4L20 {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaire2Texte = false
    this.sup2 = '3-4'
  }
}
