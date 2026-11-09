import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '23/07/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = 'e4747'

export const refs = {
  'fr-fr': ['1A-C03-1', '2A-N3-1'],
  'fr-ch': ['10LCNO4B-8', '10LSNO4B-8', '11LCNO3B-8', '11LSNO3B-8'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Transformer un quotient comportant des puissances'

/**
 * @author Gilles Mora
 */
export default class Auto1AC3a extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut chercher à faire apparaître des puissances comparables.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Regarder la base (le nombre élevé à une puissance) au numérateur et la base au dénominateur.</li>
    <li>Chercher un lien évident entre ces deux bases, utile avec les propriétés des puissances.</li>
    <li>Réécrire l'expression pour faire apparaître une même base au numérateur et au dénominateur.</li>
    <li>Simplifier ensuite avec une propriété de cours.</li>
  </ul>`
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true
    this.formatInteractif = this.versionQcm ? 'mathlive' : 'fillInTheBlank'

    const { a, n, k } = this.quotaChoice('cas', [
      // Cas simples avec base 10
      { a: [5, 2], n: 2, k: 2 }, // 10^4 / 5^2
      { a: [5, 2], n: 3, k: 2 }, // 10^5 / 5^3
      { a: [2, 5], n: 2, k: 2 }, // 10^4 / 2^2
      { a: [2, 5], n: 3, k: 2 }, // 10^5 / 2^3

      // Cas avec base 6
      { a: [2, 3], n: 2, k: 2 }, // 6^4 / 2^2
      { a: [3, 2], n: 2, k: 2 }, // 6^4 / 3^2

      // Cas avec base 15 (un peu plus difficile)
      { a: [5, 3], n: 3, k: 2 }, // 15^5 / 5^3
      { a: [3, 5], n: 3, k: 2 }, // 15^5 / 3^3
    ])
    const produit = a[0] * a[1]
    const exposantTotal = n + k
    const fraction = `\\dfrac{${produit}^${exposantTotal}}{${a[0]}^${n}}`
    const coefficient = a[1] ** n

    this.correction = `$\\begin{aligned}
    N&=${fraction}\\\\
    &=\\dfrac{${a[0]}^${exposantTotal}\\times ${a[1]}^${exposantTotal} }{${a[0]}^${n}}\\\\
    &=${a[1]}^${exposantTotal}\\times ${a[0]}^{${k}}\\\\
    &=${produit}^${k}\\times ${a[1]}^{${n}}\\\\
    &=${this.versionQcm ? miseEnEvidence(`${coefficient}\\times ${produit}^{${k}}`) : `${miseEnEvidence(coefficient)}\\times ${produit}^{${k}}`}
    \\end{aligned}$`

    if (this.versionQcm) {
      this.consigne = ''
      this.question = `On considère le nombre $N=${fraction}$. <br>On a :`
      this.reponse = `$N=${coefficient}\\times ${produit}^{${k}}$`
      this.distracteurs = [
        `$N=${a[1]}^{${k}}$`,
        `$N=\\dfrac{1}{${produit}^{${k}}}$`,
        `$N=${produit ** k / a[0]}$`,
      ]
    } else {
      this.consigne = "Compléter l'égalité avec un nombre entier."
      this.question = `${fraction}=%{champ1}\\times ${produit}^{${k}}`
      this.reponse = {
        champ1: {
          value: String(coefficient),
          options: { nombreDecimalSeulement: true },
        },
      }
    }
  }
}
