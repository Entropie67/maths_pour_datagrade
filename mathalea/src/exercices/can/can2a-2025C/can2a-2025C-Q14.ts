import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer avec une fraction complexe'
export const interactifReady = true

export const uuid = '5v9z1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ14 extends ExerciceCan {
  enonce(a?: number, num?: number, den?: number): void {
    if (a == null || num == null || den == null) {
      den = choice([2, 3, 4, 5])
      // num doit être un multiple de den pour résultat entier de num/(1/den) = num × den
      num = randint(1, 5)
      a = randint(-5, -1)
    }

    const quotient = num * den
    const resultat = a + quotient

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(resultat)
    this.question = `$${a}+\\dfrac{${num}}{\\dfrac{1}{${den}}}=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `$\\dfrac{${num}}{\\dfrac{1}{${den}}}=${num}\\times ${den}=${quotient}$.<br>
    Donc $${a}+\\dfrac{${num}}{\\dfrac{1}{${den}}}=${a}${ecritureAlgebrique(quotient)}=${miseEnEvidence(String(resultat))}$.`
    this.canEnonce = `$${a}+\\dfrac{${num}}{\\dfrac{1}{${den}}}=$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-2, 4, 3)
    else this.enonce()
  }
}
