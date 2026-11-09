import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Ajouter un dixième ou un centième'
export const interactifReady = true

export const uuid = '132rb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Éric Elter

*/
export default class Can20266Q29 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = {
      texteAvant: '<br>',
    }
  }

  enonce(Nombre?: number, Quotite?: string) {
    if (Nombre == null) {
      Quotite = choice(['dixième', 'centième'])
      Nombre =
        Quotite === 'dixième'
          ? arrondi(
              randint(1, 9) * 10 + randint(1, 9) + 0.9 + randint(1, 9) / 100,
            )
          : arrondi(
              randint(1, 9) * 10 +
                randint(1, 9) / 10 +
                0.09 +
                randint(1, 9) / 1000,
            )
    }

    this.question = `Quel nombre obtient-on si on ajoute un ${Quotite} à $${texNombre(Nombre)}$ ?`
    this.reponse =
      Quotite === 'dixième'
        ? arrondi(Nombre + 0.1, 3)
        : arrondi(Nombre + 0.01, 3)
    const valeurDecimaleQuotite = Quotite === 'dixième' ? '0,1' : '0,01'
    this.correction = `$1$ ${Quotite} $=${valeurDecimaleQuotite}$, d'où $${texNombre(Nombre)}+${valeurDecimaleQuotite} =${miseEnEvidence(texNombre(this.reponse))}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2.93, 'dixième')
    else this.enonce()
  }
}
