import { distracteursDistincts } from '../../lib/interactif/qcmDistractors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '07/09/2025'
export const dateDeModifImportante = '30/10/2026'
export const uuid = '15839'

export const refs = {
  'fr-fr': ['1A-C10-9', '2A-C3-7'],
  'fr-ch': ['11CTQCMFA5-1', '11LCQCMFA5-1', '11LSQCMFA5-4', '1mQCM-29'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre =
  'Résoudre une équation du type $\\dfrac{a}{x}=b$ ou $\\dfrac{x}{a}=b$'
/**
 * @author Gilles Mora
 */
export default class Auto1AC11a extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    let equation = ''
    if (context.isAmc) this.versionQcm = true

    const fraction = (num: number, den: number) =>
      new FractionEtendue(num, den).simplifie().texFractionSimplifiee
    let solution: string
    let distracteurs: string[]
    const a = randint(2, 9)

    switch (this.quotaChoice('cas', [1, 2, 3])) {
      case 1: {
        // Solution fractionnaire : x = b/a
        let b = randint(2, 30)
        while (b % a === 0) b = randint(2, 30)
        equation = `$\\dfrac{${b}}{x}=${a}$`
        this.correction = `L'équation $\\dfrac{${b}}{x}=${a}$ est équivalente à $${a}\\times x=${b}$, soit $x=\\dfrac{${b}}{${a}}$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(fraction(b, a))}$.`
        solution = fraction(b, a)
        distracteurs = [
          fraction(a, b),
          String(a * b),
          fraction(-b, a),
          fraction(b + a, a),
        ]
        break
      }
      case 2: {
        // x/a = b : x = a × b
        const b = randint(2, 12)
        equation = `$\\dfrac{x}{${a}}=${b}$`
        this.correction = `L'équation $\\dfrac{x}{${a}}=${b}$ est équivalente à $x=${a}\\times ${b}$.<br>
    Ainsi, la solution de l'équation est $${miseEnEvidence(String(a * b))}$.`
        solution = String(a * b)
        distracteurs = [
          fraction(b, a),
          fraction(a, b),
          String(-a * b),
          String(a + b),
        ]
        break
      }
      case 3:
      default: {
        // Solution entière : x = b/a
        const n = randint(2, 12)
        const b = a * n
        equation = `$\\dfrac{${b}}{x}=${a}$`
        this.correction = `L'équation $\\dfrac{${b}}{x}=${a}$ est équivalente à $${a}\\times x=${b}$, soit $x=\\dfrac{${b}}{${a}}=${n}$.<br>
    Ainsi, la solution de l'équation est $${miseEnEvidence(String(n))}$.`
        solution = String(n)
        distracteurs = [
          fraction(a, b),
          String(-n),
          String(a * b),
          String(b - a),
        ]
        break
      }
    }

    if (this.versionQcm) {
      this.question = `La solution de l'équation ${equation} est :`
      this.reponse = `$${solution}$`
      this.distracteurs = distracteursDistincts(
        this.reponse,
        distracteurs.map((d) => `$${d}$`),
        [`$${a}$`, `$${fraction(-a, 1)}$`, `$${-a * a}$`],
        Math.max(3, distracteurs.length),
      )
    } else {
      this.reponse = solution
      // En interactif, x= à la ligne devant le champ ; sur papier (PDF), consigne classique
      this.question = this.interactif
        ? `La solution de l'équation ${equation} est :<br>$x=$`
        : `Déterminer la solution de l'équation ${equation}.`
    }
  }
}
