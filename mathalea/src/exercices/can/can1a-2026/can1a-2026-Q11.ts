import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer un terme d'une suite définie de façon explicite"
export const interactifReady = true

export const uuid = '89p50'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q12 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number, n?: number): void {
    if (a == null || b == null || n == null) {
      a = randint(2, 9)
      b = randint(-9, 9, 0)
      n = randint(5, 12)
    }

    const resultat = a * n + b

    this.reponse = resultat
    this.question = `Soit $(u_n)$ une suite définie par : $u_n=${a}n${ecritureAlgebrique(b)}$.<br>
    Calculer $u_{${n}}$.<br>
    $u_{${n}}=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `$u_{${n}}=${a}\\times ${n}${ecritureAlgebrique(b)}=${miseEnEvidence(resultat)}$`
    this.canEnonce = `Soit $(u_n)$ une suite définie par : $u_n=${a}n${ecritureAlgebrique(b)}$.<br>Calculer $u_{${n}}$.`
    this.canReponseACompleter = `$u_{${n}}=\\ldots$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(7, -1, 9)
    else this.enonce()
  }
}
