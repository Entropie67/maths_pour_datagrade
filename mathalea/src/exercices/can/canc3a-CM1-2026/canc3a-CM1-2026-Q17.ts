import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer la longueur d'un segment par comparaison"
export const interactifReady = true

export const uuid = '317bd'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025CM1Q17 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' €' }
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(
    nbKilos?: number,
    prixTotal?: number,
    nbKilosDemandes?: number,
    fruit?: string,
  ) {
    if (
      nbKilos == null ||
      prixTotal == null ||
      nbKilosDemandes == null ||
      fruit == null
    ) {
      fruit = choice(['pommes', 'poires', 'pêches', 'cerises'])
      do {
        const k = choice([2, 3, 4, 5])
        nbKilosDemandes = randint(2, 4)
        nbKilos = nbKilosDemandes * k
        prixTotal = k * randint(2, 6)
      } while (prixTotal === nbKilos)
    }
    const resultat = (prixTotal * nbKilosDemandes) / nbKilos

    this.reponse = texNombre(resultat, 0)
    this.question = `$${texNombre(nbKilos, 0)}\\text{ kg}$ de ${fruit} coûtent $${texNombre(prixTotal, 0)}$ €.<br>
    Combien coûtent $${texNombre(nbKilosDemandes, 0)}\\text{ kg}$ de ${fruit} ?`

    const rapport = nbKilos / nbKilosDemandes

    this.correction = `Pour passer de $${texNombre(nbKilos, 0)}\\text{ kg}$ à $${texNombre(nbKilosDemandes, 0)}\\text{ kg}$, on divise par $${texNombre(rapport, 0)}$.<br>
    $${texNombre(prixTotal, 0)} \\div ${texNombre(rapport, 0)} = ${miseEnEvidence(texNombre(resultat, 0))}$ €.`

    this.canEnonce = `$${texNombre(nbKilos, 0)}\\text{ kg}$ de ${fruit} coûtent $${texNombre(prixTotal, 0)}$ €.<br>
    Combien coûtent $${texNombre(nbKilosDemandes, 0)}\\text{ kg}$ de ${fruit} ?`
    this.canReponseACompleter = '$\\ldots$ €'
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(8, 20, 2, 'pommes')
    else this.enonce()
  }
}
