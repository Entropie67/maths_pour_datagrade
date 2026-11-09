import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../../modules/fractions'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Calculer la somme ou la différence d'un entier et d'une fraction"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '06/07/2025'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const uuid = 'dd7d1'

export const refs = {
  'fr-fr': ['can6C53-06', '6N3K-flash5', '2N31-flash1'],
  'fr-ch': ['NR'],
}
export default class SommeDiffEntierFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    let resultat: FractionEtendue

    switch (this.quotaChoice('typeDeQuestions', [1, 2])) {
      case 1: // addition
        {
          const frac = choice(obtenirListeFractionsIrreductibles())
          const entier = randint(1, 10)
          resultat = new FractionEtendue(entier * frac.den + frac.num, frac.den)
          this.question = `Calculer $${entier} + ${frac.texFraction}$.`
          this.correction = `On écrit l'entier sous la forme d'une fraction de dénominateur $${frac.den}$, soit $${entier}=  \\dfrac{${entier * frac.den}}{${frac.den}}$<br>
$\\begin{aligned}
${entier} + ${frac.texFraction} &= \\dfrac{${entier * frac.den}}{${frac.den}} + ${frac.texFraction} \\\\
&= ${miseEnEvidence(resultat.texFraction)}${
            pgcd(resultat.num, resultat.den) !== 1
              ? ` = ${miseEnEvidence(resultat.texFractionSimplifiee)}`
              : ''
          }
\\end{aligned}$`

          if (this.interactif) {
            this.question = `$${entier} + ${frac.texFraction} = $`
          }
        }
        break

      case 2: // soustraction
      default:
        {
          let frac: FractionEtendue
          let entier: number

          do {
            frac = choice(obtenirListeFractionsIrreductibles())
            entier = randint(1, 10)
            resultat = new FractionEtendue(
              entier * frac.den - frac.num,
              frac.den,
            )
          } while (resultat.num <= 0)

          this.question = `Calculer $${entier} - ${frac.texFraction}$.`

          this.correction = `On écrit l'entier sous la forme d'une fraction de dénominateur $${frac.den}$, soit $${entier}=  \\dfrac{${entier * frac.den}}{${frac.den}}$<br>
$\\begin{aligned}
${entier} - ${frac.texFraction} &= \\dfrac{${entier * frac.den}}{${frac.den}} - ${frac.texFraction} \\\\
&= ${miseEnEvidence(resultat.texFraction)}${
            pgcd(resultat.num, resultat.den) !== 1
              ? ` = ${miseEnEvidence(resultat.texFractionSimplifiee)}`
              : ''
          }
\\end{aligned}$`

          if (this.interactif) {
            this.question = `$${entier} - ${frac.texFraction} = $`
          }
        }
        break
    }

    this.reponse = resultat
  }
}
