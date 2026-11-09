import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Écriture décimale'
export const interactifReady = true

export const uuid = 'a343q'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q11 extends ExerciceCan {
  enonce(a?: number, categA?: string, b?: number, categB?: string) {
    let aa = 100
    let bb = 0.1
    if (a == null || b == null || categA == null || categB == null) {
      a = this.quotaRandint('a', 2, 9)
      b = randint(2, 9, a)
      categA = this.quotaChoice('categA', ['dizaines', 'centaines', 'milliers'])
      categB = this.quotaChoice('categB', [
        'dixièmes',
        'centièmes',
        'millièmes',
      ])
      aa = categA === 'dizaines' ? 10 : categA === 'centaines' ? 100 : 1000
      bb = categB === 'dixièmes' ? 0.1 : categB === 'centièmes' ? 0.01 : 0.001
    }
    this.reponse = a * aa + b * bb
    this.question = `Écriture décimale du nombre $${a}$ ${categA} et $${b}$ ${categB}`
    this.correction = `$${a}$ ${categA} et $${b}$ ${categB} est égal à : <br>
    $${a}\\times ${texNombre(aa)} + ${b}\\times ${texNombre(bb, 3)} = ${texNombre(a * aa, 0)}+${texNombre(b * bb, 3)} = ${miseEnEvidence(texNombre(a * aa + b * bb, 3))}$`

    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 'centaines', 3, 'dixièmes')
    else this.enonce()
  }
}
