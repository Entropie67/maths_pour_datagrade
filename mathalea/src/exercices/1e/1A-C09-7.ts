import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '02/09/2025'
export const dateDeModifImportante = '03/10/2026'

export const uuid = '6c241'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C09-7', '2A-C2-4'],
  'fr-ch': ['1mQCM-18'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Développer une expression algébrique'
export default class Puissances extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsDeComparaison = { expressionsForcementReduites: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const a = randint(-4, 4, 0)
    const alpha = randint(-5, 5, [-1, 0, 1])
    const beta = randint(-4, 4, [0, 1])

    const expression = `${rienSi1(a)}(x${ecritureAlgebrique(-alpha)})^2${ecritureAlgebrique(beta)}`
    const constante = a * -alpha * -alpha + beta
    // Sans terme constant quand il est nul
    const constanteEcrite = constante === 0 ? '' : ecritureAlgebrique(constante)
    const bonneReponse = `${rienSi1(a)}x^2${ecritureAlgebrique(-2 * a * alpha)}x${constanteEcrite}`

    this.correction = `On développe $${expression}$. <br>
              $\\begin{aligned}
    ${expression}&=${ecritureAlgebriqueSauf1(a)}\\left(x^2 ${ecritureAlgebrique(2 * -alpha)}x${ecritureAlgebrique(-alpha * -alpha)}\\right)${ecritureAlgebrique(beta)}\\\\
    &=${rienSi1(a)}x^2 ${ecritureAlgebrique(-2 * a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha)} ${ecritureAlgebrique(beta)}\\\\
        &=${miseEnEvidence(bonneReponse)}
          \\end{aligned}$`

    if (this.versionQcm) {
      this.question = `À quelle expression est égale $${expression}$ ?`
      this.reponse = `$${bonneReponse}$`
      this.distracteurs = [
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(2 * a * alpha)}x${constanteEcrite}$`,
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(-2 * a * alpha)}x${ecritureAlgebrique(a * -alpha * -alpha - beta)}$`,
        `$${rienSi1(a)}x^2 ${ecritureAlgebrique(-a * alpha)}x${constanteEcrite}$`,
      ]
    } else {
      this.question = `Donner une expression développée et réduite de $${expression}$.`
      this.optionsChampTexte = { texteAvant: `<br>$${expression}=$` }
      this.reponse = bonneReponse
    }
  }
}
