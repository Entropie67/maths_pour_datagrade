import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer avec une fraction'
export const interactifReady = true

export const uuid = 'bdk1y'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q20 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  enonce(b?: number, fraction?: FractionEtendue): void {
    if (b == null || fraction == null) {
      b = randint(3, 7)
      const denominateur = choice([3, 5, 7])
      const numerateur = randint(1, denominateur - 1)
      fraction = new FractionEtendue(numerateur, denominateur)
    }
    this.optionsDeComparaison = { fractionEgale: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction

    // Calcul : a × (b - c/d)
    const bFraction = new FractionEtendue(b, 1)
    const difference = bFraction.differenceFraction(fraction)
    const resultat = difference.produitFraction(fraction.d)
    const resultatSimplifie = resultat.simplifie()

    this.reponse = resultatSimplifie

    this.question = `$${fraction.d}\\times \\left(${b}-${fraction.texFraction}\\right)$`

    this.correction = `$\\begin{aligned}
${fraction.d}\\times \\left(${b}-${fraction.texFraction}\\right)&=${fraction.d}\\times \\left(${bFraction.texFractionSimplifiee}-${fraction.texFraction}\\right)\\\\
&=${fraction.d}\\times \\left(\\dfrac{${b * fraction.d}}{${fraction.d}}-${fraction.texFraction}\\right)\\\\
&=${fraction.d}\\times ${difference.texFractionSimplifiee}\\\\
&=${miseEnEvidence(texNombre(resultatSimplifie.valeurDecimale, 2))}
\\end{aligned}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(4, new FractionEtendue(2, 7))
    else this.enonce()
  }
}
