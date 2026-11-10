import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer la raison d'une suite arithmétique"
export const interactifReady = true

export const uuid = 'do7ez'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q29 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(u?: number, r?: number, i?: number, n?: number, s?: string): void {
    if (u == null || r == null || i == null || n == null || s == null) {
      u = randint(1, 12)
      r = randint(3, 10)
      n = randint(2, 10)
      i = randint(1, 10)
      s = choice(['u', 'v', 'w'])
    }

    const v = u + n * r

    this.reponse = String(r)

    this.question = `$(${s}_n)$ est une suite arithmétique avec $${s}_{${i}}=${u}$ et $${s}_{${i + n}}=${v}$.<br>`

    if (this.interactif) {
      this.optionsChampTexte = {
        texteAvant: 'La raison de cette suite est égale à ',
        texteApres: '.',
      }
    } else {
      this.question += 'La raison de cette suite est égale à $\\ldots$'
    }

    this.correction = `La suite $(${s}_n)$ est arithmétique de raison $r$. Pour tout entier naturel $n$ et $p$ : $${s}_n=${s}_p+(n-p)r$.<br>
    Ainsi, $${s}_{${i + n}}=${s}_{${i}}+(${i + n}-${i})r=${s}_{${i}}+${n}r$.<br>
    On en déduit : $r=\\dfrac{${s}_{${i + n}}-${s}_{${i}}}{${n}}=\\dfrac{${v}-${ecritureParentheseSiNegatif(u)}}{${n}}=${miseEnEvidence(String(r))}$.`

    this.canEnonce = `$(${s}_n)$ est une suite arithmétique avec $${s}_{${i}}=${u}$ et $${s}_{${i + n}}=${v}$.`
    this.canReponseACompleter = 'La raison de cette suite est égale à $\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(1, 8, 2, 10, 'u')
    else this.enonce()
  }
}
