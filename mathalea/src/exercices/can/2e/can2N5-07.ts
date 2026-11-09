import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Transformer une racine carrée'
export const interactifReady = true

export const dateDePublication = '31/05/2026'
/**
 * @author  Gilles Mora
 *
 *
 */

export const uuid = 'fd4c6'

export const refs = {
  'fr-fr': ['can2N5-07'],
  'fr-ch': [],
}
export default class TransformerRacineCarree extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = { texteSansCasse: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 4)
    const b = this.quotaChoice('b', [2, 3, 5, 6])

    const c = a ** 2 * b

    this.reponse = c > 9 ? `\\sqrt{${c}}` : `\\sqrt${c}`

    this.question = `Écrire $${a}\\sqrt{${b}}$ sous la forme $\\sqrt{c}$.`

    this.correction = `On fait entrer le facteur $${a}$ sous la racine en l'élevant au carré :<br>
$\\begin{aligned}
${a}\\sqrt{${b}}&=\\sqrt{${a}^2}\\times \\sqrt{${b}}\\\\
&=\\sqrt{${a ** 2}}\\times \\sqrt{${b}}\\\\
&=\\sqrt{${a ** 2}\\times ${b}}\\\\
&=${miseEnEvidence(`\\sqrt{${c}}`)}
\\end{aligned}$`

    this.canEnonce = this.question
    this.canReponseACompleter = ''
  }
}
