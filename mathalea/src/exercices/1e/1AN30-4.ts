import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre des équations avec la fonction exponentielle'
export const dateDePublication = '06/05/2025'
export const interactifReady = true

/**
 * Résoudre des équations produit nul avec des exponentielles.
 * @author Stéphane Guyon
 */

export const uuid = '61ed1'

export const refs = {
  'fr-fr': ['1AN30-4', 'TSA3-22', 'TCA7-22'],
  'fr-ch': [''],
}

type ExpTarget = {
  exposant: -1 | 0 | 1
  tex: string
}

const ciblesExponentielles: ExpTarget[] = [
  { exposant: 0, tex: '1' },
  { exposant: 1, tex: '\\mathrm{e}' },
  { exposant: -1, tex: '\\dfrac{1}{\\mathrm{e}}' },
]

function resolutionAffine(a: number, b: number, cible = 0): FractionEtendue {
  return new FractionEtendue(cible - b, a).simplifie()
}

function ajouteSolution(
  solutions: FractionEtendue[],
  solution: FractionEtendue,
): void {
  if (!solutions.some((s) => s.isEqual(solution))) {
    solutions.push(solution)
  }
}

function ensembleSolutions(solutions: FractionEtendue[]): string {
  if (solutions.length === 0) return '\\emptyset'
  return `\\left\\{${solutions.map((s) => s.texFractionSimplifiee).join(';')}\\right\\}`
}

export default class EquationsProduitNulExponentielles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.consigne = 'Résoudre, dans $\\mathbb{R}$, les équations suivantes.'

    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Résoudre, dans $\\mathbb{R}$, les équations suivantes.'
        : "Résoudre, dans $\\mathbb{R}$, l'équation suivante."

    const listeTypeQuestions = combinaisonListes(
      [
        'affineEtImpossible',
        'affineEtExponentielle',
        'deuxExponentielles',
        'exponentielleEtImpossible',
        'aucuneSolution',
      ],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(-8, 8, 0)
      const b = randint(-6, 6)
      const c = randint(-8, 8, 0)
      const d = randint(-6, 6)
      const n = randint(1, 5)
      const m = randint(1, 5)
      const cible1 = choice(ciblesExponentielles)
      const cible2 = choice(ciblesExponentielles)
      const expression1 = reduireAxPlusB(a, b)
      const expression2 = reduireAxPlusB(c, d)
      const facteurImpossible1 = `\\mathrm{e}^{${expression1}}+${n}`
      const facteurImpossible2 = `\\mathrm{e}^{${expression2}}+${m}`
      const facteurExp1 = `\\mathrm{e}^{${expression1}}-${cible1.tex}`
      const facteurExp2 = `\\mathrm{e}^{${expression2}}-${cible2.tex}`
      const facteurExp2AvecCible1 = `\\mathrm{e}^{${expression2}}-${cible1.tex}`
      const solutions: FractionEtendue[] = []
      let texte = ''
      let texteCorr = `Un produit est nul si et seulement si au moins un de ses facteurs est nul.<br><br>`

      switch (listeTypeQuestions[i]) {
        case 'affineEtImpossible': {
          const solution = resolutionAffine(a, b)
          ajouteSolution(solutions, solution)
          texte = `$(${expression1})(${facteurImpossible2})=0$`
          texteCorr += `$\\begin{aligned}
          ${expression1}=0&\\quad\\text{ou}\\quad ${facteurImpossible2}=0\\\\
          ${rienSi1(a)}x=${-b}&\\quad\\text{ou}\\quad \\mathrm{e}^{${expression2}}=${-m}\\\\
          x=${solution.texFractionSimplifiee}&\\quad\\text{ou}\\quad \\text{impossible car }\\mathrm{e}^{${expression2}}>0 \\text{ pour tout réel }  x.\\\\
          \\end{aligned}$`
          break
        }

        case 'affineEtExponentielle': {
          const solutionAffine = resolutionAffine(a, b)
          const solutionExp = resolutionAffine(c, d, cible1.exposant)
          ajouteSolution(solutions, solutionAffine)
          ajouteSolution(solutions, solutionExp)
          texte = `$(${expression1})(${facteurExp2AvecCible1})=0$`
          texteCorr += `$\\begin{aligned}
          ${expression1}=0&\\quad\\text{ou}\\quad \\mathrm{e}^{${expression2}}=${cible1.tex}\\\\
          ${rienSi1(a)}x=${-b}&\\quad\\text{ou}\\quad \\mathrm{e}^{${expression2}}=\\mathrm{e}^{${cible1.exposant}}\\\\
          x=${solutionAffine.texFractionSimplifiee}&\\quad\\text{ou}\\quad ${expression2}=${cible1.exposant}\\\\
          &\\quad\\text{ou}\\quad x=${solutionExp.texFractionSimplifiee}
          \\end{aligned}$`
          break
        }

        case 'deuxExponentielles': {
          const solution1 = resolutionAffine(a, b, cible1.exposant)
          const solution2 = resolutionAffine(c, d, cible2.exposant)
          ajouteSolution(solutions, solution1)
          ajouteSolution(solutions, solution2)
          texte = `$(${facteurExp1})(${facteurExp2})=0$`
          texteCorr += `$\\begin{aligned}
          \\mathrm{e}^{${expression1}}=${cible1.tex}&\\quad\\text{ou}\\quad \\mathrm{e}^{${expression2}}=${cible2.tex}\\\\
          \\mathrm{e}^{${expression1}}=\\mathrm{e}^{${cible1.exposant}}&\\quad\\text{ou}\\quad \\mathrm{e}^{${expression2}}=\\mathrm{e}^{${cible2.exposant}}\\\\
          ${expression1}=${cible1.exposant}&\\quad\\text{ou}\\quad ${expression2}=${cible2.exposant}\\\\
          x=${solution1.texFractionSimplifiee}&\\quad\\text{ou}\\quad x=${solution2.texFractionSimplifiee}
          \\end{aligned}$`
          break
        }

        case 'exponentielleEtImpossible': {
          const solution = resolutionAffine(a, b, cible1.exposant)
          ajouteSolution(solutions, solution)
          texte = `$(${facteurExp1})(${facteurImpossible2})=0$`
          texteCorr += `$\\begin{aligned}
          \\mathrm{e}^{${expression1}}=${cible1.tex}&\\quad\\text{ou}\\quad ${facteurImpossible2}=0\\\\
          \\mathrm{e}^{${expression1}}=\\mathrm{e}^{${cible1.exposant}}&\\quad\\text{ou}\\quad \\mathrm{e}^{${expression2}}=${-m}\\\\
          ${expression1}=${cible1.exposant}&\\quad\\text{ou}\\quad \\text{impossible car }\\mathrm{e}^{${expression2}}>0 \\text{ pour tout réel }  x.\\\\
          x=${solution.texFractionSimplifiee}&
          \\end{aligned}$`
          break
        }

        case 'aucuneSolution':
        default:
          texte = `$(${facteurImpossible1})(${facteurImpossible2})=0$`
          texteCorr += `$\\begin{aligned}
          ${facteurImpossible1}=0&\\quad\\text{ou}\\quad ${facteurImpossible2}=0\\\\
          \\mathrm{e}^{${expression1}}=${-n}&\\quad\\text{ou}\\quad \\mathrm{e}^{${expression2}}=${-m}
          \\end{aligned}$<br>
          Une exponentielle est toujours strictement positive, il n'y a donc pas de solution.`
          break
      }

      const value = ensembleSolutions(solutions)
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFonctionsTerminalesEnsemble,
        { texteAvant: '<br>$S=$' },
      )
      texteCorr += `<br><br>Donc $S=${miseEnEvidence(value)}$.`

      handleAnswers(this, i, {
        reponse: { value, options: { ensembleDeNombres: true } },
      })

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
