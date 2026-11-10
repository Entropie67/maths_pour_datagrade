import { createList } from '../../../lib/format/lists'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Programme de calcul'
export const interactifReady = true

export const uuid = 'f776b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q19 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(2, 8)
      b = randint(3, 9, a)
      c = -randint(2, 5)
    }
    this.question = 'Voici un programme de calcul :<br>'
    const liste = createList({
      items: [
        'Choisir un nombre ;',
        `Multiplier par $${a}$ ;`,
        `Ajouter $${b}$.<br><br>`,
      ],
      style: 'fleches',
    })
    this.question += `${liste}Quel nombre obtient-on si le nombre choisi est $${c}$ ?`
    this.correction = `
    On multiplie le nombre choisi par $${a}$, on obtient : $${a} \\times (${c}) = ${a * c}$.<br>
    On ajoute $${b}$ au résultat précédent : $${a * c}+ ${b} = ${miseEnEvidence(a * c + b)}$.`

    this.reponse = String(a * c + b)
    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 5, -4)
    else this.enonce()
  }
}
