import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { isEqual, noFraction, seq } from '../../lib/interactif/checks'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Factoriser une expression de la forme $ax^2+bx$'
export const dateDePublication = '24/08/2026'
export const dateDeModifImportante = '03/10/2026'

export const uuid = 'b8c7a'

export const refs = {
  'fr-fr': ['1A-C09-12', '2A-C2-9'],
  'fr-ch': ['11LSFA3H-6', '11LSQCMFA4-5'],
}

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Factoriser une expression de la forme ax²+bx en mettant x en facteur.
 * @author Stéphane Guyon
 */
export default class FactoriserXCommun extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    // Une fraction ferait passer une écriture comme x^2(-4+6/x)
    this.compare = seq([
      noFraction({
        feedbackKo: 'Les facteurs ne doivent pas contenir de fraction.',
      }),
      isEqual({ comparisonOptions: { unSeulFacteurLitteral: true } }),
    ])
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    let a: number
    let b: number
    let expression: string
    let facteurRestant: string
    let bonneReponse: string
    let distracteurs: string[]
    let compteur = 0
    do {
      a = randint(-7, 7, [0, 1])
      b = randint(-9, 9, [0, a, -a])

      expression = new Polynome({
        rand: false,
        coeffs: [0, b, a],
      }).toLatex()
      facteurRestant = reduireAxPlusB(a, b)
      bonneReponse = `x\\left(${facteurRestant}\\right)`

      distracteurs = shuffle([
        // Le signe du terme constant est changé lors de la mise en facteur.
        `x\\left(${reduireAxPlusB(a, -b)}\\right)`,
        // L'élève met x² en facteur alors que bx n'est divisible que par x.
        `x^2\\left(${facteurRestant}\\right)`,
        // Les coefficients a et b sont intervertis.
        `x\\left(${reduireAxPlusB(b, a)}\\right)`,
        // L'élève met ax en facteur sans diviser b par a.
        `\\left(${reduireAxPlusB(a, 0)}\\right)\\left(${reduireAxPlusB(1, b)}\\right)`,
        // La mise en facteur n'est effectuée que sur le premier terme.
        `x\\left(${reduireAxPlusB(a, 0)}\\right)${ecritureAlgebrique(b)}`,
        // Le facteur commun x est oublié dans le résultat.
        `\\left(${facteurRestant}\\right)`,
        // L'expression est laissée sous sa forme développée.
        expression,
      ]).slice(0, 3)
      compteur++
      // On s'assure d'avoir 4 propositions différentes, sinon on retire de nouvelles valeurs
    } while (
      compteur < 100 &&
      new Set([bonneReponse, ...distracteurs]).size < 4
    )

    this.correction = `Les deux termes de $${expression}$ contiennent le facteur commun $x$.<br>
      $\\begin{aligned}
      ${expression}
      &=x\\times\\left(${reduireAxPlusB(a, 0)}\\right)+x\\times ${ecritureParentheseSiNegatif(b)}\\\\
      &=x\\left(${facteurRestant}\\right).
      \\end{aligned}$<br>
      Une forme factorisée de $${expression}$ est donc $${miseEnEvidence(bonneReponse)}$.`

    if (this.versionQcm) {
      this.question = `Parmi ces $4$ expressions, quelle expression est une forme factorisée de $${expression}$ ?`
      this.reponse = `$${bonneReponse}$`
      this.distracteurs = distracteurs.map((distracteur) => `$${distracteur}$`)
    } else {
      this.question = `Factoriser $${expression}$ en un produit de deux facteurs du premier degré.`
      this.optionsChampTexte = { texteAvant: `<br>$${expression}=$` }
      this.reponse = `x(${facteurRestant})`
    }
  }
}
