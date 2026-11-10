import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Déterminer le coefficient directeur d'une droite à partir de son équation réduite"
export const interactifReady = true

export const dateDePublication = '30/09/2021'
export const dateModiImportante = '25/07/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication sptembre 2021
*/
export const dateDeModifImportante = '30/10/2026'
export const uuid = '1f62f'

export const refs = {
  'fr-fr': ['can2G30-01'],
  'fr-ch': ['1mQCM-10'],
}
export default class CoeffDirecteurDroite extends ExerciceSimple {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  // Textes communs factorisés
  questionReprise(equation: string) {
    return `On considère la droite d'équation $${equation}$. <br>
     ${this.versionQcm ? 'Son coefficient directeur est :' : 'Donner son coefficient directeur.<br>'} `
  }

  correctionReprise() {
    return `On reconnaît l'équation réduite d'une droite de la forme $y=mx+p$ où $m$ est son coefficient directeur.<br>
      Ici, `
  }

  // En QCM, la réponse attendue est « m=… » : la mise en évidence porte sur l'ensemble
  correctionCoefficient(valeur: string) {
    if (this.versionQcm) {
      return `$${miseEnEvidence(`m=${valeur}`)}$`
    }
    return `$m=${miseEnEvidence(valeur)}$`
  }

  nouvelleVersion() {
    switch (
      this.quotaChoice('type', [1, 2, 3, 4, 4, 5, 5, 6, 6]) //
    ) {
      case 1:
        {
          const a = 0
          const b = randint(-5, 5)

          this.question = this.questionReprise(`y=${b}`)
          this.correction =
            this.correctionReprise() +
            `${this.correctionCoefficient(`${a}`)} et $p=${b}$.`
          this.reponse = this.versionQcm ? `$m=${a}$` : a
          this.distracteurs = [
            '$m=1$',
            '$m=-1$',
            `${b === 0 || b === 1 || b === -1 ? '$m=\\emptyset$' : `$m=${b}$`}`,
          ]
        }
        break

      case 2:
        {
          const a = randint(-10, 10, 0)
          const b = 0

          this.question = this.questionReprise(`y=${rienSi1(a)}x`)
          this.correction =
            this.correctionReprise() +
            `${this.correctionCoefficient(`${a}`)} et $p=${b}$.`
          this.reponse = this.versionQcm ? `$m=${a}$` : a
          this.distracteurs = [
            '$m=0$',
            `${a === 1 || a === -1 ? '$m=\\emptyset$' : `$m=${new FractionEtendue(1, a).texFractionSimplifiee}$`}`,
            `$m=${a}x$`,
          ]
        }
        break

      case 3:
        {
          const a = randint(-10, 10, 0)
          const b = randint(-10, 10, [0, a])
          const choix = choice([true, false])
          const equation = choix
            ? `y=${reduireAxPlusB(a, b)}`
            : `y=${b}${ecritureAlgebriqueSauf1(a)}x`

          this.question = this.questionReprise(equation)
          this.correction =
            this.correctionReprise() +
            `${this.correctionCoefficient(`${a}`)} et $p=${b}$.`
          this.reponse = this.versionQcm ? `$m=${a}$` : a
          this.distracteurs = [
            `$m=${b}$`,
            `${a === 1 || a === -1 ? '$m=\\emptyset$' : `$m=${new FractionEtendue(1, a).texFractionSimplifiee}$`}`,
            `$m=${rienSi1(a)}x$`,
          ]
        }
        break

      case 4:
        {
          const a = randint(2, 10)
          const b = randint(-10, 10, [0, a])
          const equation = `y=\\dfrac{x}{${a}}${ecritureAlgebrique(b)}`

          this.question = this.questionReprise(equation)
          this.correction =
            this.correctionReprise() +
            `${this.correctionCoefficient(`\\dfrac{1}{${a}}`)} et $p=${b}$.`
          this.reponse = this.versionQcm
            ? `$m=\\dfrac{1}{${a}}$`
            : `\\dfrac{1}{${a}}`
          this.distracteurs = [`$m=${b}$`, `$m=${a}$`, `$m=${rienSi1(a)}x$`]
        }
        break

      case 5:
        {
          const a = randint(2, 10)
          const b = randint(-10, 10, [0, a])
          const equation = `y=\\dfrac{x}{${a}}${ecritureAlgebrique(b)}`
          this.question = this.questionReprise(equation)
          this.correction =
            this.correctionReprise() +
            `${this.correctionCoefficient(`\\dfrac{1}{${a}}`)} et $p=${b}$.`
          this.reponse = this.versionQcm
            ? `$m=\\dfrac{1}{${a}}$`
            : `\\dfrac{1}{${a}}`
          this.distracteurs = [`$m=${b}$`, `$m=${a}$`, `$m=\\dfrac{x}{${a}}$`]
        }
        break

      case 6:
      default:
        {
          const a = randint(-9, 9, 0)
          const b = randint(-10, 10, [0, a])
          const c = randint(2, 9, a)
          const equation = `y=\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(b)}}{${c}}`
          this.question = this.questionReprise(equation)
          this.correction =
            this.correctionReprise() +
            `${this.correctionCoefficient(`${new FractionEtendue(a, c).texFractionSimplifiee}`)} et $p=${b}$.`
          this.reponse = this.versionQcm
            ? `$m=${new FractionEtendue(a, c).texFractionSimplifiee}$`
            : `${new FractionEtendue(a, c).texFractionSimplifiee}`
          this.distracteurs = [
            `$m=${new FractionEtendue(c, a).texFractionSimplifiee}$`,
            `$m=${a}$`,
            `$m=${a < 0 ? '-' : ''}\\dfrac{${rienSi1(Math.abs(a))}x}{${c}}$`,
          ]
        }
        break
    }
    if (this.versionQcm) {
      // Secours : Confondre avec une pente nulle, une diagonale ou une expression en x.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        ['$m=0$', '$m=1$', '$m=-1$', '$m=x$', '$m=-x$'],
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
