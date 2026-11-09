import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un prix avec une proportionnalité'
export const interactifReady = true

export const uuid = 'zacxo'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote
 */
const fruit = choice(['pommes', 'poires', 'pêches'])
export default class Can20266Q17 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' €' }
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(nbKilos?: number, prixUnitaire?: number, coeff?: number) {
    const fruit = choice(['pommes', 'poires', 'pêches'])
    if (nbKilos == null || prixUnitaire == null || coeff == null) {
      nbKilos = randint(1, 3) * 2
      prixUnitaire = choice([1.5, 2.5])
      coeff = choice([1.5, 2.5])
    }

    this.reponse = texNombre(nbKilos * coeff * prixUnitaire)
    this.question = `$${texNombre(nbKilos, 1)}\\text{ kg}$ de ${fruit} coûtent $${texNombre(nbKilos * prixUnitaire, 1)}$ €.<br>
    Combien coûtent $${texNombre(nbKilos * coeff, 2)}\\text{ kg}$ de ${fruit} ?`

    this.correction = `On peut calculer le prix d'un $\\text{kg}$ de ${fruit} en divisant le prix total par le nombre de $\\text{kg}$ :<br>
    $${texNombre(nbKilos * prixUnitaire, 1)}\\div${texNombre(nbKilos, 1)}=${texNombre(prixUnitaire, 1)}$ € par $\\text{kg}$.<br>
    Ainsi, $${texNombre(nbKilos * coeff, 2)}\\text{ kg}$ de ${fruit} coûtent $${texNombre(nbKilos * coeff, 2)}\\times${texNombre(prixUnitaire, 1)}=${miseEnEvidence(texNombre(nbKilos * coeff * prixUnitaire, 1))}$ €.`

    this.canEnonce = ''
    this.canReponseACompleter = '$\\ldots$ €'
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(2, 2.5, 1.5)
    else this.enonce()
  }
}
