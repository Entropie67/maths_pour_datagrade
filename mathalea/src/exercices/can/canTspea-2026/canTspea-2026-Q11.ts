import { fromOptions, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'
export const titre = "Completer un encadrement à partir d'un encadrement"
export const interactifReady = true

export const uuid = 'gc360'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ12 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(a?: number, b?: number, c?: number): void {
    if (a == null || b == null || c == null) {
      b = randint(-4, 4)
      c = b + randint(2, 6)
      a = randint(1, 8) * choice([-1, 1])
    }

    // Si b ≤ x ≤ c alors -c ≤ -x ≤ -b donc a-c ≤ a-x ≤ a-b
    const borneInf = a - c
    const borneSup = a - b

    const compare = seq([fromOptions({ nombreDecimalSeulement: true })])
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: String(borneInf), compare },
      champ2: { value: String(borneSup), compare },
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.consigne = `Si $${b}\\leqslant x\\leqslant ${c}$ alors${sp()}:<br>`
    this.question = `%{champ1}~\\leqslant ${a}-x\\leqslant ~%{champ2}`

    this.correction = `$${b}\\leqslant x\\leqslant ${c}$<br>
     On multiplie par $-1$ (on inverse les inégalités)${sp()}:<br>
    $${-c}\\leqslant -x\\leqslant ${-b}$<br>
   On ajoute $${a}$${sp()}:<br>
    $${miseEnEvidence(String(borneInf))}\\leqslant ${a}-x\\leqslant ${miseEnEvidence(String(borneSup))}$`

    this.canEnonce = `Si $${b}\\leqslant x\\leqslant ${c}$ alors${sp()}:`
    this.canReponseACompleter = `$\\ldots\\leqslant ${a}-x\\leqslant \\ldots$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3, -1, 5)
    else this.enonce()
  }
}
