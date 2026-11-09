import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  'Calculer une valeur pour obtenir une moyenne pondérée donnée'
export const interactifReady = true

export const uuid = '1ho0q'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ21 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  enonce(
    n1?: number,
    n2?: number,
    c1?: number,
    c2?: number,
    c3?: number,
    moy?: number,
  ): void {
    if (n1 == null || n2 == null || c1 == null || c2 == null || c3 == null) {
      c1 = randint(1, 6)
      c2 = 1
      c3 = randint(2, 3)

      const totalCoeff = c1 + c2 + c3
      let x: number
      let tentatives = 0
      do {
        n1 = randint(5, 14)
        n2 = randint(5, 14, [n1])
        x = (10 * totalCoeff - n1 * c1 - n2 * c2) / c3
        tentatives++
      } while ((!Number.isInteger(x) || x < 0 || x > 20) && tentatives < 100)
      if (!Number.isInteger(x) || x < 0 || x > 20) {
        n1 = 5
        n2 = 8
        c1 = 2
        c2 = 1
        c3 = 3
        moy = 10
      }
    }

    const totalCoeff = c1 + c2 + c3
    const x = (10 * totalCoeff - n1 * c1 - n2 * c2) / c3

    this.reponse = texNombre(x, 2)

    this.question = `Donner la valeur de $x$ pour que la moyenne soit égale à $10$.<br>
    $\\def\\arraystretch{1.5}\\begin{array}{|c|c|c|c|}
    \\hline
    \\text{Notes} & ${n1} & ${n2} & x \\\\
    \\hline
    \\text{Coefficients} & ${c1} & ${c2} & ${c3} \\\\
    \\hline
    \\end{array}$<br>`

    if (this.interactif) {
      this.question += '$x=$'
    } else {
      this.question += '$x=\\ldots$'
    }

    this.correction = `
    Le total des coefficients est : $${c1} + ${c2} + ${c3} = ${totalCoeff}$.<br>
    La somme totale à obtenir avec les coefficients est : $10 \\times ${totalCoeff} = ${10 * totalCoeff}$.<br>
    La somme déjà obtenue avec les premières notes est : $${n1}\\times ${c1} + ${n2}\\times ${c2} = ${n1 * c1 + n2 * c2}$.<br>
    Il reste donc à obtenir avec $x$ une somme de $${10 * totalCoeff - n1 * c1 - n2 * c2}$, soit $${c3}x = ${10 * totalCoeff - n1 * c1 - n2 * c2}$, d'où $x = ${miseEnEvidence(texNombre(x, 2))}$.`

    this.canEnonce = `Donner la valeur de $x$ pour que la moyenne soit égale à $10$.<br>
    $\\def\\arraystretch{1.5}\\begin{array}{|c|c|c|c|}
    \\hline
    \\text{Notes} & ${n1} & ${n2} & x \\\\
    \\hline
    \\text{Coefficients} & ${c1} & ${c2} & ${c3} \\\\
    \\hline
    \\end{array}$`
    this.canReponseACompleter = '$x=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(5, 8, 2, 1, 3)
    else this.enonce()
  }
}
