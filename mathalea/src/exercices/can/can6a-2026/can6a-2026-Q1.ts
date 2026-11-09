import type { MathfieldElement } from 'mathlive'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { generateCleaner } from '../../../lib/interactif/cleaners'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import type { IExercice } from '../../../lib/types'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Déterminer les facteurs d'un carré parfait"
export const interactifReady = true

export const uuid = '0c7bb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q1 extends ExerciceCan {
  enonce(n?: number) {
    let carre: number

    if (n == null) {
      carre = choice([16, 25, 49, 64, 81])
    } else {
      carre = n
    }

    const racine = Math.sqrt(carre)

    this.formatInteractif = 'fillInTheBlank'
    const callback = (exercice: IExercice, question: number) => {
      const mfe = document.querySelector(
        `#champTexteEx${exercice.numeroExercice}Q${question}`,
      ) as MathfieldElement
      const cleaner = generateCleaner(['virgules'])
      if (mfe == null)
        return {
          isOk: false,
          feedback: '',
          score: { nbBonnesReponses: 0, nbReponses: 0 },
        }
      const a = Number(cleaner(mfe.getPromptValue('champ1')) || 0)
      const b = Number(cleaner(mfe.getPromptValue('champ2')) || 0)
      const isOk = a * b === carre
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
    this.reponse = { bareme: toutPourUnPoint, callback }

    this.consigne = 'Complète.'
    this.question = `${carre}=%{champ1}\\times%{champ2}`

    this.correction = `$${carre}=${miseEnEvidence(racine)}\\times${miseEnEvidence(racine)}$`

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${carre}=\\ldots\\times\\ldots$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(36)
    else this.enonce()
  }
}
