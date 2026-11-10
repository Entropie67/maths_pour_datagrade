import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Effectuer des calculs simples avec des racines carrées'
export const interactifReady = true

export const dateDePublication = '11/09/2026'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const uuid = '13310'

export const refs = {
  'fr-fr': ['can3C3-04', '2N51-flash4'],
  'fr-ch': [],
}
export default class CalculsSimplesRacinesCarrees extends ExerciceSimple {
  constructor() {
    super()
    this.optionsChampTexte = { texteAvant: '' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    switch (
      this.quotaChoice('cas', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) //
    ) {
      case 1: {
        // rac(a) : 1/n = rac(a) x n
        const [a, racineA, n] = choice([
          [144, 12, 4],
          [100, 10, 5],
          [64, 8, 2],
          [81, 9, 3],
          [36, 6, 4],
          [49, 7, 2],
          [121, 11, 3],
        ])
        this.reponse = racineA * n
        this.question = `$\\sqrt{${a}}\\div \\dfrac{1}{${n}}=$`
        this.correction = `
        Diviser par $\\dfrac{1}{${n}}$ revient à multiplier par $${n}$.<br>
        $\\sqrt{${a}}\\div \\dfrac{1}{${n}}=${racineA}\\times ${n}=${miseEnEvidence(this.reponse)}$`
        break
      }
      case 2: {
        // (rac(a)/rac(b))²
        const [a, racineA, b, racineB] = choice([
          [144, 12, 36, 6],
          [81, 9, 9, 3],
          [64, 8, 4, 2],
          [100, 10, 4, 2],
          [36, 6, 9, 3],
          [144, 12, 16, 4],
          [144, 12, 4, 2],
        ])
        const quotient = racineA / racineB
        this.reponse = quotient * quotient
        this.question = `$\\left(\\dfrac{\\sqrt{${a}}}{\\sqrt{${b}}}\\right)^2=$`
        this.correction = `$\\left(\\dfrac{\\sqrt{${a}}}{\\sqrt{${b}}}\\right)^2=\\left(\\dfrac{${racineA}}{${racineB}}\\right)^2=${quotient}^2=${miseEnEvidence(this.reponse)}$
      `
        break
      }
      case 3: {
        // rac(a) x rac(a) : rac(b) = a : rac(b)
        const [a, b, racineB] = choice([
          [81, 9, 3],
          [64, 4, 2],
          [36, 9, 3],
          [144, 4, 2],
          [100, 25, 5],
          [49, 49, 7],
          [16, 4, 2],
        ])
        this.reponse = a / racineB
        this.question = `$\\dfrac{\\sqrt{${a}}\\times \\sqrt{${a}}}{\\sqrt{${b}}}=$`
        this.correction = `$\\dfrac{\\sqrt{${a}}\\times \\sqrt{${a}}}{\\sqrt{${b}}}=\\dfrac{${a}}{${racineB}}=${miseEnEvidence(this.reponse)}$`
        break
      }
      case 4: {
        // rac(a) x rac(b) : n
        const [a, racineA, b, racineB, n] = choice([
          [49, 7, 16, 4, 2],
          [81, 9, 16, 4, 4],
          [100, 10, 9, 3, 5],
          [64, 8, 25, 5, 4],
          [36, 6, 49, 7, 3],
          [144, 12, 16, 4, 6],
          [100, 10, 4, 2, 5],
        ])
        const produit = racineA * racineB
        this.reponse = produit / n
        this.question = `$\\dfrac{\\sqrt{${a}}\\times \\sqrt{${b}}}{${n}}=$`
        this.correction = `$\\dfrac{\\sqrt{${a}}\\times \\sqrt{${b}}}{${n}}=\\dfrac{${racineA}\\times ${racineB}}{${n}}=\\dfrac{${produit}}{${n}}=${miseEnEvidence(this.reponse)}$`
        break
      }
      case 5: {
        // (rac(a) + k²) : n
        const [a, racineA, k, n] = choice([
          [81, 9, 6, 5],
          [100, 10, 4, 2],
          [81, 9, 3, 6],
          [144, 12, 2, 4],
          [36, 6, 3, 3],
          [49, 7, 5, 4],
          [100, 10, 2, 7],
        ])
        const somme = racineA + k * k
        this.reponse = somme / n
        this.question = `$\\dfrac{\\sqrt{${a}}+${k}^2}{${n}}=$`
        this.correction = `$\\dfrac{\\sqrt{${a}}+${k}^2}{${n}}=\\dfrac{${racineA}+${k * k}}{${n}}=\\dfrac{${somme}}{${n}}=${miseEnEvidence(this.reponse)}$`
        break
      }
      case 6: {
        // rac(a : 1/n) = rac(a x n)
        const [a, n, produit] = choice([
          [18, 2, 36],
          [8, 2, 16],
          [12, 3, 36],
          [50, 2, 100],
          [2, 8, 16],
          [3, 12, 36],
          [8, 8, 64],
        ])
        this.reponse = Math.sqrt(produit)
        this.question = `$\\sqrt{${a}\\div \\dfrac{1}{${n}}}=$`
        this.correction = `Diviser par $\\dfrac{1}{${n}}$ revient à multiplier par $${n}$.<br>
        $\\sqrt{${a}\\div \\dfrac{1}{${n}}}=\\sqrt{${a}\\times ${n}}=\\sqrt{${produit}}=${miseEnEvidence(this.reponse)}$`
        break
      }
      case 7: {
        // rac(a) : (m/n)
        const [a, racineA, m, n] = choice([
          [49, 7, 49, 7],
          [100, 10, 25, 5],
          [144, 12, 24, 4],
          [81, 9, 27, 9],
          [64, 8, 8, 4],
          [36, 6, 12, 4],
          [100, 10, 50, 5],
        ])
        const diviseur = m / n
        this.reponse = racineA / diviseur
        this.question = `$\\sqrt{${a}}\\div\\dfrac{${m}}{${n}}=$`
        this.correction = `$\\sqrt{${a}}\\div\\dfrac{${m}}{${n}}=${racineA}\\div ${diviseur}=${miseEnEvidence(this.reponse)}$`
        break
      }
      case 8: {
        // (rac(a) + rac(a) + rac(a)) : rac(a) = 3, quel que soit a
        const [a, racineA] = choice([
          [100, 10],
          [81, 9],
          [64, 8],
          [49, 7],
          [36, 6],
          [144, 12],
          [25, 5],
          [16, 4],
          [9, 3],
        ])
        this.reponse = 3
        this.question = `$\\dfrac{\\sqrt{${a}}+\\sqrt{${a}}+\\sqrt{${a}}}{\\sqrt{${a}}}=$`
        this.correction = `$\\dfrac{\\sqrt{${a}}+\\sqrt{${a}}+\\sqrt{${a}}}{\\sqrt{${a}}}=\\dfrac{${racineA}+${racineA}+${racineA}}{${racineA}}=\\dfrac{${3 * racineA}}{${racineA}}=${miseEnEvidence(3)}$`
        break
      }
      case 9: {
        // ((p : q) / rac(a))²
        const [p, q, a, racineA] = choice([
          [45, 5, 81, 9],
          [32, 2, 64, 8],
          [48, 4, 36, 6],
          [90, 3, 100, 10],
          [50, 5, 4, 2],
          [63, 7, 9, 3],
          [40, 4, 25, 5],
        ])
        const quotient1 = p / q
        const quotient2 = quotient1 / racineA
        this.reponse = quotient2 * quotient2
        this.question = `$\\left(\\dfrac{${p}\\div${q}}{\\sqrt{${a}}}\\right)^2=$`
        this.correction = `$\\left(\\dfrac{${p}\\div${q}}{\\sqrt{${a}}}\\right)^2=\\left(\\dfrac{${quotient1}}{${racineA}}\\right)^2=${quotient2}^2=${miseEnEvidence(this.reponse)}$`
        break
      }
      case 10:
      default: {
        // (rac(a) + rac(b)) : rac(c)
        const [a, racineA, b, racineB, c, racineC] = choice([
          [64, 8, 16, 4, 4, 2],
          [100, 10, 36, 6, 4, 2],
          [81, 9, 9, 3, 9, 3],
          [49, 7, 25, 5, 4, 2],
          [49, 7, 64, 8, 9, 3],
          [81, 9, 144, 12, 9, 3],
          [4, 2, 16, 4, 4, 2],
        ])
        const somme = racineA + racineB
        this.reponse = somme / racineC
        this.question = `$\\dfrac{\\sqrt{${a}}+\\sqrt{${b}}}{\\sqrt{${c}}}=$`
        this.correction = `$\\dfrac{\\sqrt{${a}}+\\sqrt{${b}}}{\\sqrt{${c}}}=\\dfrac{${racineA}+${racineB}}{${racineC}}=\\dfrac{${somme}}{${racineC}}=${miseEnEvidence(this.reponse)}$`
        break
      }
    }

    this.question = `Calculer sous la forme d'un nombre entier : <br> ${this.question}`
    this.canEnonce = this.question
    this.canReponseACompleter = '$\\ldots$'
    if (!this.interactif && context.isHtml) {
      this.question += ' $\\ldots$'
    }
  }
}
