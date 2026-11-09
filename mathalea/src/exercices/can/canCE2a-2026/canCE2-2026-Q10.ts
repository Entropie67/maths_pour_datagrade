import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une somme'
export const interactifReady = true

export const uuid = 'e9a84'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q10 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = choice([
        randint(2004, 2009),
        randint(3004, 2008),
        randint(4004, 2008),
      ]) // Nombre entre 2004 et 2009 ou entre 3004 et 3008 ou entre 4004 et 4008
      b = randint(7, 9) // Nombre à un chiffre
    }

    const somme = a + b

    this.question = `Calcule :<br>
    $${texNombre(a)}+${b}=$`

    this.correction = `$${texNombre(a)}+${b}=${miseEnEvidence(texNombre(somme))}$`

    this.canEnonce = `Calcule.`
    this.canReponseACompleter = `
    $${texNombre(a)}+${b}=\\ldots$`
    this.reponse = somme
    this.formatChampTexte = KeyboardType.clavierDeBase

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2007, 8)
    else this.enonce()
  }
}
