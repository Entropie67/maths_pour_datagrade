import { sameComparisonSign, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comparer deux nombres en écriture fractionnaire'
export const dateDePublication = '16/07/2026'
export const interactifReady = true

export const uuid = '410a3'

export const refs = {
  'fr-fr': ['2N30-3'],
  'fr-ch': ['9R1NO4H-10', '9R2NO4H-10', '9R3NO4H-10'],
}

type Situation = 'dePartEtDAutreDeUn' | 'memeCoteDeUn'
type CoupleFractions = [[number, number], [number, number]]

function melangeCouple(couple: CoupleFractions): CoupleFractions {
  return choice([couple, [couple[1], couple[0]]])
}

/**
 * Comparer deux fractions positives en les situant par rapport à 1,
 * ou en étudiant leur différence ou leur quotient.
 * @author Stéphane Guyon
 */
export default class ComparerDeuxFractions extends Exercice {
  constructor() {
    super()
    this.tip = `
      <p style="margin: 0 0 10px 0;">
        Pour comparer deux nombres positifs $A$ et $B$, plusieurs méthodes sont possibles.
      </p>
      <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0; line-height: 2;">
        <li>Les comparer d'abord à $1$ : une fraction dont le numérateur est supérieur au dénominateur est supérieure à $1$.</li>
        <li>Calculer $A-B$, après avoir réduit les fractions au même dénominateur, puis étudier le signe de la différence.</li>
        <li>Calculer $\\dfrac{A}{B}$ puis comparer ce quotient à $1$ : s'il est supérieur à $1$, alors $A > B$ ; s'il est inférieur à $1$, alors $A < B$.</li>
      </ul>
    `
    this.nbQuestions = 2
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Comparer les deux nombres suivants en justifiant la réponse.'
        : 'Comparer les deux nombres de chaque question en justifiant les réponses.'

    const situations = combinaisonListes<Situation>(
      ['dePartEtDAutreDeUn', 'memeCoteDeUn'],
      this.nbQuestions,
    )
    const couplesDePartEtDAutreDeUn: CoupleFractions[] = [
      [
        [4, 3],
        [3, 5],
      ],
      [
        [7, 5],
        [5, 6],
      ],
      [
        [9, 7],
        [4, 5],
      ],
      [
        [5, 4],
        [7, 8],
      ],
      [
        [8, 5],
        [5, 7],
      ],
      [
        [7, 4],
        [8, 9],
      ],
    ]
    const couplesMemeCoteDeUn: CoupleFractions[] = [
      [
        [2, 3],
        [3, 4],
      ],
      [
        [3, 5],
        [5, 8],
      ],
      [
        [4, 7],
        [5, 8],
      ],
      [
        [5, 6],
        [7, 8],
      ],
      [
        [3, 4],
        [4, 5],
      ],
      [
        [4, 3],
        [3, 2],
      ],
      [
        [5, 4],
        [4, 3],
      ],
      [
        [7, 5],
        [3, 2],
      ],
      [
        [8, 5],
        [5, 3],
      ],
      [
        [7, 4],
        [9, 5],
      ],
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const situation = situations[i]
      const couple = melangeCouple(
        choice(
          situation === 'dePartEtDAutreDeUn'
            ? couplesDePartEtDAutreDeUn
            : couplesMemeCoteDeUn,
        ),
      )
      const A = new FractionEtendue(couple[0][0], couple[0][1])
      const B = new FractionEtendue(couple[1][0], couple[1][1])
      const difference = A.differenceFraction(B)
      const quotient = new FractionEtendue(A.num * B.den, A.den * B.num)
      const reponse = A.valeurDecimale < B.valeurDecimale ? '<' : '>'

      let texte = `On pose $A=${A.texFraction}$ et $B=${B.texFraction}$.<br>`
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierCompare,
          {
            texteAvant: '$A$',
            texteApres: '$B$',
          },
        )
      }

      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          compare: seq([sameComparisonSign()]),
        },
      })

      let texteCorr = ''
      if (situation === 'dePartEtDAutreDeUn') {
        const fractionSuperieureAUn = A.valeurDecimale > 1 ? 'A' : 'B'
        const fractionInferieureAUn = A.valeurDecimale < 1 ? 'A' : 'B'
        const fractionSuperieure = fractionSuperieureAUn === 'A' ? A : B
        const fractionInferieure = fractionInferieureAUn === 'A' ? A : B

        texteCorr = `
        Dans la fraction $${fractionSuperieure.texFraction}$, on observe que le numérateur est supérieur au dénominateur, donc $${fractionSuperieureAUn} > 1$.<br><br>
        Alors que dans la fraction $${fractionInferieure.texFraction}$, le numérateur est inférieur au dénominateur, donc $${fractionInferieureAUn} < 1$.<br><br>
        On en déduit que $A ${miseEnEvidence(reponse)} B$.`
      } else {
        texteCorr = `On peut procéder de deux manières différentes.<br>
        ${texteEnCouleurEtGras('Première méthode :', 'black')} on calcule la différence $A-B$.<br>
        $\\begin{aligned}
        A-B
        &=${A.texFraction}-${B.texFraction}\\\\
        &=\\dfrac{${A.num}\\times${B.den}}{${A.den}\\times${B.den}}
        -\\dfrac{${B.num}\\times${A.den}}{${B.den}\\times${A.den}}\\\\
        &=\\dfrac{${A.num * B.den}}{${A.den * B.den}}
        -\\dfrac{${B.num * A.den}}{${B.den * A.den}}\\\\
        &=\\dfrac{${A.num * B.den}-${B.num * A.den}}{${A.den * B.den}}\\\\
        &=${difference.texFractionSimplifiee}.
        \\end{aligned}$<br>
        Cette différence est ${difference.num < 0 ? 'négative' : 'positive'}, donc $A ${miseEnEvidence(reponse)} B$.<br><br>
        ${texteEnCouleurEtGras('Deuxième méthode :', 'black')} on calcule le quotient de fractions $\\dfrac{A}{B}$.<br>
        Comme les nombres $A$ et $B$ sont positifs, on peut comparer ce quotient à $1$ :<br>
        $\\begin{aligned}
        \\dfrac{A}{B}
        &=${A.texFraction}\\div${B.texFraction}\\\\
        &=${A.texFraction}\\times\\dfrac{${B.den}}{${B.num}}\\\\
        &=\\dfrac{${A.num * B.den}}{${A.den * B.num}}${
          quotient.estIrreductible
            ? '.'
            : `\\\\
        &=${quotient.texFractionSimplifiee}.`
        }
        \\end{aligned}$<br>
        Comme $${quotient.texFractionSimplifiee}$ est ${quotient.valeurDecimale < 1 ? 'inférieur' : 'supérieur'} à $1$, on obtient $A ${miseEnEvidence(reponse)} B$.<br><br>
        `
      }

      if (this.questionJamaisPosee(i, A.num, A.den, B.num, B.den, situation)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
