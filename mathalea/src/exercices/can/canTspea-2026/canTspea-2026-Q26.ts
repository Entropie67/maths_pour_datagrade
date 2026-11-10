import { fromOptions, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  'Compléter un encadrement de $\\dfrac{n}{\\text{e}}$ par deux entiers consécutifs'
export const interactifReady = true

export const uuid = 'c5kkh'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ26 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(n?: number): void {
    if (n == null) {
      n = randint(3, 10)
    }

    const borneInf = Math.floor(n / Math.E)
    const borneSup = borneInf + 1

    const compare = seq([fromOptions({ nombreDecimalSeulement: true })])
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: String(borneInf), compare },
      champ2: { value: String(borneSup), compare },
    }

    this.consigne = 'Compléter avec deux entiers consécutifs.'
    this.question = `%{champ1} ~\\leqslant \\dfrac{${n}}{\\text{e}} \\leqslant ~%{champ2}`

    this.correction = `On sait que $\\text{e} \\approx 2,718$, soit environ $2,7$.<br>`
    this.correction += `On cherche à encadrer $\\dfrac{${n}}{\\text{e}}$ par deux entiers consécutifs, ce qui revient à encadrer $${n}$ par deux multiples consécutifs de $\\text{e}$.<br>`
    this.correction += `On a $${borneInf} \\times \\text{e} \\approx ${texNombre(borneInf * 2.718, 1)}$ et $${borneSup} \\times \\text{e} \\approx ${texNombre(borneSup * 2.718, 1)}$.<br>`
    this.correction += `Puisque $${borneInf}\\text{e} \\leqslant ${n} \\leqslant ${borneSup}\\text{e}$, en divisant tous les membres par $\\text{e}$ (qui est strictement positif), on obtient :<br>`
    this.correction += `$${miseEnEvidence(String(borneInf))} \\leqslant \\dfrac{${n}}{\\text{e}} \\leqslant ${miseEnEvidence(String(borneSup))}$.`
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canEnonce = 'Compléter avec deux entiers consécutifs.'
    this.canReponseACompleter = `$\\ldots \\leqslant \\dfrac{${n}}{\\text{e}} \\leqslant \\ldots$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(6)
    else this.enonce()
  }
}
