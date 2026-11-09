import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'

export const titre = 'Calculer un rendu de monnaie'
export const interactifReady = true

export const uuid = '5c854'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q13 extends ExerciceCan {
  enonce(nbBillets?: number, valeurBillet?: number, prixArticle?: number) {
    if (nbBillets == null || valeurBillet == null || prixArticle == null) {
      valeurBillet = 20
      nbBillets = randint(2, 4)
      prixArticle = nbBillets * valeurBillet - randint(3, 10)
    }

    const montantDonne = nbBillets * valeurBillet
    this.reponse = montantDonne - prixArticle

    this.question = `Je paie avec ${nbBillets === 1 ? 'un billet' : `$${texNombre(nbBillets)}$ billets`} de $${texNombre(valeurBillet)}${sp()}\\text{€}$
    un article qui coûte $${texNombre(prixArticle)}${sp()}\\text{€}$.<br>
    Combien doit-on me rendre${sp()}?`

    this.correction = `J'ai donné${sp()}: $${nbBillets}\\times ${texNombre(valeurBillet)}=${texNombre(montantDonne)}${sp()}\\text{€}$<br>
   On doit me rendre${sp()}: $${texNombre(montantDonne)}-${texNombre(prixArticle)}=${miseEnEvidence(texNombre(this.reponse))}${sp()}\\text{€}$`
    this.canEnonce = `Je paie avec ${nbBillets === 1 ? 'un billet' : `$${texNombre(nbBillets)}$ billets`} de $${texNombre(valeurBillet)}${sp()}\\text{€}$
    un article qui coûte $${texNombre(prixArticle)}${sp()}\\text{€}$.<br>
    Combien doit-on me rendre${sp()}?`
    this.canReponseACompleter = '$\\ldots$ €'

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' €' }
    } else {
      this.question += `<br>$\\ldots$ €`
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 20, 33)
    else this.enonce()
  }
}
