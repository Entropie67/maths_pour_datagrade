import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '09/09/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '202d9'

export const refs = {
  'fr-fr': ['1A-C10-11', '2A-C3-4'],
  'fr-ch': ['10LCFA5C-12', '10LSFA5C-12', '11CTFA4C-12', '11LCFA4C-12', '11LSFA4C-12', '1mQCM-23'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation $ax+b=c$'
/**
 * @author Gilles Mora
 */
export default class Auto1AC11c extends ExerciceSimple {
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

    let a: number
    let b: number
    let c: number
    let compteur = 0
    // Signes de a, b et c (c est toujours négatif) ; on évite une solution entière.
    const cas = this.quotaChoice('cas', [1, 2, 3])
    do {
      a = randint(2, 9) * (cas === 1 ? 1 : -1)
      b = randint(2, 9) * (cas === 3 ? 1 : -1)
      c = randint(-15, -3)
      compteur++
    } while (compteur < 100 && (c - b) % a === 0)

    const fraction = (num: number, den: number) =>
      new FractionEtendue(num, den).simplifie().texFractionSimplifiee
    const solution = fraction(c - b, a)

    const brute = `\\dfrac{${c - b}}{${a}}`
    const conclusion =
      solution === brute
        ? `$x=${miseEnEvidence(solution)}$`
        : `$x=${brute}$, soit $x=${miseEnEvidence(solution)}$`

    equation = `$${reduireAxPlusB(a, b)}=${c}$`
    this.correction = `On obtient $x$ en ${b < 0 ? `ajoutant $${-b}$ à` : `retranchant $${b}$ à`} $${c}$, puis en divisant le résultat par $${a}$.<br>
    Ainsi, $x=\\dfrac{${c}${ecritureAlgebrique(-b)}}{${a}}$, c'est-à-dire ${conclusion}.`

    if (this.versionQcm) {
      this.question = `La solution de l'équation ${equation} est :`
      this.reponse = `$${solution}$`
      this.distracteurs = [
        fraction(c + b, a),
        fraction(b - c, a),
        fraction(a, c - b),
        fraction(c + b, -a),
        fraction(c - a, b),
      ].map((d) => `$${d}$`)
    } else {
      this.reponse = solution
      // En interactif, x= à la ligne devant le champ ; sur papier (PDF), consigne classique
      this.question = this.interactif
        ? `La solution de l'équation ${equation} est :<br>$x=$`
        : `Déterminer la solution de l'équation ${equation}.`
    }
  }
}
