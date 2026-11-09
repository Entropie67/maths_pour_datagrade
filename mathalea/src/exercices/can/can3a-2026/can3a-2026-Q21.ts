import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd, ppcm } from '../../../lib/outils/primalite'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Additionner deux fractions à dénominateurs différents'
export const interactifReady = true

export const uuid = 'yizcy'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q21 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  enonce(n1?: number, d1?: number, n2?: number, d2?: number) {
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }

    let frac1: FractionEtendue
    let frac2: FractionEtendue
    let resultat: FractionEtendue
    let p: number

    if (n1 == null || d1 == null || n2 == null || d2 == null) {
      // Version aléatoire : génération de deux fractions irréductibles
      do {
        frac1 = choice(obtenirListeFractionsIrreductibles())

        // Générer un dénominateur non multiple de frac1.den
        let den2: number
        do {
          den2 = randint(2, 7)
        } while (
          den2 === frac1.den ||
          den2 % frac1.den === 0 ||
          frac1.den % den2 === 0
        )

        const num2 = randint(1, den2 - 1)
        frac2 = new FractionEtendue(num2, den2)

        p = ppcm(frac1.den, frac2.den)
        const num1Adapte = frac1.num * (p / frac1.den)
        const num2Adapte = frac2.num * (p / frac2.den)

        resultat = new FractionEtendue(num1Adapte + num2Adapte, p)
      } while (resultat.num === resultat.den) // éviter que ça fasse 1
    } else {
      // Version avec paramètres explicites
      frac1 = new FractionEtendue(n1, d1)
      frac2 = new FractionEtendue(n2, d2)

      p = ppcm(d1, d2)
      const num1Adapte = n1 * (p / d1)
      const num2Adapte = n2 * (p / d2)

      resultat = new FractionEtendue(num1Adapte + num2Adapte, p)
    }

    this.question = `$${frac1.texFraction} + ${frac2.texFraction}$`

    this.correction = `On cherche un dénominateur commun (ici $${p}$), puis on additionne les numérateurs :<br>
$\\begin{aligned}
${frac1.texFraction} + ${frac2.texFraction} &= \\dfrac{${frac1.num}\\times ${texNombre(p / frac1.den, 0)}}{${frac1.den}\\times ${texNombre(p / frac1.den, 0)}} + \\dfrac{${frac2.num}\\times ${texNombre(p / frac2.den, 0)}}{${frac2.den}\\times ${texNombre(p / frac2.den, 0)}} \\\\
&= \\dfrac{${(frac1.num * p) / frac1.den}}{${resultat.den}} + \\dfrac{${(frac2.num * p) / frac2.den}}{${resultat.den}} \\\\[0.7em]
&= ${miseEnEvidence(resultat.texFraction)}${
      pgcd(resultat.num, resultat.den) !== 1
        ? ` = ${miseEnEvidence(resultat.texFractionSimplifiee)}`
        : ''
    }
\\end{aligned}$`

    this.reponse = resultat
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, 3, 5, 2)
    else this.enonce()
  }
}
