import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd, ppcm } from '../../../lib/outils/primalite'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer une somme ou une différence de fractions à dénominateurs différents'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '05/07/2025'
/**
 * @author Gilles Mora avec IA
 *

 */
export const uuid = '08a2a'

export const refs = {
  'fr-fr': ['can6C53-04', '6N3K-flash4', '2N31-flash2'],
  'fr-ch': ['NR'],
}
export default class SommeDiffFractionsCompatibles extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacingCorr = 1.5
    this.optionsDeComparaison = { fractionEgale: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    let frac1: FractionEtendue
    let frac2: FractionEtendue
    let resultat: FractionEtendue
    let p: number

    switch (this.quotaChoice('typeDeQuestions', [1, 2])) {
      case 1: // addition
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

        this.question = `Calculer $${frac1.texFraction} + ${frac2.texFraction}$.`
        this.correction = `On cherche un dénominateur commun (ici $${ppcm(frac1.den, frac2.den)}$), puis on additionne les numérateurs :<br>
$\\begin{aligned}
${frac1.texFraction} + ${frac2.texFraction} &= \\dfrac{${frac1.num}\\times ${texNombre(p / frac1.den, 0)}}{${frac1.den}\\times ${texNombre(p / frac1.den, 0)}} + \\dfrac{${frac2.num}\\times ${texNombre(p / frac2.den, 0)}}{${frac2.den}\\times ${texNombre(p / frac2.den, 0)}} \\\\
&= \\dfrac{${(frac1.num * p) / frac1.den}}{${resultat.den}} + \\dfrac{${(frac2.num * p) / frac2.den}}{${resultat.den}} \\\\[0.7em]
&= ${miseEnEvidence(resultat.texFraction)}${
          pgcd(resultat.num, resultat.den) !== 1
            ? ` = ${miseEnEvidence(resultat.texFractionSimplifiee)}`
            : ''
        }
\\end{aligned}$`

        if (this.interactif) {
          this.question = `$${frac1.texFraction} + ${frac2.texFraction} = $`
        }
        break

      case 2: // soustraction
      default:
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
          const diff = num1Adapte - num2Adapte

          resultat = new FractionEtendue(diff, p)
        } while (resultat.num <= 0 || resultat.num === resultat.den)

        this.question = `Calculer $${frac1.texFraction} - ${frac2.texFraction}$.`
        this.correction = `On réduit au même dénominateur ($${resultat.den}$), puis on soustrait les numérateurs :<br>
$\\begin{aligned}
${frac1.texFraction} - ${frac2.texFraction} &= \\dfrac{${frac1.num}\\times ${texNombre(p / frac1.den, 0)}}{${frac1.den}\\times ${texNombre(p / frac1.den, 0)}} -\\dfrac{${frac2.num}\\times ${texNombre(p / frac2.den, 0)}}{${frac2.den}\\times ${texNombre(p / frac2.den, 0)}} \\\\
&= \\dfrac{${(frac1.num * p) / frac1.den}}{${resultat.den}} - \\dfrac{${(frac2.num * p) / frac2.den}}{${resultat.den}} \\\\[0.7em]
&= ${miseEnEvidence(resultat.texFraction)}${
          pgcd(resultat.num, resultat.den) !== 1
            ? ` = ${miseEnEvidence(resultat.texFractionSimplifiee)}`
            : ''
        }
\\end{aligned}$`

        if (this.interactif) {
          this.question = `$${frac1.texFraction} - ${frac2.texFraction} = $`
        }
        break
    }

    this.reponse = resultat
  }
}
