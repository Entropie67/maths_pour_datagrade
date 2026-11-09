import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  'Calculer le produit d’une somme ou d’une différence par une fraction'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '25/10/2026'
export const uuid = '99cc7'
export const refs = {
  'fr-fr': ['1A-C02-9'],
  'fr-ch': ['10LSNO3C-8', '11CTNO2B-8', '11LCNO2B-8'],
}

/**
 * Calculer `(n ± p/q) × q/s` : on calcule d'abord la parenthèse,
 * puis on simplifie par q dans le produit.
 * @author Gilles Mora
 */

// Fractions irréductibles simples [numérateur, dénominateur] dans la parenthèse
const fractionsSimples: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [1, 6],
  [5, 6],
  [1, 7],
  [2, 7],
  [3, 7],
]

export default class ProduitParentheseFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.consigne = "Écrire sous la forme d'une fraction irréductible."
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.optionsChampTexte = { texteAvant: '$=$ ' }
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Les calculs entre parenthèses sont prioritaires.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Écrire l'entier sous la forme d'une fraction de même dénominateur, puis calculer la parenthèse.</li>
    <li>Multiplier ensuite les deux fractions en simplifiant avant de multiplier.</li>
  </ul>`
  }

  nouvelleVersion() {
    const [p, q] = this.quotaChoice('fraction', fractionsSimples)
    const signe = this.quotaChoice('signe', ['+', '-'])
    const n = signe === '+' ? choice([1, 2]) : choice([1, 2, 3])
    const N = signe === '+' ? n * q + p : n * q - p
    // q/s irréductible et résultat N/s non entier
    let s: number
    do {
      s = randint(2, 9)
    } while (s === q || pgcd(q, s) !== 1 || N % s === 0)

    const dfrac = (num: number | string, den: number | string) =>
      `\\dfrac{${num}}{${den}}`
    const resultat = new FractionEtendue(N, s).simplifie()
    const enonce = `\\left(${n}${signe}${dfrac(p, q)}\\right)\\times ${dfrac(q, s)}`
    const etapes = [
      `\\left(${dfrac(n * q, q)}${signe}${dfrac(p, q)}\\right)\\times ${dfrac(q, s)}`,
      `${dfrac(N, q)}\\times ${dfrac(q, s)}`,
      dfrac(`${N}\\times \\cancel{${q}}`, `\\cancel{${q}}\\times ${s}`),
    ]
    const brut = dfrac(N, s)
    etapes.push(
      brut === resultat.texFraction
        ? miseEnEvidence(brut)
        : `${brut}=${miseEnEvidence(resultat.texFraction)}`,
    )
    const lignes = etapes.map((e, i) =>
      i === 0 ? `${enonce}&=${e}` : `&=${e}`,
    )

    this.question = `$${enonce}$`
    this.correction = `On calcule d'abord la parenthèse.<br>
$\\begin{aligned}
${lignes.join('\\\\\n')}
\\end{aligned}$`
    this.reponse = resultat
  }
}
