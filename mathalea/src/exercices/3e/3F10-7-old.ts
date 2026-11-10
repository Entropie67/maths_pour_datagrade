import {
  addTraceurDeCourbe,
  type TraceurDeCourbeOptions,
} from '../../lib/customElements/TraceurDeCourbe'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Représenter des fonctions en remplissant un tableau de valeurs'
export const interactifReady = true
export const dateDePublication = '10/09/2026'
export const uuid = 'd4c81'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

type Fraction = {
  numerator: number
  denominator: number
}

type FunctionData = {
  expression: string
  pgfplotsExpression: string
  target: (x: number) => number
  key: string
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b)
}

function randomFraction(): Fraction {
  const denominator = randint(2, 5)
  let numerator = randint(-7, 7, 0)
  while (pgcd(numerator, denominator) !== 1) {
    numerator = randint(-7, 7, 0)
  }
  return { numerator, denominator }
}

function fractionLatex(fraction: Fraction): string {
  const sign = fraction.numerator < 0 ? '-' : ''
  return `${sign}\\dfrac{${Math.abs(fraction.numerator)}}{${fraction.denominator}}`
}

function signedFractionLatex(fraction: Fraction): string {
  const sign = fraction.numerator < 0 ? '-' : '+'
  return `${sign}\\dfrac{${Math.abs(fraction.numerator)}}{${fraction.denominator}}`
}

function createFunction(type: number): FunctionData {
  if (type === 1) {
    const a = randint(-7, 7, 0)
    return {
      expression: `${rienSi1(a)}x`,
      pgfplotsExpression: `${a}*x`,
      target: (x) => a * x,
      key: `${a}`,
    }
  }

  if (type === 2) {
    const a = randint(-6, 6, 0)
    const b = randint(-8, 8, 0)
    return {
      expression: `${rienSi1(a)}x${ecritureAlgebrique(b)}`,
      pgfplotsExpression: `${a}*x+(${b})`,
      target: (x) => a * x + b,
      key: `${a};${b}`,
    }
  }

  if (type === 3) {
    const a = randomFraction()
    return {
      expression: `${fractionLatex(a)}x`,
      pgfplotsExpression: `(${a.numerator}/${a.denominator})*x`,
      target: (x) => (a.numerator * x) / a.denominator,
      key: `${a.numerator}/${a.denominator}`,
    }
  }

  if (type === 4) {
    const a = randomFraction()
    const b = randint(-8, 8, 0)
    return {
      expression: `${fractionLatex(a)}x${ecritureAlgebrique(b)}`,
      pgfplotsExpression: `(${a.numerator}/${a.denominator})*x+(${b})`,
      target: (x) => (a.numerator * x) / a.denominator + b,
      key: `${a.numerator}/${a.denominator};${b}`,
    }
  }

  if (type === 5) {
    const a = randomFraction()
    const b = randomFraction()
    return {
      expression: `${fractionLatex(a)}x${signedFractionLatex(b)}`,
      pgfplotsExpression: `(${a.numerator}/${a.denominator})*x+(${b.numerator}/${b.denominator})`,
      target: (x) =>
        (a.numerator * x) / a.denominator + b.numerator / b.denominator,
      key: `${a.numerator}/${a.denominator};${b.numerator}/${b.denominator}`,
    }
  }

  if (type === 6) {
    const a = randint(-5, 5, 0)
    return {
      expression: `${rienSi1(a)}x^2`,
      pgfplotsExpression: `${a}*x^2`,
      target: (x) => a * x ** 2,
      key: `${a}`,
    }
  }

  const a = randint(-6, 6, 0)
  const b = randint(-6, 6, [0, a])
  return {
    expression: `(x${ecritureAlgebrique(a)})(x${ecritureAlgebrique(b)})`,
    pgfplotsExpression: `(x+(${a}))*(x+(${b}))`,
    target: (x) => (x + a) * (x + b),
    key: `${a};${b}`,
  }
}

/**
 * Représenter graphiquement une fonction en choisissant et calculant ses images.
 *
 * @author Jean-Claude Lhote
 */
export default class RepresenterFonctionsAvecTableau extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.consigne =
      'Choisir des valeurs adaptées, compléter chaque tableau de valeurs, puis construire la représentation graphique.'
    this.sup = '8'
    this.besoinFormulaireTexte = [
      'Types de fonctions (nombres séparés par des tirets)',
      '1 : Fonction linéaire à coefficient entier relatif\n2 : Fonction affine à coefficients entiers relatifs\n3 : Fonction linéaire à coefficient rationnel\n4 : Fonction affine avec un coefficient directeur rationnel et une ordonnée à l’origine entière relative\n5 : Fonction affine à coefficients rationnels\n6 : Fonction de la forme ax²\n7 : Fonction de la forme (x+a)(x+b)\n8 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Tracer la ligne brisée', true]
  }

  nouvelleVersion(): void {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 8,
      defaut: 8,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const letters = ['f', 'g', 'h', 'k', 'p', 'q']

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const functionData = createFunction(type)
      const letter = letters[i % letters.length]
      const options: TraceurDeCourbeOptions = {
        rowLabels: ['x', `${letter}(x)`],
        columns: 6,
        xMin: -5,
        xMax: 5,
        step: 0.05,
        epsilon: 0.05,
        maxRelativeAreaError: type >= 6 ? 0.14 : 0.08,
        target: functionData.target,
        pgfplotsExpression: functionData.pgfplotsExpression,
        interactivityOn: this.interactif,
        joinPoints: Boolean(this.sup2),
      }
      const definition = `${letter}(x)=${functionData.expression}`
      const texte = `Représenter la fonction $${letter}$ définie par $${definition}$ pour des valeurs de $x$ comprises entre $-5$ et $5$.<br><br>${addTraceurDeCourbe(this, i, options)}`
      const texteCorr = `La représentation attendue est la courbe de la fonction définie par $${definition}$.<br><br>$${miseEnEvidence(definition)}$<br><br>${addTraceurDeCourbe(
        this,
        i,
        {
          ...options,
          id: `traceur-de-courbe-correctionEx${this.numeroExercice}Q${i}`,
          interactivityOn: false,
          showExpected: true,
          animateCorrection: true,
          functionLabel: `${letter}(x)`,
          calculationExpression: functionData.expression,
        },
      )}`

      if (this.questionJamaisPosee(i, type, functionData.key)) {
        handleAnswers(
          this,
          i,
          { reponse: { value: functionData.target } },
          { formatInteractif: 'traceur-de-courbe' },
        )
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
