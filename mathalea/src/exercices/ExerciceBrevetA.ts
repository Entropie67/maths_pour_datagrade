import type { IExerciceBrevetA } from '../lib/types'
import ExerciceBrevet from './ExerciceBrevet'

// class à utiliser pour fabriquer des Qcm ayant une version aléatoire
/**
 * @author Jean-claude Lhote
 */
export default class ExerciceBrevetA
  extends ExerciceBrevet
  implements IExerciceBrevetA
{
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false

    this.versionAleatoire(0)
  }

  versionAleatoire: (i: number) => void = () => {}
}
