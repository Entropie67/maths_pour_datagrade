import type { IExerciceQcmA } from '../lib/types'
import ExerciceQcm from './ExerciceQcm'

// class à utiliser pour fabriquer des Qcm ayant une version aléatoire
/**
 * @author Jean-claude Lhote
 */
export default class ExerciceQcmA extends ExerciceQcm implements IExerciceQcmA {
  versionAleatoire: () => void = () => {}
  aleatoire: () => void = () => {}

  constructor() {
    super()
    this.enonce = ''
    this.reponses = []
    this.correction = ''
    this.nbQuestionsModifiable = true
  }
}
