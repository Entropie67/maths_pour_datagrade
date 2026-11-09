import type { IExerciceCan } from '../lib/types'
import ExerciceSimple from './ExerciceSimple'

export default class ExerciceCan
  extends ExerciceSimple
  implements IExerciceCan
{
  canOfficielle?: boolean // propriétés qui ne devraient pas être déclarées sur Exercice
  // listeCanReponseACompleter?: string[]
  // listeCanEnonce?: string[]
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.canOfficielle = false
    this.besoinFormulaireCaseACocher = ['sujet officiel', false]
  }
}
