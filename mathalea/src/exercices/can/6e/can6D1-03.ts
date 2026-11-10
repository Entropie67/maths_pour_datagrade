import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Connaître les unités de mesure de durées courtes et les relations qui les lient'
export const dateDePublication = '01/08/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Éric Elter

 */
export const uuid = '62450'

export const refs = {
  'fr-fr': ['can6D1-03', '6M4autoC-1', '3AutoM01-3', '6AutoT1-4'],
  'fr-ch': ['NR'],
}
export default class AutoDureeMinutes extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const durees = [
      ['jour', 'heures', 24],
      ['heure', 'minutes', 60],
      ['minute', 'secondes', 60],
    ]
    const choix = this.quotaRandint('choix', 0, 2)

    this.reponse = durees[choix][2]
    this.question = `$1$ ${durees[choix][0]} = `
    this.canReponseACompleter =
      this.question + '$\\ldots\\ldots$ ' + durees[choix][1]
    this.correction =
      this.question + `$${miseEnEvidence(this.reponse)}$ ${durees[choix][1]}`
    if (!this.interactif) this.question = this.canReponseACompleter
    this.canEnonce = 'Compléter.'
    this.optionsChampTexte = { texteApres: durees[choix][1] }
  }
}
