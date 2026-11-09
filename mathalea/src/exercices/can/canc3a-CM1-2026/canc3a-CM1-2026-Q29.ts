import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Ajouter une dizaine/centaine'
export const interactifReady = true

export const uuid = '7a46f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Éric Elter

*/
export default class Can2026CM1Q29 extends ExerciceCan {
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
        // Chiffre des dizaines = 9 pour forcer la retenue
        const centaines = randint(1, 9)
        const unites = randint(1, 9)
        nombre = centaines * 100 + 90 + unites
      } else {
        // Chiffre des centaines = 9 pour forcer la retenue
        const milliers = randint(1, 8)
        const dizaines = randint(1, 9)
        const unites = randint(1, 9)
        nombre = milliers * 1000 + 900 + dizaines * 10 + unites
      }
    }

    const valeur = quotite === 'dizaine' ? 10 : 100
    const resultat = nombre + valeur

    this.reponse = resultat.toString()

    this.question = `Ajoute une ${quotite} à $${texNombre(nombre, 0)}$.`
    this.correction = `Ajouter une ${quotite}, c'est ajouter $${texNombre(valeur, 0)}$.<br>
      $${texNombre(nombre, 0)}+${texNombre(valeur, 0)}=${miseEnEvidence(texNombre(resultat, 0))}$`

    this.canEnonce = `Ajoute une ${quotite} à $${texNombre(nombre, 0)}$.`
    this.canReponseACompleter = ''
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(8973, 'centaine')
    else this.enonce()
  }
}
