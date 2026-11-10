import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { simpNotPuissance } from '../../lib/outils/puissance'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer des calculs avec des puissances'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '05/09/2026'

/**
 * Puissances d'un relatif (1) - version lycée
 * * Mêmes règles que 4C33-1 (produit, quotient, puissance de puissance,
 *   produit et quotient de même exposant), avec en plus la possibilité de
 *   tirer des exposants négatifs (case à cocher).
 * @author Gilles Mora
 */
export const uuid = 'a9198'

export const refs = {
  'fr-fr': ['2N43-1'],
  'fr-ch': ['NR'],
}

const introCorrection =
  "On applique la règle de calcul sur les puissances qui convient :<br>"

/** Remarque sur les puissances d'exposant pair/impair d'un nombre négatif. */
function remarquesPuissances(
  base: number,
  baseUtile: number | string,
  exposant: number,
) {
  if (base >= 0) return ''
  return exposant % 2 === 0
    ? `<br>${texteGras('Remarque : ')} Dans ce cas, comme les puissances d'exposant pair de deux nombres opposés sont égales, on peut écrire $${simpNotPuissance(base, exposant)}$ à la place de $${baseUtile}^{${exposant}}$.`
    : `<br>${texteGras('Remarque : ')} Dans ce cas, comme les puissances d'exposant impair de deux nombres négatifs sont opposées, on pourrait écrire $${simpNotPuissance(base, exposant)}$ à la place de $${baseUtile}^{${exposant}}$.`
}

export default class PuissancesDunRelatif12e extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Règle à travailler',
      'Nombres séparés par des tirets :\n1 : Produit de deux puissances de même base\n2 : Quotient de deux puissances de même base\n3 : Puissance de puissances\n4 : Produit de puissances de même exposant\n5 : Quotient de puissances de même exposant\n6 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Signe de la mantisse',
      3,
      '1 : Positif\n2 : Négatif\n3 : Mélange',
    ]
    this.besoinFormulaire3CaseACocher = ['Exposants négatifs']
    this.consigne = 'Écrire sous la forme $a^n$.'
    this.spacing = 2
    this.spacingCorr = 2.5
    this.nbQuestions = 5
    this.sup = 6
    this.sup2 = 3
    this.sup3 = true
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const avecExposantsNegatifs = this.sup3
    // Magnitude tirée entre min et max (en excluant éventuellement exclude),
    // rendue négative une fois sur deux si la case est cochée.
    const genExp = (min: number, max: number, exclude?: number): number => {
      const magnitude =
        exclude === undefined ? randint(min, max) : randint(min, max, exclude)
      return avecExposantsNegatifs && choice([true, false])
        ? -magnitude
        : magnitude
    }
    const signeMantisse = () =>
      this.sup2 === 1 ? 1 : this.sup2 === 2 ? -1 : choice([-1, 1])

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const typeDeQuestion = listeTypeDeQuestions[i]
      let texte = ''
      let texteCorr = ''
      let reponseInteractive = ''
      let exposantInteractif = 0

      switch (typeDeQuestion) {
        case 1: {
          // produit de puissances de même base
          const base = randint(2, 9) * signeMantisse()
          const baseUtile = base < 0 ? `(${base})` : base
          const exp0 = genExp(3, 5)
          let exp1 = genExp(2, 4)
          while (exp1 === exp0) exp1 = genExp(2, 4)
          const somme = exp0 + exp1
          texte = `$${baseUtile}^{${exp0}}\\times ${baseUtile}^{${exp1}}$`
          texteCorr = `${introCorrection}
$\\begin{aligned}
${baseUtile}^{${exp0}}\\times ${baseUtile}^{${exp1}}
&= ${baseUtile}^{${exp0}+${ecritureParentheseSiNegatif(exp1)}}\\\\
&= ${somme === 0 ? miseEnEvidence('1') : miseEnEvidence(`${baseUtile}^{${somme}}`)}
\\end{aligned}$`
          if (somme !== 0) texteCorr += remarquesPuissances(base, baseUtile, somme)
          reponseInteractive = somme === 0 ? '1' : `${baseUtile}^{${somme}}`
          exposantInteractif = somme
          break
        }
        case 2: {
          // quotient de puissances de même base
          const base = randint(2, 9) * signeMantisse()
          const baseUtile = base < 0 ? `(${base})` : base
          const exp0 = genExp(3, 5)
          let exp1 = genExp(2, 4)
          while (exp1 === exp0) exp1 = genExp(2, 4)
          const difference = exp0 - exp1
          texte = `$\\dfrac{${baseUtile}^{${exp0}}}{${baseUtile}^{${exp1}}}$`
          texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${baseUtile}^{${exp0}}}{${baseUtile}^{${exp1}}}
&= ${baseUtile}^{${exp0}-${ecritureParentheseSiNegatif(exp1)}}\\\\
&= ${difference === 0 ? miseEnEvidence('1') : miseEnEvidence(`${baseUtile}^{${difference}}`)}
\\end{aligned}$`
          if (difference !== 0)
            texteCorr += remarquesPuissances(base, baseUtile, difference)
          reponseInteractive =
            difference === 0 ? '1' : `${baseUtile}^{${difference}}`
          exposantInteractif = difference
          break
        }
        case 3: {
          // puissance de puissance
          const base = randint(2, 9) * signeMantisse()
          const baseUtile = base < 0 ? `(${base})` : base
          const exp0 = genExp(2, 3)
          const exp1 = genExp(2, 3)
          const produit = exp0 * exp1
          texte = `$(${baseUtile}^{${exp0}})^{${exp1}}$`
          texteCorr = `${introCorrection}
$\\begin{aligned}
(${baseUtile}^{${exp0}})^{${exp1}}
&= ${baseUtile}^{${exp0}\\times ${ecritureParentheseSiNegatif(exp1)}}\\\\
&= ${miseEnEvidence(`${baseUtile}^{${produit}}`)}
\\end{aligned}$`
          texteCorr += remarquesPuissances(base, baseUtile, produit)
          reponseInteractive = `${baseUtile}^{${produit}}`
          exposantInteractif = produit
          break
        }
        case 4: {
          // produit de puissances de même exposant
          let base0 = randint(2, 8, [4, 6])
          let base1 = randint(2, 8, [4, 6, base0])
          base0 *= signeMantisse()
          base1 *= signeMantisse()
          const exp = genExp(2, 4)
          const b0 = ecritureParentheseSiNegatif(base0)
          const b1 = ecritureParentheseSiNegatif(base1)
          const produit = base0 * base1
          texte = `$${b0}^{${exp}}\\times ${b1}^{${exp}}$`
          texteCorr = `${introCorrection}
$\\begin{aligned}
${b0}^{${exp}}\\times ${b1}^{${exp}}
&= (${b0}\\times ${b1})^{${exp}}\\\\
&= ${miseEnEvidence(`${ecritureParentheseSiNegatif(produit)}^{${exp}}`)}
\\end{aligned}$`
          reponseInteractive =
            produit > 0 ? `${produit}^{${exp}}` : `(${produit})^{${exp}}`
          exposantInteractif = exp
          break
        }
        case 5:
        default: {
          // quotient de puissances de même exposant
          let base0 = randint(2, 8, [4, 6])
          let base1 = randint(2, 8, [4, 6, base0])
          if (base0 < base1) [base0, base1] = [base1, base0]
          if (base0 % base1 !== 0) base0 = base1 * randint(2, 4)
          base0 *= signeMantisse()
          base1 *= signeMantisse()
          const exp = genExp(2, 5)
          const b0 = ecritureParentheseSiNegatif(base0)
          const b1 = ecritureParentheseSiNegatif(base1)
          const quotient = base0 / base1
          texte = `$\\dfrac{${b0}^{${exp}}}{${b1}^{${exp}}}$`
          texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${b0}^{${exp}}}{${b1}^{${exp}}}
&= \\left(\\dfrac{${b0}}{${b1}}\\right)^{${exp}}\\\\
&= ${miseEnEvidence(`${ecritureParentheseSiNegatif(quotient)}^{${exp}}`)}
\\end{aligned}$`
          reponseInteractive =
            quotient > 0 ? `${quotient}^{${exp}}` : `(${quotient})^{${exp}}`
          exposantInteractif = exp
          break
        }
      }

      handleAnswers(this, i, {
        reponse: {
          value: reponseInteractive,
          options: { sansExposantUn: exposantInteractif !== 1 },
        },
      })
      if (this.interactif && !context.isAmc) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFullOperations,
          { texteAvant: sp(2) + '$=$' },
        )
      }
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
