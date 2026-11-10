import { sameComparisonSign, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comparer deux nombres en étudiant leur quotient'
export const dateDePublication = '16/07/2026'
export const interactifReady = true

export const uuid = 'a39e1'

export const refs = {
  'fr-fr': ['2N44-1'],
  'fr-ch': [],
}

/**
 * Comparer deux nombres comportant des puissances en étudiant leur quotient.
 * @author Stéphane Guyon
 */
export default class ComparerDeuxNombresAvecPuissances extends Exercice {
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

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const [base1, base2] = choice([
        [2, 3],
        [3, 5],
        [4, 7],
        [5, 8],
        [6, 7],
        [7, 10],
        [8, 9],
        [9, 11],
        [3, 2],
        [5, 3],
        [7, 4],
        [8, 5],
        [7, 6],
        [10, 7],
        [9, 8],
        [11, 9],
      ])
      const exposant = randint(50, 100)
      const produitBases = base1 * base2
      const quotient = new FractionEtendue(base2, base1)
      const reponse = base2 < base1 ? '<' : '>'

      let texte = `On pose $a=${base1}^{${exposant}}\\times${base2}^{${exposant + 2}}$ et $b=${produitBases}^{${exposant + 1}}$.<br>`
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
      &=\\dfrac{${base1}^{${exposant}}\\times${base2}^{${exposant + 2}}}{${produitBases}^{${exposant + 1}}}\\\\
      &=\\dfrac{${base1}^{${exposant}}\\times${base2}^{${exposant + 2}}}
      {(${base1}\\times${base2})^{${exposant + 1}}}\\\\
      &=\\dfrac{${base1}^{${exposant}}\\times${base2}^{${exposant + 2}}}
      {${base1}^{${exposant + 1}}\\times${base2}^{${exposant + 1}}}\\\\
      &=\\dfrac{${base1}^{${exposant}}\\times${base2}\\times${base2}^{${exposant + 1}}}
      {${base1}\\times${base1}^{${exposant}}\\times${base2}^{${exposant + 1}}}\\\\
      &=${quotientFinal}.
      \\end{aligned}$<br>
      Comme $${quotient.texFractionSimplifiee}$ est ${quotient.valeurDecimale > 1 ? 'supérieur' : 'inférieur'} à $1$, on en déduit que $a ${miseEnEvidence(reponse)} b$.`

      if (this.questionJamaisPosee(i, base1, base2, exposant, produitBases)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
