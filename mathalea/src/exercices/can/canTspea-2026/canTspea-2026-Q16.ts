import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Calculer un terme d'une suite géométrique définie par récurrence"
export const interactifReady = true

export const uuid = 'lo78x'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ16 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(u0?: number, k?: number, rang?: number): void {
    if (u0 == null || k == null || rang == null) {
      u0 = randint(1, 5)
      k = choice([2, 3, -2, -3])
      rang = 3
    }

    let u = u0
    let detail = `$u_0=${u0}$<br>`
    for (let i = 0; i < rang; i++) {
      const ancien = u
      u = k * u
      detail += `$u_{${i + 1}}=${k}\\times ${k < 0 ? '(' : ''}${ancien}${k < 0 ? ')' : ''}=${u}$<br>`
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(u)

    this.question = `Soit la suite $(u_n)$ définie par $u_0=${u0}$ et pour tout entier naturel $n$ : $u_{n+1}=${k}\\times u_n$.<br>`
    if (this.interactif) {
      this.question += `$u_{${rang}}=$`
    } else {
      this.question += `$u_{${rang}}=\\ldots$`
    }

    this.correction = `On calcule les termes successifs :<br>${detail}
    Ainsi, $u_{${rang}}=${miseEnEvidence(String(u))}$.`

    this.canEnonce = `Soit la suite $(u_n)$ définie par $u_0=${u0}$ et pour tout entier naturel $n$ : $u_{n+1}=${k}\\times u_n$.`
    this.canReponseACompleter = `$u_{${rang}}=\\ldots$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3, 2, 3)
    else this.enonce()
  }
}
