import { sameInterval, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une inéquation du second degré'
export const interactifReady = true

export const uuid = '85bf3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ28 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.optionsChampTexte = { texteAvant: ' <br>$x\\in$' }
    this.compare = seq([sameInterval()])
  }

  nouvelleVersion() {
    // (ax+b)(x+d)
    const a = this.canOfficielle ? 2 : randint(3, 5)
    const b = this.canOfficielle ? -14 : randint(-5, 3, 0) * a
    const c = this.canOfficielle ? 1 : randint(4, 9)
    const inegalite = this.canOfficielle
      ? '\\leqslant'
      : choice(['\\leqslant', '\\geqslant'])
    this.reponse =
      inegalite === '\\leqslant'
        ? `[${-c};${-b / a}]`
        : [
            `]-\\infty;${-c}]\\cup [${-b / a};+\\infty[`,
            ` [${-b / a};+\\infty[\\cup]-\\infty;${-c}]`,
          ]
    this.question = `Résoudre $(${a}x${ecritureAlgebrique(b)})(x+${c})${inegalite} 0$`

    if (!this.interactif) {
      this.question += '<br> $x\\in \\ldots$'
    }
    this.correction = `On reconnaît une forme factorisée d'un polynôme du second degré.<br>
    Ses racines sont $${texNombre(-b / a, 0)}$ et $${-c}$.<br>
   Un polynôme du second degré est du signe de $a$ sauf entre ses racines.<br>
   Comme $a=${a}>0$, on en déduit que $x\\in `
    if (inegalite === '\\leqslant') {
      this.correction += ` ${miseEnEvidence(`[${-c};${-b / a}]`)}$.`
    } else {
      this.correction += `${miseEnEvidence(`]-\\infty;${-c}]\\cup [${-b / a};+\\infty[`)}$.`
    }
    this.canReponseACompleter = '$x\\in \\ldots$'
  }
}
