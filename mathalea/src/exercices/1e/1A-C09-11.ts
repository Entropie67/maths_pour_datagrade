import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { isEqual, noFraction, seq } from '../../lib/interactif/checks'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Factoriser une expression avec un facteur commun'
export const dateDePublication = '25/08/2026'
export const dateDeModifImportante = '03/10/2026'

export const uuid = '18d0d'

export const refs = {
  'fr-fr': ['1A-C09-11', '2A-C2-8'],
  'fr-ch': ['1mQCM-16'],
}

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Factoriser une expression de la forme (ax+b)^2-(ax+b)(cx+d).
 * @author Stéphane Guyon
 */
export default class FactoriserFacteurCommun extends ExerciceSimple {
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
    let c: number
    let d: number
    let facteurCommun: string
    let secondFacteur: string
    let differenceCorrecte: string
    let bonneReponse: string
    let distracteurs: string[]
    let compteur = 0
    do {
      a = randint(-6, 6, 0)
      b = randint(-9, 9, 0)
      c = randint(-6, 6, [0, a])
      d = randint(-9, 9, [0, b, -b])

      facteurCommun = reduireAxPlusB(a, b)
      secondFacteur = reduireAxPlusB(c, d)
      differenceCorrecte = reduireAxPlusB(a - c, b - d)
      const differenceAvecErreurImposee = reduireAxPlusB(a - c, b + d)

      bonneReponse = `\\left(${facteurCommun}\\right)\\left(${differenceCorrecte}\\right)`
      // Ce distracteur doit toujours être proposé : le signe « -d » devient « +d ».
      const distracteurImpose = `\\left(${facteurCommun}\\right)\\left(${differenceAvecErreurImposee}\\right)`

      const expressionDeveloppee = new Polynome({
        rand: false,
        coeffs: [b * b - b * d, 2 * a * b - a * d - b * c, a * a - a * c],
      }).toLatex()

      const autresDistracteurs = shuffle([
        // Erreur de signe sur le coefficient de x dans la différence.
        `\\left(${facteurCommun}\\right)\\left(${reduireAxPlusB(a + c, b - d)}\\right)`,
        // Deux erreurs de signe dans la différence.
        `\\left(${facteurCommun}\\right)\\left(${reduireAxPlusB(a + c, b + d)}\\right)`,
        // Le carré du facteur commun est conservé au lieu d'être mis en facteur.
        `\\left(${facteurCommun}\\right)^2-\\left(${secondFacteur}\\right)`,
        // L'expression est développée au lieu d'être factorisée.
        expressionDeveloppee,
        // Le mauvais facteur est mis en facteur.
        `\\left(${secondFacteur}\\right)\\left(${differenceCorrecte}\\right)`,
      ]).slice(0, 2)
      distracteurs = [distracteurImpose, ...autresDistracteurs]
      compteur++
      // On s'assure d'avoir 4 propositions différentes, sinon on retire de nouvelles valeurs
    } while (
      compteur < 100 &&
      new Set([bonneReponse, ...distracteurs]).size < 4
    )

    const expressionInitiale = `$\\left(${facteurCommun}\\right)^2-\\left(${facteurCommun}\\right)\\left(${secondFacteur}\\right)$`

    this.correction = `On reconnaît le facteur commun $\\left(${facteurCommun}\\right)$.<br>
      $\\begin{aligned}
      \\left(${facteurCommun}\\right)^2-\\left(${facteurCommun}\\right)\\left(${secondFacteur}\\right)
      &=\\left(${facteurCommun}\\right)\\left(${facteurCommun}\\right)-\\left(${facteurCommun}\\right)\\left(${secondFacteur}\\right)\\\\
      &=\\left(${facteurCommun}\\right)\\left[\\left(${facteurCommun}\\right)-\\left(${secondFacteur}\\right)\\right]\\\\
      &=\\left(${facteurCommun}\\right)\\left[${facteurCommun}${ecritureAlgebriqueSauf1(-c)}x${ecritureAlgebrique(-d)}\\right]\\\\
      &=\\left(${facteurCommun}\\right)\\left(${differenceCorrecte}\\right).
      \\end{aligned}$<br>`
    this.correction += `Une forme factorisée de ${expressionInitiale} est donc $${miseEnEvidence(bonneReponse)}$.`

    if (this.versionQcm) {
      this.question = `Parmi ces $4$ expressions, quelle expression est une forme factorisée de ${expressionInitiale} ?`
      this.reponse = `$${bonneReponse}$`
      this.distracteurs = distracteurs.map((distracteur) => `$${distracteur}$`)
    } else {
      this.question = `Factoriser ${expressionInitiale} en un produit de deux facteurs du premier degré.`
      this.optionsChampTexte = {
        texteAvant: `<br>$\\left(${facteurCommun}\\right)^2-\\left(${facteurCommun}\\right)\\left(${secondFacteur}\\right)=$`,
      }
      this.reponse = `(${facteurCommun})(${differenceCorrecte})`
    }
  }
}
