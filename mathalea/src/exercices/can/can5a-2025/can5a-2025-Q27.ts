import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomM } from '../../../lib/outils/Personne'
import { texPrix } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une somme'
export const interactifReady = true

export const uuid = 'a3x3b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q27 extends ExerciceCan {
  enonce(p?: string, a?: number, b?: number, c?: number) {
    let patisserie = 'un éclair'
    let patisserie2 = 'chouquettes'
    let chaque = 'chacune'
    if (p == null || a == null || b == null || c == null) {
      p = prenomM() as string
      chaque = 'chacun'
      patisserie = choice([
        'un éclair',
        'un mille-feuilles',
        'une religieuse',
        'une tarte aux pommes',
        'un flan patissier',
        'une meringue',
      ])
      patisserie2 = choice(['rochers coco', 'brownies', 'cookies', 'palmiers'])
      a = randint(2, 4)
      b = randint(3, 6)
      c = randint(4, 7) * 10
    }
    this.reponse = a + (b * c) / 100
    this.question = `${p} achète ${patisserie} à $${a}$ euros et $${b}$ ${patisserie2} à $${c}$ centimes ${chaque}. <br>
    Il doit payer :`
    this.correction = `Les $${b}$ ${patisserie2} coûtent : $${b}\\times ${c} = ${b * c}$ centimes, soit $${texPrix((b * c) / 100)}$ euros.<br>
    En tout, ${p} devra donc payer : $${texPrix((b * c) / 100)}+${a}=${miseEnEvidence(texPrix(a + (b * c) / 100))}$ euros.`

    this.optionsChampTexte = { texteApres: ' euros.' }
    this.canReponseACompleter = '$\\ldots $ euros'
    if (!this.interactif && context.isHtml) {
      this.question += ' $\\ldots$ euros'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('Paul', 2, 3, 60)
    else this.enonce()
  }
}
