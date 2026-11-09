import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une somme'
export const interactifReady = true

export const uuid = 'c5f04'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q2 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  enonce(a?: number, b?: number) {
    let millier: number, centaines: number

    if (a == null || b == null) {
      const m = randint(1, 9)
      const c = randint(1, 6)
      const d = randint(1, 9)
      const u = randint(1, 9)
      const centainesAjoutees = choice(
        [3, 4, 6, 7, 8, 9].filter((x) => x + c < 10),
      )
      millier = m * 1000 + c * 100 + d * 10 + u
      centaines = centainesAjoutees * 100
    } else {
      millier = a
      centaines = b
    }

    const somme = millier + centaines

    this.reponse = String(somme)
    if (this.interactif) {
      this.question = `$${texNombre(millier)}+${centaines}=$`
    } else {
      this.question = `$${texNombre(millier)}+${centaines}=\\ldots$`
    }

    this.correction = `$${texNombre(millier)}+${centaines}=${miseEnEvidence(texNombre(somme))}$`

    this.canEnonce = 'Calcule.'
    this.canReponseACompleter = `$${texNombre(millier)}+${centaines}=\\ldots$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1462, 300)
    else this.enonce()
  }
}
