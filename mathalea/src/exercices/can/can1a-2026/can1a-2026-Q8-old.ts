import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un quotient de puissances'
export const interactifReady = true

export const uuid = 'lk1of'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q8 extends ExerciceCan {
  enonce(a?: number, exposant1?: number, exposant2?: number): void {
    if (a == null || exposant1 == null || exposant2 == null) {
      a = randint(2, 9)
      exposant1 = randint(2, 7)
      exposant2 = randint(2, 5)
    }

    const resultat = exposant1 + exposant2

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'

    this.reponse = { champ1: { value: resultat } }

    this.question = `\\dfrac{${a}^{${exposant1}}}{${a}^{-${exposant2}}} = ${a}^{%{champ1}}`

    this.correction = `$\\dfrac{${a}^{${exposant1}}}{${a}^{-${exposant2}}}=${a}^{${exposant1}-(-${exposant2})}=${a}^{${exposant1}+${exposant2}}=${a}^{${miseEnEvidence(resultat)}}$`
    this.canEnonce = `$\\dfrac{${a}^{${exposant1}}}{${a}^{-${exposant2}}}$`
    this.canReponseACompleter = `$${a}^{\\ldots}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(6, 5, 3)
    else this.enonce()
  }
}
