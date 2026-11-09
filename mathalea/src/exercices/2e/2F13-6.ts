import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer des images en fonction de n'
export const dateDePublication = '10/10/2026'
export const interactifReady = true
export const uuid = '3641a'
export const refs = {
  'fr-fr': ['2F13-6'],
  'fr-ch': [],
}

/** Calculer des images littérales pour préparer l'étude des suites. */
export default class ImagesEnFonctionDeN extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacing = 2
    this.spacingCorr = 2
    this.sup = 3
    this.sup2 = '1-2-3-4'
    this.besoinFormulaireTexte = [
      'Types de fonctions',
      'Nombres séparés par des tirets :\n1 : Fonction affine\n2 : Polynôme du second degré\n3 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Types d’images',
      'Nombres séparés par des tirets :\n1 : Image de n+1\n2 : Image de n+k\n3 : Image de an\n4 : Image de an+b\n5 : Mélange',
    ]
  }

  nouvelleVersion() {
    const functionTypes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: 1,
    }).map(Number)
    const quadratic = functionTypes[0] === 2
    const p = quadratic ? randint(-3, 3, 0) : 0
    const q = randint(-6, 6, 0)
    const r = randint(-9, 9, 0)
    const expression = reduirePolynomeDegre3(0, p, q, r)
    const imageTypes = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
      shuffle: false,
    }).map(Number)

    // Une seule image de n+1 est possible avec une fonction fixée.
    const otherTypes = imageTypes.filter((type) => type !== 1)
    const questionCount = otherTypes.length === 0 ? 1 : this.nbQuestions
    let nextOtherType = 0
    let hasNPlusOne = false
    for (let i = 0; i < questionCount; i++) {
      if (imageTypes[i] !== 1) continue
      if (hasNPlusOne) {
        imageTypes[i] = otherTypes[nextOtherType++ % otherTypes.length]
      } else {
        hasNPlusOne = true
      }
    }
    this.consigne = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${expression}$.<br>Pour $n\\in\\mathbb{N}$, exprimer les images suivantes en fonction de $n$ sous forme développée et réduite.`
    const usedArguments = new Set<string>()

    for (
      let i = 0, attempts = 0;
      i < questionCount && attempts < 50 * questionCount;
      attempts++
    ) {
      // Exclure les valeurs qui confondraient les quatre types proposés.
      const a =
        imageTypes[i] >= 3 ? randint(2, Math.max(4, questionCount + 1)) : 1
      const b =
        imageTypes[i] === 1
          ? 1
          : imageTypes[i] === 3
            ? 0
            : randint(
                -Math.max(5, questionCount),
                Math.max(5, questionCount),
                imageTypes[i] === 2 ? [0, 1] : [0],
              )

      const argument = reduireAxPlusB(a, b, 'n')
      if (usedArguments.has(argument)) continue
      usedArguments.add(argument)
      const answer = reduirePolynomeDegre3(
        0,
        p * a * a,
        2 * p * a * b + q * a,
        p * b * b + q * b + r,
        'n',
      )
      const brackets = `\\left(${argument}\\right)`
      const linearArgument = b === 0 ? argument : brackets
      const quadraticCoefficient = p === 1 ? '' : `${p}\\times `
      const substitution =
        `${quadratic ? `${quadraticCoefficient}${brackets}^2+` : ''}${q}\\times ${linearArgument}${ecritureAlgebrique(r)}`.replace(
          '+-',
          '-',
        )
      let correction = `Remplacer $x$ par $${argument}$ dans l'expression de $f$, puis développer et réduire.<br>`
      correction += `$\\begin{aligned}f(${argument})&=${substitution}\\\\`
      if (quadratic) {
        const square = reduirePolynomeDegre3(0, a * a, 2 * a * b, b * b, 'n')
        const linearPart = reduireAxPlusB(q * a, q * b, 'n')
        const squareFactor =
          b === 0 || p === 1 ? square : `\\left(${square}\\right)`
        correction += `&=${quadraticCoefficient}${squareFactor}${q > 0 ? '+' : ''}${linearPart}${ecritureAlgebrique(r)}\\\\`
      } else if (b !== 0) {
        correction += `&=${reduireAxPlusB(q * a, q * b, 'n')}${ecritureAlgebrique(r)}\\\\`
      }
      correction += `&=${miseEnEvidence(answer)}\\end{aligned}$`

      let question = `$f(${argument})$`
      if (this.interactif) {
        question = ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecVariable,
          {
            texteAvant: `$f(${argument})=$`,
          },
        )
      }
      handleAnswers(this, i, {
        reponse: {
          value: answer,
          options: { expressionsForcementReduites: true },
        },
      })
      this.listeQuestions[i] = question
      this.listeCorrections[i] = correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
