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
export const titre = "Exprimer une variable en fonction d'une autre"
export const interactifReady = true

export const uuid = 'zfriq'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q18 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { calculFormel: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  enonce(
    a?: number,
    b?: number,
    c?: number,
    var1?: string,
    var2?: string,
  ): void {
    if (a == null || b == null || c == null || var1 == null || var2 == null) {
      a = randint(-9, 9, [0, 1, -1])
      b = a * choice([-1, 1]) + choice([-1, 1])
      c = randint(1, 10)
      var1 = choice(['x', 'z', 'a'])
      var2 = choice(['b', 'c', 'y'])
    }

    this.question = `On donne la relation : $${rienSi1(a)}${var1}${ecritureAlgebriqueSauf1(b)}${var2}=${c}$.<br>
    Exprimer $${var2}$ en fonction de $${var1}$.`

    this.correction = `De la relation $${rienSi1(a)}${var1}${ecritureAlgebriqueSauf1(b)}${var2}=${c}$, on déduit en ajoutant $${rienSi1(-a)}${var1}$ dans chaque membre :
      $${rienSi1(b)}${var2}=${c}${ecritureAlgebriqueSauf1(-a)}${var1}$.`

    if (Math.abs(b) !== 1) {
      this.correction += `<br>Puis, en divisant par $${b}$, on obtient : $${var2}=${miseEnEvidence(`\\dfrac{${reduireAxPlusB(-a, c, var1)}}{${b}}`)}$.`
    } else if (b === -1) {
      this.correction += `<br>Soit : $${var2}=${miseEnEvidence(`${reduireAxPlusB(a, -c, var1)}`)}$.`
    } else {
      this.correction += `.<br>Soit : $${var2}=${miseEnEvidence(`${reduireAxPlusB(-a, c, var1)}`)}$.`
    }

    this.reponse = [
      `\\dfrac{${reduireAxPlusB(a, -c, var1)}}{${-b}}`,
      `\\dfrac{${reduireAxPlusB(-a, c, var1)}}{${b}}`,
    ]

    if (this.interactif) {
      this.question += `<br>$${var2}=$`
    }
    this.canEnonce = `On donne la relation : $${rienSi1(a)}${var1}${ecritureAlgebriqueSauf1(b)}${var2}=${c}$.<br>
    Exprimer $${var2}$ en fonction de $${var1}$.`
    this.canReponseACompleter = `$${var2}=\\ldots$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-9, 8, 7, 'z', 'b')
    else this.enonce()
  }
}
