import type { MathfieldElement } from 'mathlive'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import type { IExercice } from '../../../lib/types'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Additionner un entier et une fraction'
export const interactifReady = true

export const uuid = 'e12d9'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class SommeEntierFraction extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    const listeFraction = this.canOfficielle
      ? [[1, 4]]
      : [
          [1, 3],
          [2, 3],
          [1, 4],
          [3, 4],
          [1, 5],
          [2, 5],
          [3, 5],
          [4, 5],
        ]
    const maFraction = choice(listeFraction)
    const a = this.canOfficielle ? 2 : randint(1, 4)
    const b = maFraction[0]
    const c = maFraction[1]
    const f = new FractionEtendue(b, c)
    const d = new FractionEtendue(a * c + b, c)
    const e = new FractionEtendue(a * c - b, c)
    const choix = this.canOfficielle ? true : choice([true, false])
    const numD = choix ? d.num : e.num
    const denD = choix ? d.den : e.den

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
      const isOk = num * denD === numD * den
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
    if (choix === true) {
      this.question = `${a}+${f.texFraction}=\\dfrac{%{champ1}}{%{champ2}}`
      this.correction = `$${a}+${f.texFraction} = \\dfrac{${a} \\times ${c}}{${c}} + \\dfrac{${b}}{${c}} = \\dfrac{${a * c}}{${c}} + \\dfrac{${b}}{${c}}  =${miseEnEvidence(d.texFraction)}$`
      this.reponse = { bareme: toutPourUnPoint, callback }
    } else {
      this.question = `${a}-${f.texFraction}=\\dfrac{%{champ1}}{%{champ2}}`
      this.correction = `$${a}-${f.texFraction} = \\dfrac{${a} \\times ${c}}{${c}} - \\dfrac{${b}}{${c}} = \\dfrac{${a * c}}{${c}} - \\dfrac{${b}}{${c}}  =${miseEnEvidence(e.texFraction)}$`
      this.reponse = { bareme: toutPourUnPoint, callback }
    }

    this.canEnonce = `${choix ? `$${a}+${f.texFraction}$` : `$${a}-${f.texFraction}$`}`
    this.canReponseACompleter = '$\\dfrac{\\ldots}{\\ldots}$'
  }
}
