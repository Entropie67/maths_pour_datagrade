import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un prix avec une proportionnalité'
export const interactifReady = true

export const uuid = 'd8ef1'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote
 */

export default class Can2026CM2Q17 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' €' }
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(nbKilos?: number, prixTotal?: number, coeff?: number, fruit?: string) {
    if (
      nbKilos == null ||
      prixTotal == null ||
      coeff == null ||
      fruit == null
    ) {
      fruit = choice(['pommes', 'poires', 'pêches', 'cerises'])
      nbKilos = choice([2, 4, 6])
      prixTotal = choice([8, 10, 12])
      coeff = choice([1.5, 2.5])
    }

    const nbKilosDemandes = nbKilos * coeff
    const resultat = prixTotal * coeff
    const prixMoitie = prixTotal / 2

    this.reponse = texNombre(resultat, 0)
    this.question = `$${texNombre(nbKilos, 0)}\\text{ kg}$ de ${fruit} coûtent $${texNombre(prixTotal, 0)}$ €.<br>
    Combien coûtent $${texNombre(nbKilosDemandes, 0)}\\text{ kg}$ de ${fruit} ?`

    if (coeff === 1.5) {
      this.correction = `$${texNombre(nbKilosDemandes, 0)}\\text{ kg}$, c'est $${texNombre(nbKilos, 0)}\\text{ kg}$ et la moitié de $${texNombre(nbKilos, 0)}\\text{ kg}$, soit $${texNombre(nbKilos, 0)}+${texNombre(nbKilos / 2, 0)}$.<br>
      La moitié de $${texNombre(prixTotal, 0)}$ € est $${texNombre(prixMoitie, 0)}$ €.<br>
      Donc $${texNombre(nbKilosDemandes, 0)}\\text{ kg}$ coûtent $${texNombre(prixTotal, 0)}+${texNombre(prixMoitie, 0)}=${miseEnEvidence(texNombre(resultat, 0))}$ €.`
    } else {
      this.correction = `$${texNombre(nbKilosDemandes, 0)}\\text{ kg}$, c'est $2$ fois $${texNombre(nbKilos, 0)}\\text{ kg}$ et la moitié de $${texNombre(nbKilos, 0)}\\text{ kg}$, soit $${texNombre(2 * nbKilos, 0)}+${texNombre(nbKilos / 2, 0)}$.<br>
      $2$ fois $${texNombre(prixTotal, 0)}$ € font $${texNombre(2 * prixTotal, 0)}$ € et la moitié de $${texNombre(prixTotal, 0)}$ € est $${texNombre(prixMoitie, 0)}$ €.<br>
      Donc $${texNombre(nbKilosDemandes, 0)}\\text{ kg}$ coûtent $${texNombre(2 * prixTotal, 0)}+${texNombre(prixMoitie, 0)}=${miseEnEvidence(texNombre(resultat, 0))}$ €.`
    }

    this.canEnonce = ''
    this.canReponseACompleter = '$\\ldots$ €'
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(4, 10, 1.5, 'pommes')
    else this.enonce()
  }
}
