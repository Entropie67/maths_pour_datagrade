import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Compter les sommets d'un solide"
export const interactifReady = true

export const uuid = 'ayxrt'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q20 extends ExerciceCan {
  enonce(a?: string) {
    const listeSolides = [
      'pavé droit',
      'cube',
      'tétraèdre',
      'prisme droit à base triangulaire',
      'prisme droit à base héxagonale',
      'prisme droit à base pentagonale',
      'prisme droit à base octogonale',
    ]
    let solide = listeSolides[0]
    if (a == null) {
      solide = choice(listeSolides)
    }
    let nbSommets: number
    switch (solide) {
      case 'pavé droit':
        nbSommets = 8
        break
      case 'cube':
        nbSommets = 8
        break
      case 'tétraèdre':
        nbSommets = 4
        break
      case 'prisme droit à base triangulaire':
        nbSommets = 6
        break
      case 'prisme droit à base héxagonale':
        nbSommets = 12
        break
      case 'prisme droit à base pentagonale':
        nbSommets = 10
        break
      case 'prisme droit à base octogonale':
      default:
        nbSommets = 16
        break
    }

    this.reponse = nbSommets
    this.question = `Donner le nombre de sommets d'un ${solide}.`
    this.correction =
      solide === 'tétraèdre'
        ? `Un tétraèdre a $${miseEnEvidence(4)}$ sommets.`
        : `Un ${solide} a $${miseEnEvidence(nbSommets)}$ sommets car il possède deux bases opposées à $${nbSommets / 2}$ sommets chacune.`

    this.question += this.interactif ? '<br>' : ''
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('pavé droit')
    else this.enonce()
  }
}
