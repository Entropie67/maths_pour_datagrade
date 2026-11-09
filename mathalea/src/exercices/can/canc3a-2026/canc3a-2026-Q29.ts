import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Enlever une centaine'
export const interactifReady = true

export const uuid = '5aece'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Éric Elter

*/
export default class Can2026CM2Q29 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = {
      texteAvant: '<br>',
    }
  }

  enonce(nombre?: number, quotite?: string) {
    if (nombre == null || quotite == null) {
      quotite = choice(['dizaine', 'centaine'])
      if (quotite === 'dizaine') {
        // Nombre à 3 chiffres avec 0 au chiffre des dizaines pour forcer la retenue
        // Exemples : 308, 507, 204...
        const centaines = randint(2, 9)
        const unites = randint(1, 9)
        nombre = centaines * 100 + unites
      } else {
        // Nombre à 4 chiffres avec 0 au chiffre des centaines pour forcer la retenue
        // Exemples : 2 054, 3 019, 5 067...
        const milliers = randint(1, 9)
        const dizaines = randint(1, 9)
        const unites = randint(1, 9)
        nombre = milliers * 1000 + dizaines * 10 + unites
      }
    }

    const valeur = quotite === 'dizaine' ? 10 : 100
    const resultat = nombre - valeur

    this.reponse = resultat.toString()

    this.question = `Enlève une ${quotite} à $${texNombre(nombre, 0)}$.`
    this.correction = `Enlever une ${quotite}, c'est enlever $${texNombre(valeur, 0)}$.<br>
      $${texNombre(nombre, 0)}-${texNombre(valeur, 0)}=${miseEnEvidence(texNombre(resultat, 0))}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2054, 'centaine')
    else this.enonce()
  }
}
