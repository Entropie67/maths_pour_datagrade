import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Tables à trou'
export const interactifReady = true

export const uuid = 'f3a3g'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N6Q2 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    let produit = 32
    if (a == null || b == null) {
      const paire = shuffle(
        choice([
          [6, 7],
          [8, 9],
          [6, 8],
          [7, 9],
          [6, 9],
          [7, 8],
          [3, 8],
          [4, 8],
          [5, 7],
          [6, 6],
          [7, 5],
          [9, 3],
          [8, 5],
          [9, 4],
          [7, 3],
        ]),
      )
      a = paire[0]
      b = paire[1]
      produit = a * b
    }
    this.reponse = String(b)
    if (this.interactif) {
      this.question = `$${a}\\times $ `
      this.optionsChampTexte = { texteApres: ` $ = ${produit}$` }
    } else {
      this.question = `$${a}\\times \\ldots=${produit}$`
    }
    this.correction = `$${produit}\\div${a}=${miseEnEvidence(b)}$`
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${a}\\times \\ldots=${produit}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(8, 4)
    else this.enonce()
  }
}
