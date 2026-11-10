import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre = "Calculer l'intégrale d'un polynôme"
export const interactifReady = true

export const dateDePublication = '05/04/2026'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

 *
*/
export const uuid = '0f7ab'

export const refs = {
  'fr-fr': ['TSA8-21', 'TCA6-12'],
  'fr-ch': [],
}
export default class IntegralePolynome extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierFonctionsTerminales
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = randint(-5, 5, 0)
    const b = randint(-5, 5, 0)
    const c = randint(-5, 5, 0)
    const d = randint(-5, 5, 0)
    const borneinf = randint(-2, -1)
    const bornesup = randint(borneinf + 1, borneinf + 2, 0)

    const poly3 = new Polynome({ coeffs: [d, c, b, a] })
    const derivee3 = poly3.derivee()

    const test = -poly3.image(borneinf) + d
    const resultat = poly3.image(bornesup) - poly3.image(borneinf)
    this.question = `Calculer $I=\\displaystyle\\int_{${borneinf}}^{${bornesup}} \\left( ${derivee3.toLatex()} \\right)\\mathrm{d}x$.`

    if (this.interactif) {
      this.question += '<br>$I=$ '
    }
    this.correction = `
   $\\begin{aligned}
   I&=\\displaystyle\\int_{${borneinf}}^{${bornesup}} \\left( ${derivee3.toLatex()} \\right)\\mathrm{d}x\\\\
   &=\\displaystyle\\int_{${borneinf}}^{${bornesup}} \\left(${a}\\times 3x^2 ${ecritureAlgebrique(b)}\\times 2 x${ecritureAlgebrique(c)} \\right)\\mathrm{d}x\\\\
     &=\\left[${a}\\times x^3 ${ecritureAlgebrique(b)}\\times x^2${ecritureAlgebrique(c)} x\\right]_{${borneinf}}^{${bornesup}}\\\\
   &=\\left(${a}\\times ${ecritureParentheseSiNegatif(bornesup)}^3 ${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(bornesup)}^2${ecritureAlgebrique(c)} \\times${ecritureParentheseSiNegatif(bornesup)}\\right)-\\left(${a}\\times ${ecritureParentheseSiNegatif(borneinf)}^3 ${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(borneinf)}^2${ecritureAlgebrique(c)} \\times${ecritureParentheseSiNegatif(borneinf)}\\right) \\\\
     &=\\left(${a * bornesup ** 3} ${ecritureAlgebrique(b * bornesup ** 2)}${ecritureAlgebrique(c * bornesup)} \\right)-\\left(${a * borneinf ** 3} ${ecritureAlgebrique(b * borneinf ** 2)}${ecritureAlgebrique(c * borneinf)} \\right) \\\\
    \\end{aligned}$<br>`
    if (test === 0) {
      this.correction += `
    $\\begin{aligned}
    \\phantom{I}&=${poly3.image(bornesup) - d} -0\\\\
    &=${resultat}
  \\end{aligned}$<br> `
    } else {
      this.correction += `
   $\\begin{aligned} \\phantom{I}&=${poly3.image(bornesup) - d} ${ecritureAlgebrique(test)}\\\\
    &=${resultat}
  \\end{aligned}$<br>
`
    }
    this.correction += `On peut conclure que $I=\\displaystyle\\int_{${borneinf}}^{${bornesup}} \\left( ${derivee3.toLatex()} \\right)\\mathrm{d}x=${miseEnEvidence(`${resultat}`)}$.`

    this.reponse = resultat
  }
}
