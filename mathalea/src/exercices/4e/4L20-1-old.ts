// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid a7f2d continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { addMathaleaSolveur } from '../../lib/customElements/MathaleaSolveurElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre une équation pas à pas'
export const interactifReady = true
export const dateDePublication = '29/09/2026'
export const uuid = 'a7f2d'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

type EquationData = {
  equation: string
  solution: number
  correctionSteps: string[]
  uniquenessKey: string
}

/**
 * Modèle minimal d'intégration de MathaleaSolveurElement.
 * Les quatre formes proposées sont reprises de 4L20, avec des solutions
 * entières afin que l'exercice reste centré sur les étapes de résolution.
 * @author Jean-Claude Lhote
 */
export default class ResoudreEquationPasAPasOld extends Exercice {
  constructor() {
    super()
    this.consigne = 'Résoudre les équations suivantes pas à pas.'
    this.nbQuestions = 4
    this.spacing = 2
  }

  nouvelleVersion(): void {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const data = generateEquation()
      if (!this.questionJamaisPosee(i, data.uniquenessKey)) continue

      const expected = `x=${data.solution}`
      this.listeQuestions[i] = addMathaleaSolveur(this, i, {
        initial: data.equation,
        kind: 'equation',
        mode: this.interactif ? 'evaluation' : 'entrainement',
      })

      this.listeCorrections[i] =
        `$\\begin{aligned}${data.correctionSteps.map(alignEquation).join('\\\\[0.4em]')}\\end{aligned}$<br>` +
        `La solution de l'équation est $${miseEnEvidence(expected)}$.`

      handleAnswers(
        this,
        i,
        { reponse: { value: expected } },
        { formatInteractif: 'mathalea-solveur' },
      )
      i++
    }
    listeQuestionsToContenu(this)
  }
}

function generateEquation(): EquationData {
  const type = choice(['x+b=c', 'ax=b', 'ax+b=c', 'ax+b=cx+d'])
  const solution = randint(-9, 9, [0])

  switch (type) {
    case 'x+b=c': {
      const b = randint(-12, 12, [0])
      const c = solution + b
      return {
        equation: `x${ecritureAlgebrique(b)}=${c}`,
        solution,
        correctionSteps: [
          `x${ecritureAlgebrique(b)}=${c}`,
          `x=${c}${ecritureAlgebrique(-b)}`,
          `x=${solution}`,
        ],
        uniquenessKey: `${type}-${b}-${c}`,
      }
    }
    case 'ax=b': {
      const a = randint(-9, 9, [-1, 0, 1])
      const b = a * solution
      return {
        equation: `${a}x=${b}`,
        solution,
        correctionSteps: [
          `${a}x=${b}`,
          `x=\\dfrac{${b}}{${a}}`,
          `x=${solution}`,
        ],
        uniquenessKey: `${type}-${a}-${b}`,
      }
    }
    case 'ax+b=c': {
      const a = randint(-9, 9, [-1, 0, 1])
      const b = randint(-12, 12, [0])
      const c = a * solution + b
      return {
        equation: `${a}x${ecritureAlgebrique(b)}=${c}`,
        solution,
        correctionSteps: [
          `${a}x${ecritureAlgebrique(b)}=${c}`,
          `${a}x=${c}${ecritureAlgebrique(-b)}`,
          `x=\\dfrac{${c - b}}{${a}}`,
          `x=${solution}`,
        ],
        uniquenessKey: `${type}-${a}-${b}-${c}`,
      }
    }
    case 'ax+b=cx+d':
    default: {
      const c = randint(-6, 6, [0])
      const a = c + randint(2, 7) * choice([-1, 1])
      const b = randint(-12, 12, [0])
      const d = (a - c) * solution + b
      return {
        equation: `${rienSi1(a)}x${ecritureAlgebrique(b)}=${rienSi1(c)}x${ecritureAlgebrique(d)}`,
        solution,
        correctionSteps: [
          `${rienSi1(a)}x${ecritureAlgebrique(b)}=${rienSi1(c)}x${ecritureAlgebrique(d)}`,
          `${a - c}x${ecritureAlgebrique(b)}=${d}`,
          `${a - c}x=${d}${ecritureAlgebrique(-b)}`,
          `x=\\dfrac{${d - b}}{${a - c}}`,
          `x=${solution}`,
        ],
        uniquenessKey: `${type}-${a}-${b}-${c}-${d}`,
      }
    }
  }
}

function alignEquation(equation: string): string {
  return equation.replace('=', '&=')
}
