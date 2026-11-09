import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Chercher un nombre'
export const interactifReady = true

export const uuid = 'fe2b7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025CE1Q5 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = randint(1, 9)
      b = randint(1, 9)
    }
    const valInf = b * 100 + a * 10
    const valSup = b * 100 + (a + 1) * 10

    this.reponse = {
      reponse: {
        value: `[${valInf};${valSup}[`,
        options: { estDansIntervalle: true },
      },
    }
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.question = `Écris un nombre qui a $${a}$ pour chiffre des dizaines et $${b}$ pour chiffre des centaines.`
    this.correction = `Les nombres qui ont $${a}$ pour chiffre des dizaines et $${b}$ pour chiffre des centaines sont :<br>`
    for (let i = 0; i <= 8; i++) {
      this.correction += `$${miseEnEvidence(b * 100 + a * 10 + i)}$ ; `
    }
    this.correction += `$${miseEnEvidence(b * 100 + a * 10 + 9)}$. `
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 5)
    else this.enonce()
  }
}
