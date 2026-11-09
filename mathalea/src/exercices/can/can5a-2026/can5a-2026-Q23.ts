import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter une suite logique'
export const interactifReady = true

export const uuid = 'e21zf'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q23 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(premier?: number, raison?: number) {
    if (premier == null || raison == null) {
      // Génération aléatoire
      premier = choice([
        13, 14, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29,
      ])
      raison = randint(7, 9)
    }

    const terme2 = premier + raison
    const terme3 = premier + 2 * raison
    const reponse = premier + 3 * raison

    this.question = `Complète la suite logique :<br>
$${premier}$ ${sp(2)} ; ${sp(2)} $${terme2}$ ${sp(2)} ; ${sp(2)} $${terme3}$ ${sp(2)} ; ${sp(2)} ?`

    this.correction = `On obtient un terme de cette suite en ajoutant $${raison}$ au terme précédent.<br>
Ainsi, ? $=${miseEnEvidence(reponse)}$.`

    this.reponse = reponse

    this.canReponseACompleter = '? $=\\ldots$'

    if (!this.interactif) {
      this.question += '<br>? $=\\ldots$'
    } else {
      this.question += '<br>? $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(17, 9)
    else this.enonce()
  }
}
