import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Calculer le quotient de deux fractions'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '25/10/2026'
export const uuid = 'c5d2c'
export const refs = {
  'fr-fr': ['1A-C02-10'],
  'fr-ch': ['10LSNO3B-7', '11CTNO2A-7', '11LCNO2A-7'],
}

/**
 * Écrire `(a/b) / (c/d)` sous la forme d'une fraction irréductible :
 * diviser par une fraction revient à multiplier par son inverse.
 * @author Gilles Mora
 */

// Fractions irréductibles simples [numérateur, dénominateur]
const fractionsSimples: [number, number][] = [
  [1, 2],
  [3, 2],
  [1, 3],
  [2, 3],
  [4, 3],
  [1, 4],
  [3, 4],
  [5, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [1, 6],
  [5, 6],
  [2, 7],
  [3, 7],
  [4, 7],
]

export default class QuotientDeFractions extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 2
    this.consigne = "Écrire sous la forme d'une fraction irréductible."
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.optionsChampTexte = { texteAvant: '$=$ ' }
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Diviser par une fraction revient à multiplier par son inverse.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Remplacer la division par la multiplication par l'inverse de la fraction du dénominateur.</li>
    <li>Multiplier les deux fractions, puis simplifier si possible.</li>
  </ul>`
  }

  nouvelleVersion() {
    const [a, b] = this.quotaChoice('numerateur', fractionsSimples)
    let c: number
    let d: number
    // résultat non entier et deux fractions différentes
    do {
      ;[c, d] = choice(fractionsSimples)
    } while ((c === a && d === b) || (a * d) % (b * c) === 0)

    const dfrac = (num: number | string, den: number | string) =>
      `\\dfrac{${num}}{${den}}`
    const resultat = new FractionEtendue(a * d, b * c).simplifie()
    // espaces autour des fractions pour allonger la barre principale
    const enonce = dfrac(`\\;${dfrac(a, b)}\\;`, `\\;${dfrac(c, d)}\\;`)
    // inverse de 1/d : on écrit l'entier d
    const inverse = c === 1 ? `${d}` : dfrac(d, c)
    const etapes = [
      `${dfrac(a, b)}\\times ${inverse}`,
      dfrac(`${a}\\times ${d}`, c === 1 ? b : `${b}\\times ${c}`),
    ]
    const brut = dfrac(a * d, b * c)
    etapes.push(
      brut === resultat.texFraction
        ? miseEnEvidence(brut)
        : `${brut}=${miseEnEvidence(resultat.texFraction)}`,
    )
    const lignes = etapes.map((e, i) =>
      i === 0 ? `${enonce}&=${e}` : `&=${e}`,
    )

    this.question = `$${enonce}$`
    this.correction = `Diviser par $${dfrac(c, d)}$ revient à multiplier par son inverse $${inverse}$.<br>
$\\begin{aligned}
${lignes.join('\\\\\n')}
\\end{aligned}$`
    this.reponse = resultat
  }
}
