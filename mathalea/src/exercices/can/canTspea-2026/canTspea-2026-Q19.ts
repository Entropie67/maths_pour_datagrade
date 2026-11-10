import type { MathfieldElement } from 'mathlive'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { generateCleaner } from '../../../lib/interactif/cleaners'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebriqueSauf1, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import type { IExercice } from '../../../lib/types'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'
export const titre =
  "Déterminer les coordonnées d'un vecteur normal à un plan à partir de son équation"
export const interactifReady = true

export const uuid = 'y75un'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ19 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number, d?: number): void {
    if (a == null || b == null || c == null || d == null) {
      // On génère une équation avec 2 ou 3 termes non nuls

      const cas = choice([1, 2, 3])
      switch (cas) {
        case 1: // ax + cz = d (pas de y)
          a = randint(-5, 5, 0)
          b = 0
          c = randint(-5, 5, 0)
          d = randint(-9, 9)
          break
        case 2: // ax + by = d (pas de z)
          a = randint(-5, 5, 0)
          b = randint(-5, 5, 0)
          c = 0
          d = randint(-9, 9)
          break
        case 3: //  by + cz = d
        default:
          a = 0
          b = randint(-5, 5, 0)
          c = randint(-5, 5, 0)
          d = randint(-9, 9)
          break
      }
    }
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
      const aSaisi = Number(cleaner(mfe.getPromptValue('champ1')) || 0)
      const bSaisi = Number(cleaner(mfe.getPromptValue('champ2')) || 0)
      const cSaisi = Number(cleaner(mfe.getPromptValue('champ3')) || 0)
      let isOk = false
      if (
        isNaN(aSaisi) ||
        isNaN(bSaisi) ||
        isNaN(cSaisi) ||
        (aSaisi === 0 && bSaisi === 0 && cSaisi === 0)
      ) {
        isOk = false
        if (isNaN(aSaisi)) {
          mfe.setPromptState('champ1', 'incorrect', true)
        }
        if (isNaN(bSaisi)) {
          mfe.setPromptState('champ2', 'incorrect', true)
        }
        if (isNaN(cSaisi)) {
          mfe.setPromptState('champ3', 'incorrect', true)
        }
      } else {
        const a = Number(
          exercice.autoCorrection[question].valeur?.champ1?.value,
        )
        const b = Number(
          exercice.autoCorrection[question].valeur?.champ2?.value,
        )
        const c = Number(
          exercice.autoCorrection[question].valeur?.champ3?.value,
        )
        isOk =
          a * bSaisi - b * aSaisi === 0 &&
          a * cSaisi - c * aSaisi === 0 &&
          b * cSaisi - c * bSaisi === 0
      }

      if (isOk) {
        mfe.setPromptState('champ1', 'correct', true)
        mfe.setPromptState('champ2', 'correct', true)
        mfe.setPromptState('champ3', 'correct', true)
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

    this.formatInteractif = 'fillInTheBlank'
    this.reponse = {
      bareme: toutPourUnPoint,
      callback,
      champ1: { value: String(a) },
      champ2: { value: String(b) },
      champ3: { value: String(c) },
    }

    // Construction de l'équation du plan
    let equation = ''
    let premier = true
    if (a !== 0) {
      equation += `${rienSi1(a)}x`
      premier = false
    }
    if (b !== 0) {
      equation += premier ? `${rienSi1(b)}y` : `${ecritureAlgebriqueSauf1(b)}y`
      premier = false
    }
    if (c !== 0) {
      equation += premier ? `${rienSi1(c)}z` : `${ecritureAlgebriqueSauf1(c)}z`
    }
    equation += `=${d}`

    this.consigne = `Coordonnées d'un vecteur normal $\\vec{n}$ au plan d'équation $${equation}$${sp()}:`
    this.question = `\\vec{n}(%{champ1}\\,;\\,%{champ2}\\,;\\,%{champ3})`

    this.correction = `Pour un plan d'équation $ax+by+cz=d$, un vecteur normal est $\\vec{n}(a\\,;\\,b\\,;\\,c)$.<br>
    Ici, $${equation}$, donc $\\vec{n}(${miseEnEvidence(String(a))}\\,;\\,${miseEnEvidence(String(b))}\\,;\\,${miseEnEvidence(String(c))})$.<br>
    Remarque${sp()}: tout vecteur de la forme $\\vec{n}(ka\\,;\\,kb\\,;\\,kc)$ avec $k\\neq 0$ est aussi un vecteur normal au plan.`
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canEnonce = `Coordonnées d'un vecteur normal $\\vec{n}$ au plan d'équation $${equation}$.`
    this.canReponseACompleter =
      '$\\vec{n}(\\ldots\\,;\\,\\ldots\\,;\\,\\ldots)$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle || this.sup) this.enonce(1, 0, -3, 0)
    else this.enonce()
  }
}
