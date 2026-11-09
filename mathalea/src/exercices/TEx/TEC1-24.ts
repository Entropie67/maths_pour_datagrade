import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer le conjugué d'un quotient de complexes"
export const interactifReady = true
export const dateDePublication = '02/09/2026'
export const uuid = '772b9'

export const refs = {
  'fr-fr': ['TEC1-24'],
  'fr-ch': [],
}

/**
 * Déterminer le conjugué d'un nombre complexe donné sous la forme d'un
 * quotient de deux nombres complexes.
 *
 * @author Stéphane Guyon
 */
export default class ConjugueQuotientComplexes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacing = 1.5
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer le conjugué du nombre complexe suivant sous forme algébrique.'
        : 'Déterminer le conjugué de chacun des nombres complexes suivants sous forme algébrique.'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const numerateur = new Complexe(randint(-5, 5, 0), randint(-5, 5, 0))
      const denominateur = new Complexe(randint(-5, 5, 0), randint(-5, 5, 0))
      const resultat = numerateur.div(denominateur).conjugue()

      if (resultat.isReal) continue

      const numerateurConjugue = numerateur.conjugue()
      const denominateurConjugue = denominateur.conjugue()
      const numerateurRationalise = numerateurConjugue.mul(denominateur)
      const denominateurRationalise = denominateurConjugue.mul(denominateur)
      const quotient = `\\dfrac{${numerateur.tex()}}{${denominateur.tex()}}`

      let texte = `$z=${quotient}$`
      const texteCorr = `Pour tous nombres complexes $u$ et $v$, avec $v\\neq 0$, on a
      $\\overline{\\left(\\dfrac{u}{v}\\right)}=\\dfrac{\\overline{u}}{\\overline{v}}$.<br>
      Ainsi :<br>
      $\\begin{aligned}
      \\overline{z}
      &=\\dfrac{\\overline{${numerateur.tex()}}}{\\overline{${denominateur.tex()}}}\\\\
      &=\\dfrac{${numerateurConjugue.tex()}}{${denominateurConjugue.tex()}}.
      \\end{aligned}$<br>
      On multiplie le numérateur et le dénominateur par le conjugué de $${denominateurConjugue.tex()}$, c'est-à-dire par $${denominateur.tex()}$ :<br>
      $\\begin{aligned}
      \\overline{z}
      &=\\dfrac{${numerateurConjugue.tex()}}{${denominateurConjugue.tex()}}\\times\\dfrac{${denominateur.tex()}}{${denominateur.tex()}}\\\\
      &=\\dfrac{${numerateurConjugue.parentheseSiComplexe()}${denominateur.parentheseSiComplexe()}}{${denominateurConjugue.parentheseSiComplexe()}${denominateur.parentheseSiComplexe()}}\\\\
      &=\\dfrac{${numerateurRationalise.tex()}}{${denominateurRationalise.tex()}}\\\\
      &=${miseEnEvidence(resultat.tex())}.
      \\end{aligned}$`

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
          texteAvant: '<br>',
        })
      }
      handleAnswers(this, i, { reponse: { value: resultat.tex() } })

      if (
        this.questionJamaisPosee(
          i,
          numerateur.re,
          numerateur.im,
          denominateur.re,
          denominateur.im,
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
