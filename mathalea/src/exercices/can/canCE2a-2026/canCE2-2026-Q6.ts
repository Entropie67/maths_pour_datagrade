import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texPrix } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'

export const titre = "Donner le résultat d'une addition de dizaines"
export const interactifReady = true

export const uuid = '26ded'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q6 extends ExerciceCan {
  enonce(
    nbBillets?: number,
    valeurBillet?: number,
    nbPieces?: number,
    valeurPiece?: number,
  ) {
    if (
      nbBillets == null ||
      valeurBillet == null ||
      nbPieces == null ||
      valeurPiece == null
    ) {
      nbBillets = randint(8, 15)
      valeurBillet = 10
      nbPieces = choice([1, 2])
      valeurPiece = 2
    }

    const total = nbBillets * valeurBillet + nbPieces * valeurPiece
    const textePieces = nbPieces === 1 ? 'une pièce' : `deux pièces`

    this.question = `J'ai $${nbBillets}$ billets de $${valeurBillet}${sp()}\\text{€}$ et ${textePieces} de $${valeurPiece}${sp()}\\text{€}$.<br>
    Combien ai-je en tout ?`

    this.correction = `Avec les billets, j'ai :<br>
    $${nbBillets}\\times ${valeurBillet}=${nbBillets * valeurBillet}${sp()}\\text{€}$.<br>
    `
    if (nbPieces === 1) {
      this.correction += `J'ai une pièce de $${valeurPiece}${sp()}\\text{€}$.<br> `
    } else {
      this.correction += `Avec les pièces, j'ai : <br>
    $${nbPieces}\\times ${valeurPiece}=${nbPieces * valeurPiece}${sp()}\\text{€}$.<br>`
    }

    this.correction += `En tout j'ai $${miseEnEvidence(texPrix(total))}${sp()}\\text{€}$.`
    this.canEnonce = `J'ai $${nbBillets}$ billets de $${valeurBillet}${sp()}\\text{€}$ et ${textePieces} de $${valeurPiece}${sp()}\\text{€}$.<br>
    Combien ai-je en tout ?`
    this.canReponseACompleter = '$\\ldots$ €'
    this.reponse = total
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' €' }

    if (!this.interactif) {
      this.question += '<br>$\\ldots$ €'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(12, 10, 1, 2)
    else this.enonce()
  }
}
