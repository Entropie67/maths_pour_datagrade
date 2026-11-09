import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  'Utiliser les priorités opératoires avec des fractions de même dénominateur'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '22/10/2026'
export const uuid = '530cc'
export const refs = {
  'fr-fr': ['1A-C02-6'],
  'fr-ch': ['10LSNO3C-6', '11CTNO2B-6', '11LCNO2B-6'],
}

/**
 * Calculer `a/d ± c/d × k` : la multiplication est prioritaire sur l'addition et la soustraction.
 * Dans un cas sur deux, k est un multiple de d (le produit est alors entier).
 * @author Stéphane Guyon
 */

// Fractions irréductibles simples [numérateur, dénominateur]
const fractionsSimples: [number, number][] = [
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
  [7, 5],
  [1, 6],
  [5, 6],
  [7, 6],
]

export default class SommeFractionsEtProduit extends ExerciceSimple {
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
    Dans un calcul, la multiplication est prioritaire sur l'addition et la soustraction.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Calculer d'abord le produit de la fraction par l'entier.</li>
    <li>Additionner ou soustraire ensuite les deux fractions de même dénominateur.</li>
  </ul>`
  }

  nouvelleVersion() {
    const d = this.quotaChoice('denominateur', [3, 4, 5, 6])
    const multiple = this.quotaChoice('multiple', [true, false])
    const signe = this.quotaChoice('signe', ['+', '-'])
    const s = signe === '+' ? 1 : -1
    // a/d inférieure à 1, c/d éventuellement supérieure à 1
    const a = choice(
      fractionsSimples.filter(([n, den]) => den === d && n < d),
    )[0]
    const c = choice(fractionsSimples.filter(([, den]) => den === d))[0]
    // k non multiple de d : on évite un résultat entier
    let k = d * randint(1, 2)
    if (!multiple) {
      do {
        k = randint(2, 9)
      } while (k % d === 0 || (a + s * c * k) % d === 0)
    }
    const dfrac = (num: number | string, den: number) =>
      `\\dfrac{${num}}{${den}}`
    const numerateur = a + s * c * k
    const resultat = new FractionEtendue(numerateur, d).simplifie()
    const enonce = `${dfrac(a, d)}${signe}${dfrac(c, d)}\\times ${k}`
    const etapes: string[] = []
    if (multiple) {
      etapes.push(`${dfrac(a, d)}${signe}${(c * k) / d}`)
    }
    etapes.push(`${dfrac(a, d)}${signe}${dfrac(c * k, d)}`)
    etapes.push(dfrac(`${a}${signe}${c * k}`, d))
    const brut =
      numerateur < 0 ? `-${dfrac(-numerateur, d)}` : dfrac(numerateur, d)
    etapes.push(
      brut === resultat.texFSD
        ? miseEnEvidence(brut)
        : `${brut}=${miseEnEvidence(resultat.texFSD)}`,
    )
    const lignes = etapes.map((e, n) =>
      n === 0 ? `${enonce}&=${e}` : `&=${e}`,
    )

    this.question = `$${enonce}$`
    this.correction = `La multiplication est prioritaire sur ${signe === '+' ? "l'addition" : 'la soustraction'}.<br>
$\\begin{aligned}
${lignes.join('\\\\\n')}
\\end{aligned}$`
    this.reponse = resultat
  }
}
