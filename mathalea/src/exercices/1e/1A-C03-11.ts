import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { isEqual, noFraction, seq } from '../../lib/interactif/checks'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '10/08/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '0af93'

export const refs = {
  'fr-fr': ['1A-C03-11', '2A-N3-6'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Travailler les expressions rationnelles'

// @Author Stéphane Guyon
export default class Puissances extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>', dataKeys: ['x', 'POW'] }
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut simplifier une expression rationnelle.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Repérer la grande fraction et la fraction placée au dénominateur.</li>
    <li>Transformer la division par une fraction en multiplication par son inverse.</li>
    <li>Regrouper ensuite les nombres d'un côté et les puissances de $x$ de l'autre.</li>
    <li>Effectuer le même genre de calcul avec des nombres si la variable $x$ gêne.</li>
  </ul>`
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const n = randint(2, 5)
    const p = randint(2, 5)
    const a = randint(2, 7)
    const k = randint(2, 5)
    const expression = `\\dfrac{${k * a}x^{${n}}}{\\dfrac{${a}}{x^${p}}}`

    this.correction = `On peut simplifier l'expression : <br>
              $\\begin{aligned}
       ${expression}&=${k * a}x^{${n}} \\times \\dfrac{x^${p}}{${a}}\\\\
        &=\\dfrac{${k * a}x^{${n + p}}}{${a}}\\\\
        &=${miseEnEvidence(`${k}x^{${n + p}}`)}
     \\end{aligned}$`

    if (this.versionQcm) {
      this.consigne = ''
      this.question = `Soit $x$ un réel non nul.<br>À quelle expression est égale $${expression}$ ?`
      this.reponse = `$${k}x^{${n + p}}$`
      this.distracteurs = [
        `$${k}x^{${n - p}}$`,
        `$${k * a}x^{${n - p}}$`,
        `$${k * a}x^{${n + p}}$`,
      ]
    } else {
      this.consigne = ''
      this.question = `Soit $x$ un réel non nul.<br>Simplifier cette expression pour l'écrire sans trait de fraction : $${expression}$.`
      this.compare = seq([
        noFraction({
          feedbackKo: 'Il ne doit plus rester de trait de fraction.',
        }),
        isEqual({
          comparisonOptions: {
            exclusifFactorisation: true,
            exposantsAvecAccolades: true,
          },
        }),
      ])
      this.reponse = `${k}x^{${n + p}}`
    }
  }
}
