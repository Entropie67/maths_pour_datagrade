import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Résoudre une équation avec quotients'
export const interactifReady = true

export const uuid = '6pzzo'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ14 extends ExerciceCan {
  constructor() {
    super()

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  enonce(a?: number, b?: number, c?: number): void {
    if (a == null || b == null || c == null) {
      a = randint(1, 9)
      b = randint(2, 9, [a])
      c = randint(2, 9, b)
    }

    const resultat = new FractionEtendue(a * c, b).simplifie()

    this.reponse = resultat.texFraction

    this.question = `$\\dfrac{${a}}{x}=\\dfrac{${b}}{${c}}$<br><br>`

    if (this.interactif) {
      this.question += '$x=$'
    } else {
      this.question += '$x=\\ldots$'
    }

    this.correction = `$\\dfrac{${a}}{x}=\\dfrac{${b}}{${c}}$ équivaut à $x=\\dfrac{${a}\\times ${c}}{${b}}=\\dfrac{${a * c}}{${b}}${pgcd(a * c, b) === 1 ? '' : `=${resultat.texFraction}`}$.<br>
    La solution de l'équation est $${miseEnEvidence(resultat.texFraction)}$.`

    this.canEnonce = `$\\dfrac{${a}}{x}=\\dfrac{${b}}{${c}}$`
    this.canReponseACompleter = '$x=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(2, 3, 4)
    else this.enonce()
  }
}
