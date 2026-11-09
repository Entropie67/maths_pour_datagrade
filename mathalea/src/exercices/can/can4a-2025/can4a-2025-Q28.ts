import type { MathfieldElement } from 'mathlive'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import type { IExercice } from '../../../lib/types'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Ratios'
export const interactifReady = true

export const uuid = '3422o'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q28 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
  }

  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(2, 6)
      b = randint(2, 6, a)
      c = (a + b) * randint(2, 6)
    }

    const part = c / (a + b)
    const partA = part * a
    const partB = part * b
    const callback = (exercice: IExercice, question: number) => {
      const mfe = document.querySelector(
        `#champTexteEx${exercice.numeroExercice}Q${question}`,
      ) as MathfieldElement
      if (mfe == null)
        return {
          isOk: false,
          feedback: '',
          score: { nbBonnesReponses: 0, nbReponses: 0 },
        }
      const num = Number(mfe.getPromptValue('champ1') || 0)
      const den = Number(mfe.getPromptValue('champ2') || 0)
      const isOk = num !== 0 && den !== 0 && num * b === a * den
      if (isOk) {
        mfe.setPromptState('champ1', 'correct', true)
        mfe.setPromptState('champ2', 'correct', true)
      }
      const spanReponseLigne = document.querySelector(
        `#resultatCheckEx${exercice.numeroExercice}Q${question}`,
      )
      if (spanReponseLigne != null) {
        spanReponseLigne.innerHTML = isOk ? '😎' : '☹️'
      }
      return {
        isOk,
        feedback: '',
        score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
      }
    }
    this.reponse = {
      champ1: { value: a },
      champ2: { value: b },
      bareme: toutPourUnPoint,
      callback,
    }
    this.consigne = `Dans un club sportif de $${c}$ membres, il y a $${partA}$ minimes et $${partB}$ cadets.<br>
    Quel est le ratio entre le nombre de minimes et le nombre de cadets ?`
    this.question = '%{champ1}:%{champ2}'
    this.correction = `Le ratio entre le nombre de minimes et le nombre de cadets est de $${miseEnEvidence(`${partA}`)}:${miseEnEvidence(`${partB}`)}$ ou $${miseEnEvidence(`${a}`)}:${miseEnEvidence(`${b}`)}$.`
    this.canEnonce = `Dans un club sportif de $${c}$ membres, il y a $${partA}$ minimes et $${partB}$ cadets.<br>
    Quel est le ratio entre le nombre de minimes et le nombre de cadets ?`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 3, 28)
    else this.enonce()
  }
}
