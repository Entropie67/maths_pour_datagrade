import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  'Utiliser les priorités opératoires avec des fractions de dénominateurs différents'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '22/10/2026'
export const uuid = '5d3a2'
export const refs = {
  'fr-fr': ['1A-C02-7'],
  'fr-ch': ['10LSNO3C-7', '11CTNO2B-7', '11LCNO2B-7'],
}

/**
 * Calculer `a/d ± k × b/d2` : la multiplication est prioritaire sur l'addition et la soustraction,
 * puis il faut réduire au même dénominateur (d2 est un multiple de d).
 * @author Stéphane Guyon
 */

// Fractions irréductibles simples [numérateur, dénominateur]
// Première fraction a/d
const fractionsAjoutees: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
]
// Fraction multipliée par l'entier : son dénominateur a un diviseur dans la liste ci-dessus
const fractionsMultipliees: [number, number][] = [
  [1, 4],
  [3, 4],
  [5, 4],
  [1, 6],
  [5, 6],
  [1, 8],
  [3, 8],
  [1, 9],
  [2, 9],
  [1, 10],
  [3, 10],
]

export default class SommeFractionEtProduitFraction extends ExerciceSimple {
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
    <li>Calculer d'abord le produit de l'entier par la fraction.</li>
    <li>Mettre ensuite les deux fractions au même dénominateur.</li>
    <li>Additionner ou soustraire puis simplifier si possible.</li>
  </ul>`
  }

  nouvelleVersion() {
    const [b, d2] = this.quotaChoice('fraction', fractionsMultipliees)
    const signe = this.quotaChoice('signe', ['+', '-'])
    const s = signe === '+' ? 1 : -1
    let a: number
    let d: number
    let k: number
    let numerateur: number
    // a/d : fraction simple dont le dénominateur divise strictement d2
    // k non multiple de d2 : le produit ne doit pas être entier
    do {
      ;[a, d] = choice(
        fractionsAjoutees.filter(([, den]) => den < d2 && d2 % den === 0),
      )
      k = randint(2, 5)
      numerateur = a * (d2 / d) + s * k * b
    } while (numerateur % d2 === 0 || k % d2 === 0)

    const dfrac = (num: number | string, den: number | string) =>
      `\\dfrac{${num}}{${den}}`
    const resultat = new FractionEtendue(numerateur, d2).simplifie()
    const enonce = `${dfrac(a, d)}${signe}${k}\\times ${dfrac(b, d2)}`
    // Produit : on décompose pour simplifier avant de multiplier
    const g = pgcd(k, d2)
    const k2 = k / g
    const d3 = d2 / g
    const etapes: string[] = []
    etapes.push(`${dfrac(a, d)}${signe}${dfrac(`${k}\\times ${b}`, d2)}`)
    const produit = k2 * b
    // numérateur factorisé : on n'écrit pas le facteur 1
    const numFacto =
      k2 > 1 ? `${g}\\times ${k2}\\times ${b}` : `${g}\\times ${b}`
    if (g > 1) {
      etapes.push(
        `${dfrac(a, d)}${signe}${dfrac(numFacto, `${g}\\times ${d3}`)}`,
      )
      if (k2 > 1) {
        etapes.push(`${dfrac(a, d)}${signe}${dfrac(`${k2}\\times ${b}`, d3)}`)
      }
    }
    etapes.push(`${dfrac(a, d)}${signe}${dfrac(produit, d3)}`)
    // Réduction au même dénominateur
    const D = (d * d3) / pgcd(d, d3)
    const q1 = D / d
    const q2 = D / d3
    if (D !== d || D !== d3) {
      const f1 =
        q1 > 1 ? dfrac(`${a}\\times ${q1}`, `${d}\\times ${q1}`) : dfrac(a, d)
      const f2 =
        q2 > 1
          ? dfrac(`${produit}\\times ${q2}`, `${d3}\\times ${q2}`)
          : dfrac(produit, d3)
      etapes.push(`${f1}${signe}${f2}`)
      etapes.push(`${dfrac(a * q1, D)}${signe}${dfrac(produit * q2, D)}`)
    }
    const numerateurFinal = a * q1 + s * produit * q2
    etapes.push(dfrac(`${a * q1}${signe}${produit * q2}`, D))
    const brut =
      numerateurFinal < 0
        ? `-${dfrac(-numerateurFinal, D)}`
        : dfrac(numerateurFinal, D)
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
