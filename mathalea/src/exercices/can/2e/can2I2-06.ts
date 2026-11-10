import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un coefficient multiplicateur réciproque'
export const interactifReady = true

export const dateDePublication = '19/10/2026'

/**
 * @author Gilles Mora + ia (claude)
 */
export const uuid = '20d53'

export const refs = {
  'fr-fr': ['can2I2-06', '1A-E05-5'],
  'fr-ch': [],
}
export default class CoeffMulReciproque extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    // Entier ou fraction irréductible, pas d'écriture décimale
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.optionsChampTexte = { texteAvant: '<br>$CM_R=$', texteApres: '' }
  }

  nouvelleVersion() {
    let num: number
    let den: number
    let texCM: string
    let texCMR: string
    let estDecimal: boolean
    let distracteurs: string[]

    switch (this.quotaChoice('cas', ['fraction', 'fraction', 'decimal'])) {
      case 'decimal': {
        // Coefficients décimaux dont le réciproque est aussi décimal
        const [n, d] = this.quotaChoice('coeffDecimal', [
          [4, 5],
          [5, 4],
          [1, 2],
          [2, 5],
          [5, 2],
          [1, 4],
          [1, 5],
        ])
        num = n
        den = d
        estDecimal = true
        texCM = texNombre(num / den, 2)
        texCMR = texNombre(den / num, 2)
        distracteurs = [
          `$${texNombre(-den / num, 2)}$`,
          `$${texNombre(-num / den, 2)}$`,
          `$${texNombre(2 - num / den, 2)}$`,
        ]
        break
      }
      case 'fraction':
      default: {
        const [n, d] = this.quotaChoice('coeffFraction', [
          [5, 6],
          [2, 3],
          [3, 4],
          [4, 7],
          [5, 7],
          [7, 8],
          [7, 9],
          [3, 2],
          [4, 3],
          [7, 4],
          [6, 5],
          [7, 6],
          [8, 5],
          [9, 7],
        ])
        num = n
        den = d
        estDecimal = false
        texCM = new FractionEtendue(num, den).texFraction
        texCMR = new FractionEtendue(den, num).texFraction
        distracteurs = [`$-${texCMR}$`, `$-${texCM}$`, `$${texCM}$`]
        break
      }
    }

    this.question = `Le coefficient multiplicateur pour passer ${context.isDiaporama ? '<br>' : ''}d'une valeur $V_0$ à une valeur $V_1$ est $${texCM}$.<br>`
    this.question += this.versionQcm
      ? `Le coefficient multiplicateur réciproque $CM_R$ ${context.isDiaporama ? '<br>' : ''}pour revenir à la valeur $V_0$ à partir de la valeur $V_1$ est :`
      : `Déterminer le coefficient multiplicateur réciproque $CM_R$ ${context.isDiaporama ? '<br>' : ''}pour revenir à la valeur $V_0$ à partir de la valeur $V_1$.<br>
Donner le résultat sous la forme d'un entier ou d'une fraction irréductible.`

    this.correction = `Le coefficient multiplicateur réciproque $CM_R$ vérifie l'égalité $${texCM}\\times CM_R=1$.<br>
Le coefficient multiplicateur réciproque est donc l'inverse du coefficient multiplicateur.<br>
Ainsi, $CM_R=\\dfrac{1}{${texCM}}=${estDecimal && !this.versionQcm ? miseEnEvidence(new FractionEtendue(den, num).texFraction) : miseEnEvidence(texCMR)}$.`
    if (
      Number.isInteger((den * 100) / num) &&
      !Number.isInteger(den / num) &&
      (!estDecimal || !this.versionQcm)
    ) {
      // Le réciproque peut avoir une écriture décimale (6/5 = 1,2)
      this.correction += `<br>On peut aussi écrire $CM_R=${texNombre(den / num, 2)}$.`
    }

    this.reponse = this.versionQcm
      ? `$${texCMR}$`
      : new FractionEtendue(den, num).texFraction
    this.distracteurs = distracteurs

    this.canEnonce = `Le coefficient multiplicateur pour passer d'une valeur $V_0$ à une valeur $V_1$ est $${texCM}$.<br>
    Le coefficient multiplicateur réciproque pour revenir à $V_0$ à partir de $V_1$ est :`
    this.canReponseACompleter = '$CM_R=\\ldots$'
  }
}
