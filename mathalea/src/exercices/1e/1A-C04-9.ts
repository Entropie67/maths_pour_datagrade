import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  'Écrire un nombre décimal sous la forme d’une fraction irréductible'
export const dateDePublication = '25/10/2026'
export const interactifReady = true

export const uuid = 'a0186'

export const refs = {
  'fr-fr': ['1A-C04-9'],
  'fr-ch': ['9R1NO4F-7', '9R2NO4F-7', '9R3NO4F-7'],
}

/**
 * @author Gilles Mora
 */

// Nombres décimaux exprimés en centièmes (25 pour 0,25) pour éviter les erreurs d'arrondi
const centiemes = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 110, 120, 140, 150, 160, 180, 250, 350, 5,
  15, 25, 35, 45, 75, 4, 8, 12, 16, 24, 125, 175, 225, 275,
]

export default class Auto1AC4i extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut écrire un nombre décimal sous la forme d'une fraction irréductible.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Écrire le nombre sous la forme d'une fraction décimale (dénominateur $10$ ou $100$).</li>
    <li>Simplifier la fraction obtenue jusqu'à ce qu'elle soit irréductible.</li>
  </ul>`
  }

  nouvelleVersion() {
    const n = this.quotaChoice('nombre', centiemes)
    // Fraction décimale de départ : dixièmes si possible, sinon centièmes
    const [num, den] = n % 10 === 0 ? [n / 10, 10] : [n, 100]
    const decimal = texNombre(n / 100, 2)
    const fractionDecimale = `\\dfrac{${num}}{${den}}`
    const irreductible = new FractionEtendue(num, den).simplifie()
    const k = den / irreductible.den

    this.question = `Écrire $${decimal}$ sous la forme d'une fraction irréductible.`
    this.reponse = irreductible
    if (n > 100 && irreductible.den === 4) {
      // 1,25 = 1 + 1/4 = 4/4 + 1/4 = 5/4
      const entier = Math.floor(n / 100)
      const quarts = (n % 100) / 25
      this.correction = `$${decimal}=${entier}+\\dfrac{${quarts}}{4}=\\dfrac{${4 * entier}}{4}+\\dfrac{${quarts}}{4}=${miseEnEvidence(irreductible.texFraction)}$`
    } else if (k === 1) {
      this.correction = `$${decimal}=${miseEnEvidence(fractionDecimale)}$<br>
      Cette fraction est irréductible.`
    } else {
      this.correction = `$${decimal}=${fractionDecimale}=${miseEnEvidence(irreductible.texFraction)}$<br>`
      this.correction += texteEnCouleur(
        `On simplifie par $${k}$ : $${fractionDecimale}=\\dfrac{${irreductible.num}\\times ${k}}{${irreductible.den}\\times ${k}}=${irreductible.texFraction}$.`,
        bleuMathalea,
      )
    }
  }
}
