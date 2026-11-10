import {
  addMathaleaSolveur,
  baremeSolveur,
  commentaireSolveur,
  formulaireBaremeSolveur,
  modeSolveur,
  optionsSolveur,
} from '../../lib/customElements/MathaleaSolveurElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Résoudre une équation $\\dfrac{ax+b}{c}=\\dfrac{d}{e}$'
export const interactifReady = true

export const dateDePublication = '10/09/2025'

/**
 *
 * @author Jean-Léon Henry
 */
export const dateDeModifImportante = '04/10/2026'

export const uuid = '45156'

export const refs = {
  'fr-fr': ['2L21-6'],
  'fr-ch': ['10LCFA5C-6', '10LSFA5C-6', '11CTFA4C-6', '11LCFA4C-6', '11LSFA4C-6'],
}
export default class ResoudreEquationAvecQuotient extends Exercice {
  constructor() {
    super()
    this.comment = commentaireSolveur

    this.besoinFormulaireCaseACocher = ['Mode entrainement en non interactif']
    this.sup = false
    this.besoinFormulaire2Numerique = formulaireBaremeSolveur()
    this.sup2 = 1
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Résoudre l'équation suivante."
        : 'Résoudre les équations suivantes.'
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      // Paramètres
      const a = randint(-10, 10, 0)
      const b = randint(-10, 10, 0)
      const c = randint(-10, 10, [-1, 0, 1])
      let d = randint(-10, 10, 0)
      let e = randint(-10, 10, [-1, 0, 1, d])
      if (e * d >= 0) {
        e = abs(e)
        d = abs(d)
      }

      // Variables de calculs intermédiaires
      const membre2 = new FractionEtendue(d, e)
      const equation = (align = false) => {
        return `\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(b)}}{${c}}${align ? '&=' : '='}${membre2.texFraction}`
      }
      const resultatFinal = new FractionEtendue(c * d - b * e, e * a)

      if (!this.questionJamaisPosee(i, a, b, c, d, e)) continue

      const texte = addMathaleaSolveur(this, i, {
        initial: equation(),
        kind: 'equation',
        ...optionsSolveur(this.interactif, this.sup, this.sup2),
      })

      let texteCorr = `Pour tous réels $a$, $b$, $c$, $d$ tels que $b$ et $d$ soient non nuls, $\\dfrac{a}{b}=\\dfrac{c}{d}$ si et seulement si $ad=bc$.`
      texteCorr += `<br>$\\begin{aligned}
${equation(true)}\\\\
${e}( ${rienSi1(a)}x${ecritureAlgebrique(b)} )&=${c} \\times ${ecritureParentheseSiNegatif(d)}\\\\
${rienSi1(e * a)}x${ecritureAlgebrique(e * b)}&=${c * d}\\\\
${rienSi1(e * a)}x&=${c * d}${ecritureAlgebrique(-b * e)}\\\\
${rienSi1(e * a)}x&=${c * d - b * e}`
      if (e * a !== 1) {
        texteCorr += `\\\\x&=${resultatFinal.texFSD}`
        if (!resultatFinal.estIrreductible && resultatFinal.num !== 0) {
          texteCorr += `=${resultatFinal.texFractionSimplifiee}`
        }
      }
      texteCorr += `
\\end{aligned}$<br>`

      texteCorr += `La solution de l'équation $${equation()}$ est $${miseEnEvidence(resultatFinal.texFractionSimplifiee)}$.`
      handleAnswers(
        this,
        i,
        {
          reponse: {
            value: `x=${resultatFinal.texFractionSimplifiee}`,
          },
          bareme: baremeSolveur(modeSolveur(this.sup2)),
        },
        { formatInteractif: 'mathalea-solveur' },
      )
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
