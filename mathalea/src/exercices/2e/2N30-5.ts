import { sameComparisonSign, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comparer deux fractions en étudiant leur quotient'
export const dateDePublication = '20/10/2026'
export const interactifReady = true

export const uuid = 'cf1df'

export const refs = {
  'fr-fr': ['2N30-5'],
  'fr-ch': [],
}

/**
 * Comparer deux fractions en étudiant leur quotient.
 * a = (m×p)/(n×r) et b = (m×q)/(n×s), donc a/b = (p×s)/(r×q).
 * @author Gilles Mora (d'après 2N44-1 de Stéphane Guyon)
 */
export default class ComparerDeuxFractionsParQuotient extends Exercice {
  constructor() {
    super()
    this.tip = `
      <p style="margin: 0;">
        Pour comparer deux nombres positifs $a$ et $b$, on peut calculer leur quotient $\\dfrac{a}{b}$ et le comparer à $1$.
      </p>
    `
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 2
    this.besoinFormulaireNumerique = [
      'Consigne',
      2,
      '1 : Sans indication de méthode\n2 : En indiquant la méthode attendue',
    ]
    this.sup = 1
  }

  nouvelleVersion() {
    this.consigne =
      this.sup === 2
        ? 'En comparant le quotient $\\dfrac{a}{b}$ à $1$, comparer les nombres $a$ et $b$.'
        : 'Comparer les deux nombres suivants en justifiant la réponse.'

    const facteurs = [2, 3, 5, 7]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 5000;) {
      const m = choice(facteurs)
      const n = choice(facteurs, [m])
      const p = randint(2, 5)
      const q = randint(2, 5, p)
      const r = randint(2, 5)
      const s = randint(2, 5, r)
      const num1 = m * p
      const den1 = n * r
      const num2 = m * q
      const den2 = n * s
      cpt++
      // Fractions irréductibles, du même côté de 1, et quotient proche de 1 sans lui être égal.
      if (
        p * s === r * q ||
        Math.abs((p * s) / (r * q) - 1) >= 0.3 ||
        pgcd(num1, den1) !== 1 ||
        pgcd(num2, den2) !== 1 ||
        (num1 - den1) * (num2 - den2) <= 0
      ) {
        continue
      }

      const quotient = new FractionEtendue(p * s, r * q)
      const reponse = quotient.valeurDecimale > 1 ? '>' : '<'

      let texte = `On pose $a=\\dfrac{${num1}}{${den1}}$ et $b=\\dfrac{${num2}}{${den2}}$.<br>`
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierCompare,
          {
            texteAvant: '$a$',
            texteApres: '$b$',
          },
        )
      }

      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          compare: seq([sameComparisonSign()]),
        },
      })

      const quotientFinal = quotient.estIrreductible
        ? quotient.texFraction
        : `${quotient.texFraction}=${quotient.texFractionSimplifiee}`

      const texteCorr = `Les nombres $a$ et $b$ sont strictement positifs. On étudie donc leur quotient :<br>
      $\\begin{aligned}
      \\dfrac{a}{b}
      &=\\dfrac{${num1}}{${den1}}\\times\\dfrac{${den2}}{${num2}}\\\\
      &=\\dfrac{${m}\\times${p}\\times${n}\\times${s}}{${n}\\times${r}\\times${m}\\times${q}}\\\\
      &=\\dfrac{${p}\\times${s}}{${r}\\times${q}}\\\\
      &=${quotientFinal}.
      \\end{aligned}$<br>
      Comme $${quotient.texFractionSimplifiee}$ est ${reponse === '>' ? 'supérieur' : 'inférieur'} à $1$, on en déduit que $a ${miseEnEvidence(reponse)} b$.`

      if (this.questionJamaisPosee(i, num1, den1, num2, den2)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
