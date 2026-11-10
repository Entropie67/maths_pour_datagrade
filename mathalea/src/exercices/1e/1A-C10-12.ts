import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'

export const dateDeModifImportante = '30/09/2026'

export const uuid = '2976a'
export const refs = {
  'fr-fr': ['1A-C10-12', '2A-C3-5'],
  'fr-ch': ['11CTQCMFA5-2', '11LCQCMFA5-2', '11LSQCMFA5-5', '1mQCM-24'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation'
export const dateDePublication = '26/09/2025'
/**
 * @author Gilles Mora
 */
export default class Auto1C11d extends ExerciceSimple {
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

    const a = randint(1, 10)
    const b = randint(-10, 10, [0])
    const c = randint(2, 10, [a, a - 1, a + 1])
    const d = randint(-10, 10, [0, b])
    const solution = new FractionEtendue(d - b, a - c).simplifie()

    equation = `$(${reduireAxPlusB(a, b)})-(${reduireAxPlusB(c, d)})=0$`
    this.correction = `On se ramène à une équation du type $ax=b$ en isolant les «${sp()}$x$${sp()}» dans le membre de gauche et les «${sp()}non $x$${sp()}» dans le membre de droite.<br>
    $\\begin{aligned}
    (${reduireAxPlusB(a, b)})-(${reduireAxPlusB(c, d)})&=0\\\\
   ${a}x${ecritureAlgebrique(b)}${ecritureAlgebrique(-c)}x${ecritureAlgebrique(-d)}&=0\\\\
 ${a - c}x${ecritureAlgebrique(b - d)}&=0\\\\
 ${a - c}x&=${d - b}\\\\
x&= ${solution.texFSD}
\\end{aligned}$<br>
   La solution de cette équation est $${miseEnEvidence(solution.texFSD)}$.`

    if (this.versionQcm) {
      this.question = `La solution de l'équation ${equation} est :`
      this.reponse = `$${solution.texFSD}$`
      this.distracteurs = [
        new FractionEtendue(-b, a),
        new FractionEtendue(-d, c),
        new FractionEtendue(-d - b, a - c),
        new FractionEtendue(b - d, a - c),
        new FractionEtendue(d + b, a - c),
        new FractionEtendue(d - b, a + c),
      ].map((f) => `$${f.simplifie().texFSD}$`)
    } else {
      this.reponse = solution.texFSD
      // En interactif, x= à la ligne devant le champ ; sur papier (PDF), consigne classique
      this.question = this.interactif
        ? `La solution de l'équation ${equation} est :<br>$x=$`
        : `Déterminer la solution de l'équation ${equation}.`
    }
  }
}
