import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const uuid = 'bb6dd'
export const refs = {
  'fr-fr': ['1A-C02-8'],
  'fr-ch': ['9R3NO4J-6', '10CTNO3A-6', '10LCNO3A-6', '10LSNO3A-6'],
}
export const interactifReady = true
export const interactifType = 'mathLive'
export const titre = 'Calculer la différence entre un entier et une fraction'
export const dateDePublication = '22/10/2026'

/**
 * Calculer `a - b/d` avec `a` entier et `b/d` une fraction irréductible simple.
 * @author Stéphane Guyon
 */

// Fractions irréductibles simples [numérateur, dénominateur]
const fractionsSimples: [number, number][] = [
  [1, 2],
  [3, 2],
  [1, 3],
  [2, 3],
  [4, 3],
  [5, 3],
  [1, 4],
  [3, 4],
  [5, 4],
  [7, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [6, 5],
  [1, 6],
  [5, 6],
]

export default class DifferenceEntierFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.consigne =
      "Calculer et donner le résultat sous la forme d'une fraction irréductible."
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.optionsChampTexte = { texteAvant: '$=$ ' }
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Pour soustraire une fraction à un entier, il faut les mettre au même dénominateur.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Écrire l'entier sous la forme d'une fraction de même dénominateur.</li>
    <li>Soustraire les numérateurs en gardant le dénominateur.</li>
  </ul>`
  }

  nouvelleVersion() {
    const [b, d] = this.quotaChoice('fraction', fractionsSimples)
    const a = randint(2, 6)
    const resultat = new FractionEtendue(a * d - b, d)
    const frac = `\\dfrac{${b}}{${d}}`

    this.question = `$${a}-${frac}$`
    this.correction = `On écrit l'entier avec le même dénominateur que la fraction :<br>
$\\begin{aligned}
${a}-${frac}&=\\dfrac{${a}\\times ${d}}{${d}}-${frac}\\\\
&=\\dfrac{${a * d}}{${d}}-${frac}\\\\
&=\\dfrac{${a * d}-${b}}{${d}}\\\\
&=${miseEnEvidence(resultat.texFraction)}
\\end{aligned}$`
    this.reponse = resultat
  }
}
