import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Écrire un quotient de complexes sous forme algébrique'
export const interactifReady = true
export const dateDePublication = '13/09/2026'
export const uuid = '78d54'

export const refs = {
  'fr-fr': ['TEC1-22'],
  'fr-ch': [],
}

/**
 * Écrire sous forme algébrique un quotient de deux nombres complexes.
 *
 * @author Stéphane Guyon
 */
export default class FormeAlgebriqueQuotientComplexes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Écrire le nombre complexe suivant sous forme algébrique.'
        : 'Écrire les nombres complexes suivants sous forme algébrique.'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const a = randint(-5, 5, 0)
      const b = randint(-5, 5, 0)
      const c = randint(-5, 5, 0)
      const d = randint(-5, 5, 0)
      const numerateur = new Complexe(a, b)
      const denominateur = new Complexe(c, d)

      // Les deux complexes ne sont pas proportionnels et leur quotient a
      // une partie réelle et une partie imaginaire non nulles.
      if (a * d === b * c || a * c + b * d === 0) {
        continue
      }

      const denominateurConjugue = denominateur.conjugue()
      const partieImaginaireConjugue = -d
      const numerateurRationalise = numerateur.mul(denominateurConjugue)
      const denominateurRationalise = denominateur.mul(denominateurConjugue)
      const resultat = numerateur.div(denominateur)
      const quotient = `\\dfrac{${numerateur.tex()}}{${denominateur.tex()}}`

      let texte = `$z=${quotient}$`
      const texteCorr = `Pour écrire $z$ sous forme algébrique, il faut rendre son dénominateur réel.  <br>
      Si $z=x+iy$, alors $z\\times\\overline{z}=x^2+y^2$, qui est un nombre réel. <br>
     L'idée est donc de multiplier le numérateur et le dénominateur de $z$ par le conjugué de son dénominateur, c'est-à-dire par $${denominateurConjugue.tex()}$ :<br>
      <br>
      $\\begin{aligned}
      z
      &=\\dfrac{${numerateur.tex()}}{${denominateur.tex()}}\\times\\dfrac{${denominateurConjugue.tex()}}{${denominateurConjugue.tex()}}\\\\
      &=\\dfrac{${numerateur.parentheseSiComplexe()}${denominateurConjugue.parentheseSiComplexe()}}{${denominateur.parentheseSiComplexe()}${denominateurConjugue.parentheseSiComplexe()}}\\\\
      &=\\dfrac{${a}\\times${ecritureParentheseSiNegatif(c)}-${ecritureParentheseSiNegatif(b)}\\times${ecritureParentheseSiNegatif(partieImaginaireConjugue)}+\\left(${a}\\times${ecritureParentheseSiNegatif(partieImaginaireConjugue)}+${ecritureParentheseSiNegatif(b)}\\times${ecritureParentheseSiNegatif(c)}\\right)i}{${ecritureParentheseSiNegatif(c)}^2+${ecritureParentheseSiNegatif(d)}^2}\\\\
      &=\\dfrac{${numerateurRationalise.tex()}}{${denominateurRationalise.tex()}}\\\\
      &=${miseEnEvidence(resultat.tex())}
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
