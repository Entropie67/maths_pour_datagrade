import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { all, extractedRadicands } from '../../../lib/interactif/checks'
import { extraireRacineCarree } from '../../../lib/outils/calculs'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Simplifier des racines carrées'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = 'cc300'

export const refs = {
  'fr-fr': ['can2N5-08', '2N51-flash1'],
  'fr-ch': [],
}
export default class SimplificationsRacinesCarrees extends ExerciceSimple {
  constructor() {
    super()
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.compare = all([extractedRadicands()])
  }

  nouvelleVersion() {
    const a = this.quotaChoice(
      'a',
      [
        8, 18, 32, 50, 72, 98, 40, 200, 12, 27, 48, 75, 20, 45, 24, 28, 300,
        500, 600, 700, 40, 44, 52, 60, 63, 90, 54,
      ],
    )
    const reduction = extraireRacineCarree(a)
    this.question = ` Écrire $\\sqrt{${a}}$ sous la forme $a\\sqrt{b}$ où $a$ et $b$ sont des entiers avec $b$ le plus petit possible.`
    this.correction = `On a $${a}=${reduction[0]}^2\\times ${reduction[1]}$.<br>
   Ainsi, $\\sqrt{${a}}=\\sqrt{${reduction[0]}^2\\times ${reduction[1]}} =
    \\sqrt{${reduction[0]}^2}\\times \\sqrt{${reduction[1]}} =
    ${miseEnEvidence(`${reduction[0]}\\sqrt{${reduction[1]}`)}}$.<br>`
    this.reponse = `${reduction[0]}\\sqrt{${reduction[1]}}`
  }
}
