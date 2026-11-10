import { fromOptions, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  'Calculer une puissance en utilisant les propriétés des exposants'
export const interactifReady = true

export const uuid = 'idi01'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q15 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(a?: number, exposant1?: number, exposant2?: number): void {
    if (a == null || exposant1 == null || exposant2 == null) {
      a = randint(2, 9)
      exposant1 = randint(2, 4)
      exposant2 = randint(5, 9)
    }

    this.reponse = {
      champ1: {
        value: exposant1 - exposant2,
        compare: seq([fromOptions({ nombreDecimalSeulement: true })]),
      },
    }

    this.question = `\\dfrac{${a}^${exposant1}}{${a}^${exposant2}} = ${a}^{%{champ1}}`

    this.correction = `$\\dfrac{${a}^${exposant1}}{${a}^${exposant2}}=${a}^{${exposant1}-${exposant2}}=${a}^{${miseEnEvidence(exposant1 - exposant2)}}$`
    this.canEnonce = `$\\dfrac{${a}^${exposant1}}{${a}^${exposant2}}=$`
    this.canReponseACompleter = `$${a}^{\\ldots}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(5, 3, 6)
    else this.enonce()
  }
}
