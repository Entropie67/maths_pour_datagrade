import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Résoudre une équation avec valeur absolue'
export const interactifReady = true

export const uuid = 'lvquc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ13 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { texteSansCasse: true }
    this.formatChampTexte = KeyboardType.clavierEnsemble
  }

  enonce(a?: number, b?: number): void {
    if (a == null || b == null) {
      a = randint(-5, 5, 0)
      b = randint(1, 9)
    }

    const x1 = a + b
    const x2 = a - b
    const petit = Math.min(x1, x2)
    const grand = Math.max(x1, x2)

    this.reponse = [
      `${petit};${grand}`,
      `${grand};${petit}`,
      `\\{${petit};${grand}\\}`,
      `\\{${grand};${petit}\\}`,
    ]
    this.optionsChampTexte = {
      texteAvant: '$\\{$',
      texteApres:
        "$\\}$ <br>(S'il y a plusieurs solutions, les écrire séparées d'un point-virgule)",
    }

    this.question = `Solution(s) de l'équation $|x${ecritureAlgebrique(-a)}|=${b}$.<br>`

    this.correction = `$|x${ecritureAlgebrique(-a)}|=${b}$ équivaut à $x${ecritureAlgebrique(-a)}=${b}$ ou $x${ecritureAlgebrique(-a)}=${-b}$.<br>
    Soit $x=${a}+${b}=${String(x1)}$ ou $x=${a}${ecritureAlgebrique(-b)}=${String(x2)}$.<br>
    L'ensemble des solutions est $\\{${miseEnEvidence(petit)}\\,;\\,${miseEnEvidence(grand)}\\}$.`

    this.canEnonce = `Solution(s) de l'équation $|x${ecritureAlgebrique(-a)}|=${b}$.`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(2, 3)
    else this.enonce()
  }
}
