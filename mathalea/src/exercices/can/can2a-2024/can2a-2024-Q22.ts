/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une probabilité'
export const interactifReady = true

export const uuid = 'fc596'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = new FractionEtendue(3, 6).simplifie().texFraction
      this.question = `On lance un dé à six faces numérotées de $1$ à $6$. <br>
        La probabilité d’obtenir un nombre  premier est : `

      this.correction = `Comme il y a $3$ nombres premiers inférieurs ou égaux à $6$ ($2$, $3$ et $5$), la probabilité d'obtenir un nombre premier est $\\dfrac{3}{6}=${miseEnEvidence(this.reponse)}$.`
      this.canEnonce = `On lance un dé à six faces numérotées de $1$ à $6$. <br>
      La probabilité d’obtenir un nombre  premier est : `
    } else {
      const b = choice([2, 3])
      const c = choice([4, 5, 6])
      switch (choice(['a', 'b', 'c', 'd'])) {
        case 'a':
          this.reponse = new FractionEtendue(1, b).texFraction
          this.question = `On lance un dé cubique équilibré.<br> 
          La probabilité d’obtenir un  multiple de $${b}$  est : `
          this.correction = `Comme il y a $${5 - b}$ multiples de $${b}$, la probabilité d'obtenir un multiple de $${b}$ est $\\dfrac{${5 - b}}{6}=${miseEnEvidence(this.reponse)}$.`
          this.correction = `Comme il y a $3$ nombres premiers inférieurs ou égal à $6$ : $2$, $3$ et $5$, la probabilité d'obtenir un nombre premier est $\\dfrac{3}{6}=${miseEnEvidence(this.reponse)}$.`
          this.canEnonce = `On lance un dé cubique équilibré.<br> 
          La probabilité d’obtenir un  multiple de $${b}$  est :`

          break
        case 'b':
          this.reponse = new FractionEtendue(1, 2).texFraction
          this.question = `On lance un dé à six faces numérotées de $1$ à $6$. <br>
              La probabilité d’obtenir un nombre premier est : `
          this.correction = `Comme il y a $3$ nombres premiers inférieurs ou égal à $6$ : $2$, $3$ et $5$, la probabilité d'obtenir un nombre premier est $\\dfrac{3}{6}=${miseEnEvidence(this.reponse)}$.`
          this.canEnonce = `On lance un dé à six faces numérotées de $1$ à $6$. <br>
          La probabilité d’obtenir un nombre premier est : `

          break
        case 'c':
          this.reponse = new FractionEtendue(1, 6).texFraction
          this.question = `On lance un dé cubique équilibré.<br> 
                  La probabilité d’obtenir un  multiple de $${c}$  est : `
          this.correction = `Comme il y a $1$ multiple de $${c}$, la probabilité d'obtenir un multiple de $${c}$ est $${miseEnEvidence(this.reponse)}$.`
          this.canEnonce = `On lance un dé cubique équilibré.<br> 
          La probabilité d’obtenir un  multiple de $${c}$  est : `

          break

        case 'd':
          this.reponse = new FractionEtendue(5, 6).texFraction
          this.question = `On lance un dé cubique équilibré.<br> 
                      La probabilité d’obtenir un  diviseur de $12$  est : `
          this.correction = `Comme il y a $5$ diviseurs de $12$, la probabilité d'obtenir un diviseur de $12$  est $${miseEnEvidence(this.reponse)}$.`
          this.canEnonce = `On lance un dé cubique équilibré.<br> 
          La probabilité d’obtenir un  diviseur de $12$  est : `

          break
      }
    }
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }
}
