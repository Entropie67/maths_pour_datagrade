import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer le nombre de solutions d'une équation après un test numérique"
export const dateDePublication = '16/08/2026'
export const interactifReady = true

export const uuid = '1b7c9'
export const refs = {
  'fr-fr': ['4L24'],
  'fr-ch': ['NR'],
}

type ExpressionLineaire = {
  texte: string
  coefficient: number
  constante: number
}

type TypeSolution = 'aucune' | 'une' | 'infinite'

type SituationEquation = {
  membreGauche: ExpressionLineaire
  membreDroit: ExpressionLineaire
  xTest: number
  valeurGauche: number
  valeurDroite: number
  estSolution: boolean
  typeSolution: TypeSolution
  solution?: number
}

type GenerateurSituation = () => SituationEquation

function expressionReduite(
  coefficient: number,
  constante: number,
  variable = 'x',
): string {
  if (coefficient === 0) return String(constante)
  const termeVariable = `${rienSi1(coefficient)}${variable}`
  if (constante === 0) return termeVariable
  return `${termeVariable}${ecritureAlgebrique(constante)}`
}

function expressionLineaire(
  texte: string,
  coefficient: number,
  constante: number,
): ExpressionLineaire {
  return { texte, coefficient, constante }
}

function evaluer(expression: ExpressionLineaire, x: number): number {
  return expression.coefficient * x + expression.constante
}

function fabriquerSituation(
  membreGauche: ExpressionLineaire,
  membreDroit: ExpressionLineaire,
  xTest: number,
  solution?: number,
): SituationEquation {
  const valeurGauche = evaluer(membreGauche, xTest)
  const valeurDroite = evaluer(membreDroit, xTest)
  const memeCoefficient = membreGauche.coefficient === membreDroit.coefficient
  const memeConstante = membreGauche.constante === membreDroit.constante
  const typeSolution: TypeSolution =
    memeCoefficient && memeConstante
      ? 'infinite'
      : memeCoefficient
        ? 'aucune'
        : 'une'

  return {
    membreGauche,
    membreDroit,
    xTest,
    valeurGauche,
    valeurDroite,
    estSolution: valeurGauche === valeurDroite,
    typeSolution,
    solution,
  }
}

function genererEquationUneSolution(): SituationEquation {
  const solution = randint(-4, 5)
  const coefficientGauche = randint(-5, 5, [0])
  const coefficientDroit = randint(-5, 5, [0, coefficientGauche])
  const constanteGauche = randint(-8, 8)
  const constanteDroit =
    coefficientGauche * solution + constanteGauche - coefficientDroit * solution
  const xTest = choice([solution, solution + choice([-3, -2, -1, 1, 2, 3])])
  return fabriquerSituation(
    expressionLineaire(
      expressionReduite(coefficientGauche, constanteGauche),
      coefficientGauche,
      constanteGauche,
    ),
    expressionLineaire(
      expressionReduite(coefficientDroit, constanteDroit),
      coefficientDroit,
      constanteDroit,
    ),
    xTest,
    solution,
  )
}

function genererEquationAucuneSolution(): SituationEquation {
  const coefficient = randint(-5, 5, [0])
  const constanteGauche = randint(-8, 8)
  const constanteDroit = randint(-8, 8, [constanteGauche])
  const xTest = randint(-4, 5)
  return fabriquerSituation(
    expressionLineaire(
      expressionReduite(coefficient, constanteGauche),
      coefficient,
      constanteGauche,
    ),
    expressionLineaire(
      expressionReduite(coefficient, constanteDroit),
      coefficient,
      constanteDroit,
    ),
    xTest,
  )
}

function genererEquationTousNombresSolutions(): SituationEquation {
  const coefficient = randint(-5, 5, [0])
  const constante = randint(-8, 8)
  const retrait = randint(1, 4, coefficient < 0 ? [-coefficient] : [])
  const xTest = randint(-4, 5)
  const coefficientNonReduit = coefficient + retrait
  return fabriquerSituation(
    expressionLineaire(
      expressionReduite(coefficient, constante),
      coefficient,
      constante,
    ),
    expressionLineaire(
      `${rienSi1(coefficientNonReduit)}x-${rienSi1(retrait)}x${ecritureAlgebrique(
        constante,
      )}`,
      coefficient,
      constante,
    ),
    xTest,
  )
}

const generateurs: GenerateurSituation[] = [
  genererEquationUneSolution,
  genererEquationAucuneSolution,
  genererEquationTousNombresSolutions,
]

function correctionNombreSolutions(situation: SituationEquation): string {
  const gauche = expressionReduite(
    situation.membreGauche.coefficient,
    situation.membreGauche.constante,
  )
  const droite = expressionReduite(
    situation.membreDroit.coefficient,
    situation.membreDroit.constante,
  )
  if (situation.typeSolution === 'infinite') {
    return `Les deux membres se réduisent en $${gauche}$. L'égalité est donc vraie pour tout nombre $x$.`
  }
  if (situation.typeSolution === 'aucune') {
    return `Les deux membres ont le même coefficient de $x$, mais pas le même terme constant : $${gauche}$ et $${droite}$. Il n'y a donc aucune solution.`
  }
  return `L'équation est du premier degré avec des coefficients de $x$ différents. Elle admet donc une seule solution : $x=${situation.solution}$.`
}

/**
 * @author Jean-claude Lhote
 */
export default class NombreSolutionsApresTestNumerique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = true
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Pour chaque équation, effectuer les calculs demandés, puis déterminer le nombre de solutions.'
        : "Effectuer les calculs demandés, puis déterminer le nombre de solutions de l'équation."

    const listeGenerateurs = shuffle(generateurs)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const situation = listeGenerateurs[i % listeGenerateurs.length]()
      const equation = `${situation.membreGauche.texte}=${situation.membreDroit.texte}`

      const dataTemplate = `On considère l'équation $${equation}$.
a) Pour $x=${situation.xTest}$, le membre de gauche vaut %{field0} et le membre de droite vaut %{field1}.
b) Le nombre $${situation.xTest}$ est-il solution de l'équation ? %{field2}
c) Combien cette équation admet-elle de solutions ? %{field3}`

      const dataOptions: DataOptionsMultiMathfield = {
        field0: {
          keyboard: KeyboardType.clavierDeBase,
          ldots: true,
          minWidth: 40,
        },
        field1: {
          keyboard: KeyboardType.clavierDeBase,
          ldots: true,
          minWidth: 40,
        },
        field2: {
          qcm: [
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ],
        },
        field3: {
          qcm: [
            { label: 'Aucune solution', value: 'aucune' },
            { label: 'Une seule solution', value: 'une' },
            {
              label: 'Tous les nombres sont solutions',
              value: 'infinite',
            },
          ],
          vertical: true,
        },
      }

      texte = addMultiMathfield(this, i, { dataTemplate, dataOptions })

      texteCorr = `Pour $x=${ecritureParentheseSiNegatif(
        situation.xTest,
      )}$ :<br>`
      texteCorr += `$${situation.membreGauche.texte}=${situation.valeurGauche}$ et $${situation.membreDroit.texte}=${situation.valeurDroite}$.<br>`
      texteCorr += situation.estSolution
        ? `Les deux valeurs sont égales, donc ${texteEnCouleurEtGras(
            `$${situation.xTest}$ est solution`,
          )} de l'équation.<br>`
        : `Les deux valeurs sont différentes, donc ${texteEnCouleurEtGras(
            `$${situation.xTest}$ n'est pas solution`,
          )} de l'équation.<br>`
      texteCorr += correctionNombreSolutions(situation)

      handleAnswers(
        this,
        i,
        {
          field0: { value: situation.valeurGauche },
          field1: { value: situation.valeurDroite },
          field2: { value: situation.estSolution ? 'oui' : 'non' },
          field3: { value: situation.typeSolution },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      if (this.questionJamaisPosee(i, equation, situation.xTest)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
