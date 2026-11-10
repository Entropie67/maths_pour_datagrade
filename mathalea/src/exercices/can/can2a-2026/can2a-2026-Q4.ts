import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd, ppcm } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Ajouter ou soustraire des fractions'
export const interactifReady = true

export const uuid = 'vacjb'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q4 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  enonce(a?: number, b?: number, signe?: string) {
    if (a == null || b == null || signe == null) {
      // Générer deux nombres premiers entre eux
      do {
        a = randint(2, 7)
        b = randint(2, 7, a)
      } while (pgcd(a, b) !== 1)

      signe = choice(['+', '-'])
      // Si soustraction, on s'assure que a < b pour avoir un résultat positif
      if (signe === '-' && a > b) {
        ;[a, b] = [b, a]
      }
    }

    const f1 = new FractionEtendue(1, a)
    const f2 = new FractionEtendue(1, b)
    const resultat =
      signe === '+'
        ? f1.sommeFraction(f2).simplifie()
        : f1.sommeFraction(new FractionEtendue(-1, b)).simplifie()

    const denominateur = ppcm(a, b)
    const numerateur1 = denominateur / a
    const numerateur2 = denominateur / b

    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.reponse = resultat.texFraction
    this.question = `$${f1.texFraction}${signe}${f2.texFraction}$`
    this.correction = `$\\begin{aligned}${f1.texFraction}${signe}${f2.texFraction}&=\\dfrac{${numerateur1}}{${denominateur}}${signe}\\dfrac{${numerateur2}}{${denominateur}}\\\\

    &=${miseEnEvidence(resultat.texFraction)}\\end{aligned}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 3, '-')
    else this.enonce()
  }
}
