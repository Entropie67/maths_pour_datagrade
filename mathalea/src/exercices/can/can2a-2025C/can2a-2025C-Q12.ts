import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer une puissance d'une puissance"
export const interactifReady = true

export const uuid = 'j6xub'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ12 extends ExerciceCan {
  enonce(base?: number, exp1?: number, exp2?: number, expExt?: number): void {
    if (base == null || exp1 == null || exp2 == null || expExt == null) {
      base = choice([2, 3, 5, 7])
      exp1 = randint(2, 6)
      exp2 = randint(-5, -1)
      expExt = randint(2, 6)
    }

    const expInterne = exp1 + exp2
    const expFinal = expInterne * expExt

    this.formatInteractif = 'fillInTheBlank'
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: String(base) },
      champ2: { value: String(expFinal) },
    }
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.question = `(${base}^{${exp1}}\\times ${base}^{${exp2}})^{${expExt}}=%{champ1}^{%{champ2}}`

    this.correction = `$(${base}^{${exp1}}\\times ${base}^{${exp2}})^{${expExt}}=(${base}^{${exp1}${exp2 >= 0 ? '+' : ''}${exp2}})^{${expExt}}=(${base}^{${expInterne}})^{${expExt}}=${base}^{${expInterne}\\times ${expExt}}=${base}^{${miseEnEvidence(String(expFinal))}}$`

    this.canEnonce = `$(${base}^{${exp1}}\\times ${base}^{${exp2}})^{${expExt}}=$`
    this.canReponseACompleter = `$${base}^{\\ldots}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(5, 2, -3, 6)
    else this.enonce()
  }
}
