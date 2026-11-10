import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
export const dateDeModifImportante = '27/08/2026'
export const titre =
  'Écrire sous la forme $a^n$ en utilisant les formules sur les puissances'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Puissances d'un relatif (2)
 * * Travailler des résultats automatisés
 * * mais aussi d'utiliser les propriétés du produit de puissance, du quotient de puissances et des puissances de puissances
 * * Date initiale non renseignée
 * * Mise à jour le 2021-01-24
 * @author Gilles Mora
 */
export const uuid = 'a8a2e'

export const refs = {
  'fr-fr': ['2N43-2'],
  'fr-ch': ['10LCNO4B-7', '10LSNO4B-7', '11LCNO3B-7', '11LSNO3B-7'],
}

const introCorrection =
  "On simplifie l'écriture de l'expression en utilisant les formules sur les puissances :<br>"

export default class PuissancesDUnRelatif2 extends Exercice {
  constructor() {
    super()

    this.consigne = 'Écrire sous la forme $a^n$, où $n$ est un entier relatif.'
    this.besoinFormulaireCaseACocher = ['Avec exposants négatifs']
    this.sup = false // Avec exposants négatifs
    this.spacing = 2
    this.spacingCorr = 2.5
    this.nbQuestions = 8
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7, 8]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const avecExposantsNegatifs = this.sup
    // Génère un exposant entre -max et max (sans 0 ni 1) si le paramètre est activé,
    // sinon un exposant entre 1 et max (sans 1), comme dans la version historique.
    const genExp = (max: number): number =>
      avecExposantsNegatifs ? randint(-max, max, [0, 1]) : randint(1, max, [1])

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      let base = 0
      let exp: number[] = []
      let texte = ''
      let texteCorr = ''
      let reponseInteractive = ''
      let exposantInteractif = 0
      switch (typesDeQuestions) {
        case 1: {
          base = 3 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [genExp(7), genExp(7), genExp(7)] // on a besoin de 3 exposants distincts
          texte = `$\\dfrac{${base}^{${exp[0]}}\\times ${base * base}}{${base}^{${exp[1]}} \\times ${base}^{${exp[2]}}}$`
          const sommeNum = exp[0] + 2
          const sommeDen = exp[1] + exp[2]
          const finalExp = sommeNum - sommeDen
          texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${base}^{${exp[0]}}\\times ${base * base}}{${base}^{${exp[1]}} \\times ${base}^{${exp[2]}}}
&= \\dfrac{${base}^{${exp[0]}}\\times ${base}^{2}}{${base}^{${exp[1]}} \\times ${base}^{${exp[2]}}}\\\\
&= \\dfrac{${base}^{${exp[0]}+2}}{${base}^{${exp[1]}+${ecritureParentheseSiNegatif(exp[2])}}}\\\\
&= \\dfrac{${base}^{${sommeNum}}}{${base}^{${sommeDen}}}\\\\
&= ${base}^{${sommeNum}-${ecritureParentheseSiNegatif(sommeDen)}}\\\\
&= ${miseEnEvidence(`${base}^{${finalExp}}`)}
\\end{aligned}$`
          reponseInteractive = `${base}^{${finalExp}}`
          exposantInteractif = finalExp
          break
        }
        case 2: {
          base = 2 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [genExp(7), genExp(7)] // on a besoin de 2 exposants distincts
          texte = `$\\dfrac{${base}^{${exp[0]}}\\times ${base ** 3}}{${base}^{${exp[1]}}}$`
          const sommeNum = exp[0] + 3
          const finalExp = sommeNum - exp[1]
          texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${base}^{${exp[0]}}\\times ${base ** 3}}{${base}^{${exp[1]}}}
&= \\dfrac{${base}^{${exp[0]}}\\times ${base}^3}{${base}^{${exp[1]}}}\\\\
&= \\dfrac{${base}^{${exp[0]}+3}}{${base}^{${exp[1]}}}\\\\
&= \\dfrac{${base}^{${sommeNum}}}{${base}^{${exp[1]}}}\\\\
&= ${base}^{${sommeNum}-${ecritureParentheseSiNegatif(exp[1])}}\\\\
&= ${miseEnEvidence(`${base}^{${finalExp}}`)}
\\end{aligned}$`
          reponseInteractive = `${base}^{${finalExp}}`
          exposantInteractif = finalExp
          break
        }
        case 3: {
          base = 5 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [genExp(7), randint(1, 2)] // on a besoin de 2 exposants distincts
          // le second exposant ne peut valoir que 1 ou 2 la fonction testExp ne convient pas à l'affichage ici
          const exposantNum = 1 + exp[0]
          const exposantDen = 2 * exp[1]
          const finalExp = exposantNum - exposantDen
          if (exp[1] === 2) {
            texte = `$\\dfrac{${base}\\times ${base}^{${exp[0]}}}{${base ** 2}^{${exp[1]}}}$`
            texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${base}\\times ${base}^{${exp[0]}}}{${base ** 2}^{${exp[1]}}}
&= \\dfrac{${base}^{1+${ecritureParentheseSiNegatif(exp[0])}}}{(${base}^2)^{${exp[1]}}}\\\\
&= \\dfrac{${base}^{1+${ecritureParentheseSiNegatif(exp[0])}}}{${base}^{2\\times ${exp[1]}}}\\\\
&= \\dfrac{${base}^{${exposantNum}}}{${base}^{${exposantDen}}}\\\\
&= ${base}^{${exposantNum}-${ecritureParentheseSiNegatif(exposantDen)}}\\\\
&= ${miseEnEvidence(`${base}^{${finalExp}}`)}
\\end{aligned}$`
          } else {
            texte = `$\\dfrac{${base}\\times ${base}^{${exp[0]}}}{${base ** 2}}$`
            texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${base}\\times ${base}^{${exp[0]}}}{${base ** 2}}
&= \\dfrac{${base}^{1+${ecritureParentheseSiNegatif(exp[0])}}}{${base}^2}\\\\
&= ${base}^{${exposantNum}-${ecritureParentheseSiNegatif(exposantDen)}}\\\\
&= ${miseEnEvidence(`${base}^{${finalExp}}`)}
\\end{aligned}$`
          }
          reponseInteractive = `${base}^{${finalExp}}`
          exposantInteractif = finalExp
          break
        }
        case 4: {
          base = 2 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [genExp(7)] // on a besoin de 1 exposant
          texte = `$\\dfrac{${base}\\times ${base}^{${exp[0]}}}{${base ** 2}\\times ${base ** 2}}$`
          const exposantNum = 1 + exp[0]
          const finalExp = exposantNum - 4
          texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${base}\\times ${base}^{${exp[0]}}}{${base ** 2}\\times ${base ** 2}}
&= \\dfrac{${base}^{1+${ecritureParentheseSiNegatif(exp[0])}}}{${base}^2\\times ${base}^2}\\\\
&= \\dfrac{${base}^{${exposantNum}}}{${base}^{2+2}}\\\\
&= \\dfrac{${base}^{${exposantNum}}}{${base}^{4}}\\\\
&= ${base}^{${exposantNum}-4}\\\\
&= ${miseEnEvidence(`${base}^{${finalExp}}`)}
\\end{aligned}$`
          reponseInteractive = `${base}^{${finalExp}}`
          exposantInteractif = finalExp
          break
        }
        case 5: {
          base = 2 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [genExp(7)] // on a besoin de 1 exposant
          texte = `$\\dfrac{${base ** 2}^{${exp[0]}}}{${base}}$`
          const produit = 2 * exp[0]
          const finalExp = produit - 1
          texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${base ** 2}^{${exp[0]}}}{${base}}
&= \\dfrac{(${base}^2)^{${exp[0]}}}{${base}}\\\\
&= \\dfrac{${base}^{2\\times ${ecritureParentheseSiNegatif(exp[0])}}}{${base}}\\\\
&= \\dfrac{${base}^{${produit}}}{${base}}\\\\
&= ${base}^{${produit}-1}\\\\
&= ${miseEnEvidence(`${base}^{${finalExp}}`)}
\\end{aligned}$`
          // Inutile de tester l'exposant final car il vaut au minimum 3 dans la version historique
          reponseInteractive = `${base}^{${finalExp}}`
          exposantInteractif = finalExp
          break
        }
        case 6: {
          base = 3 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [genExp(3)] // on a besoin de 1 exposant
          texte = `$\\dfrac{${base ** 3}^{${exp[0]}}}{${base}}$`
          const produit = 3 * exp[0]
          const finalExp = produit - 1
          texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${base ** 3}^{${exp[0]}}}{${base}}
&= \\dfrac{(${base}^3)^{${exp[0]}}}{${base}}\\\\
&= \\dfrac{${base}^{3\\times ${ecritureParentheseSiNegatif(exp[0])}}}{${base}}\\\\
&= \\dfrac{${base}^{${produit}}}{${base}}\\\\
&= ${base}^{${produit}-1}\\\\
&= ${miseEnEvidence(`${base}^{${finalExp}}`)}
\\end{aligned}$`
          reponseInteractive = `${base}^{${finalExp}}`
          exposantInteractif = finalExp
          break
        }
        case 7: {
          base = 3 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [genExp(7), genExp(7), genExp(4)] // on a besoin de 3 exposants distincts
          texte = `$\\dfrac{${base}^{${exp[0]}}\\times ${base}^{${exp[1]}}}{${base ** 2}^{${exp[2]}}}\\times ${base}$`
          const sommeExp01 = exp[0] + exp[1]
          const sommeExp01Plus1 = sommeExp01 + 1
          const denomExp = 2 * exp[2]
          const finalExp = sommeExp01Plus1 - denomExp
          texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${base}^{${exp[0]}}\\times ${base}^{${exp[1]}}}{${base ** 2}^{${exp[2]}}}\\times ${base}
&= \\dfrac{${base}^{${exp[0]}+${ecritureParentheseSiNegatif(exp[1])}}}{(${base}^2)^{${exp[2]}}}\\times ${base}\\\\
&= \\dfrac{${base}^{${sommeExp01}}}{${base}^{2\\times ${ecritureParentheseSiNegatif(exp[2])}}}\\times ${base}\\\\
&= \\dfrac{${base}^{${sommeExp01}}}{${base}^{${denomExp}}}\\times ${base}\\\\
&= \\dfrac{${base}^{${sommeExp01}}\\times ${base}}{${base}^{${denomExp}}}\\\\
&= \\dfrac{${base}^{${sommeExp01}+1}}{${base}^{${denomExp}}}\\\\
&= \\dfrac{${base}^{${sommeExp01Plus1}}}{${base}^{${denomExp}}}\\\\
&= ${base}^{${sommeExp01Plus1}-${ecritureParentheseSiNegatif(denomExp)}}\\\\
&= ${miseEnEvidence(`${base}^{${finalExp}}`)}
\\end{aligned}$`
          reponseInteractive = `${base}^{${finalExp}}`
          exposantInteractif = finalExp
          break
        }
        case 8: {
          base = 2 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [genExp(7)] // on a besoin de 1 exposant
          texte = `$\\dfrac{${base ** 3}\\times ${base}}{${base ** 2}^{${exp[0]}}}$`
          const denomExp = 2 * exp[0]
          const finalExp = 4 - denomExp
          texteCorr = `${introCorrection}
$\\begin{aligned}
\\dfrac{${base ** 3}\\times ${base}}{${base ** 2}^{${exp[0]}}}
&= \\dfrac{${base}^3\\times ${base}}{(${base}^2)^{${exp[0]}}}\\\\
&= \\dfrac{${base}^{3+1}}{${base}^{2\\times ${ecritureParentheseSiNegatif(exp[0])}}}\\\\
&= \\dfrac{${base}^{4}}{${base}^{${denomExp}}}\\\\
&= ${base}^{4-${ecritureParentheseSiNegatif(denomExp)}}\\\\
&= ${miseEnEvidence(`${base}^{${finalExp}}`)}
\\end{aligned}$`
          reponseInteractive = `${base}^{${finalExp}}`
          exposantInteractif = finalExp
          break
        }
      }

      if (this.interactif && !context.isAmc) {
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: reponseInteractive,
              options: { sansExposantUn: exposantInteractif !== 1 },
            },
          },
          {
            formatInteractif: 'mathlive',
          },
        )
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
          {
            texteAvant: sp(2) + '$=$',
          },
        )
      }
      if (context.isAmc) {
        handleAnswers(this, i, {
          reponse: { value: base ** exposantInteractif },
        })
        const amcParam = ensureAmcParam(this, i)
        amcParam.basePuissance = base
        amcParam.exposantPuissance = exposantInteractif
      }

      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
