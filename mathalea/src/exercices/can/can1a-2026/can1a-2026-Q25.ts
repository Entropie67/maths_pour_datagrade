import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une fonction dérivée'
export const interactifReady = true

export const uuid = '1g19h'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q26 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsDeComparaison = { calculFormel: true }
  }

  enonce(a?: number, b?: number): void {
    if (a == null || b == null) {
      a = randint(2, 9) * choice([-1, 1])
      b = randint(1, 5) * choice([-1, 1])
    }

    this.reponse = reduireAxPlusB(2 * b, a)
    this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : $f(x)=${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}x^2$, alors :<br>
    $f'(x)=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `On dérive terme à terme :<br>
      $f'(x)=${a}${ecritureAlgebriqueSauf1(2 * b)}x=${miseEnEvidence(reduireAxPlusB(2 * b, a))}$`
    this.canEnonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : $f(x)=${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}x^2$.`
    this.canReponseACompleter = "$f'(x)=\\ldots$"
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3, -1)
    else this.enonce()
  }
}
