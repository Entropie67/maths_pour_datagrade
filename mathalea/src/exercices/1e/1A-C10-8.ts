import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs, signe } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const dateDeModifImportante = '30/09/2026'

export const uuid = 'cabfe'
export const refs = {
  'fr-fr': ['1A-C10-8', '2A-C3-6'],
  'fr-ch': ['10LCFA5C-10', '10LSFA5C-10', '11CTFA4C-10', '11LCFA4C-10', '11LSFA4C-10', '1mQCM-12'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation du premier degré'
export const dateDePublication = '05/08/2025'
/**
 * @author Gilles Mora
 */
export default class Auto1C11 extends ExerciceSimple {
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

    const typeEquation = this.quotaChoice('type', [
      'k(ax+b)=cx+d',
      'k-(ax+b)=cx+d',
    ])

    // Génération des coefficients
    const a = randint(-9, 9, 0)
    const b = randint(-9, 9, 0)
    let c = randint(-9, 9, [0, a])
    const d = randint(-9, 9, 0)
    const k = randint(2, 9, b)

    // Fraction simplifiée, ou null si le dénominateur est nul (erreur de calcul possible d'un élève)
    const fraction = (num: number, den: number) =>
      den === 0 ? null : new FractionEtendue(num, den).simplifie()

    // Dernières lignes de la résolution : x = n/m, puis la fraction simplifiée si elle est différente
    const dernieresLignes = (
      n: number,
      m: number,
      solution: FractionEtendue,
    ) => {
      if (m === 1) return ''
      const brute = `\\dfrac{${n}}{${m}}`
      const simplifiee = solution.texFractionSimplifiee
      return `\\\\\n x&=${brute}${simplifiee === brute ? '' : `\\\\\n x&=${simplifiee}`}`
    }

    let solution: FractionEtendue
    let erreurs: (FractionEtendue | null)[]

    if (typeEquation === 'k(ax+b)=cx+d') {
      if (c === k * a) {
        c = randint(1, 9, [k * a])
      } // éviter division par 0
      solution = new FractionEtendue(d - k * b, k * a - c).simplifie()

      equation = `$${k}(${rienSi1(a)}x${ecritureAlgebrique(b)})=${rienSi1(c)}x${ecritureAlgebrique(d)}$`
      this.correction = `On développe, puis on isole l'inconnue dans le membre de gauche :<br>
 $\\begin{aligned}
 ${k}(${rienSi1(a)}x${ecritureAlgebrique(b)})&=${rienSi1(c)}x${ecritureAlgebrique(d)}\\\\
 ${k * a}x${ecritureAlgebrique(k * b)}&=${rienSi1(c)}x${ecritureAlgebrique(d)}\\\\
 ${k * a}x${ecritureAlgebrique(k * b)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}&=${c}x${ecritureAlgebrique(d)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}\\\\
 ${rienSi1(k * a - c)}x${ecritureAlgebrique(k * b)}&=${d}\\\\
 ${rienSi1(k * a - c)}x${ecritureAlgebrique(k * b)}${miseEnEvidence(ecritureAlgebrique(-k * b))}&=${d}${miseEnEvidence(ecritureAlgebrique(-k * b))}\\\\
 ${rienSi1(k * a - c)}x&=${d - k * b}${dernieresLignes(d - k * b, k * a - c, solution)}
 \\end{aligned}$<br>`
      this.correction += `La solution est $${miseEnEvidence(solution.texFractionSimplifiee)}$.`

      erreurs = [
        fraction(d - b, a - c), // Oubli du k dans le développement
        fraction(d + k * b, k * a - c), // Erreur de signe
        fraction(d - k * b, k * a + c), // Erreur dans la soustraction des x
        fraction(k * b - d, k * a - c), // Opposé de la solution
        fraction(k * a - c, d - k * b), // Inverse de la solution
        fraction(d - k * b, k * a - c + 1),
      ]
    } else {
      // k-(ax+b)=cx+d
      if (c === -a) {
        c = randint(-9, 9, [0, a, -a])
      } // éviter division par 0

      const newA = -a
      const newB = k - b
      solution = new FractionEtendue(d - newB, newA - c).simplifie()

      equation = `$${k}-(${rienSi1(a)}x${ecritureAlgebrique(b)})=${rienSi1(c)}x${ecritureAlgebrique(d)}$`
      this.correction = `On développe, puis on isole l'inconnue dans le membre de gauche :<br>
 $\\begin{aligned}
 ${k}-(${rienSi1(a)}x${ecritureAlgebrique(b)})&=${rienSi1(c)}x${ecritureAlgebrique(d)}\\\\
 ${k}${ecritureAlgebrique(-a)}x${ecritureAlgebrique(-b)}&=${rienSi1(c)}x${ecritureAlgebrique(d)}\\\\
 ${rienSi1(newA)}x${ecritureAlgebrique(newB)}&=${rienSi1(c)}x${ecritureAlgebrique(d)}\\\\
 ${rienSi1(newA)}x${ecritureAlgebrique(newB)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}&=${c}x${ecritureAlgebrique(d)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}\\\\
 ${rienSi1(newA - c)}x${ecritureAlgebrique(newB)}&=${d}\\\\
 ${rienSi1(newA - c)}x${ecritureAlgebrique(newB)}${miseEnEvidence(ecritureAlgebrique(-1 * newB))}&=${d}${miseEnEvidence(ecritureAlgebrique(-1 * newB))}\\\\
 ${rienSi1(newA - c)}x&=${d - newB}${dernieresLignes(d - newB, newA - c, solution)}
 \\end{aligned}$`
      this.correction += `<br> La solution est $${miseEnEvidence(solution.texFractionSimplifiee)}$.`

      erreurs = [
        fraction(d + newB, newA - c), // Erreur de signe
        fraction(d - b, a - c), // Pas de développement du membre de gauche
        fraction(-d + newB, newA - c), // Opposé de la solution
        fraction(d - newB, newA + c), // Erreur dans la soustraction des x
        fraction(newA - c, d - newB), // Inverse de la solution
        fraction(d - newB, newA - c + 1),
      ]
    }

    if (this.versionQcm) {
      this.question = `La solution de l'équation ${equation} est :`
      // Solutions décalées de 1 : garantissent assez de distracteurs, même si la solution est nulle
      erreurs.push(
        new FractionEtendue(solution.num + solution.den, solution.den),
        new FractionEtendue(solution.num - solution.den, solution.den),
      )
      this.reponse = `$${solution.texFractionSimplifiee}$`
      this.distracteurs = erreurs
        .filter((f): f is FractionEtendue => f !== null)
        .map((f) => `$${f.texFractionSimplifiee}$`)
    } else {
      this.reponse = solution.texFractionSimplifiee
      // En interactif, x= à la ligne devant le champ ; sur papier (PDF), consigne classique
      this.question = this.interactif
        ? `La solution de l'équation ${equation} est :<br>$x=$`
        : `Déterminer la solution de l'équation ${equation}.`
    }
  }
}
