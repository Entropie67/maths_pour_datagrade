import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Question $12$'
export const interactifReady = true

export const uuid = '4r5kj'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ12 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number, c?: number, signe?: string) {
    if (a == null || b == null || c == null || signe == null) {
      const puissance10 = 100
      c = randint(11, 39) // Le facteur commun
      signe = choice(['+', '-'])

      if (signe === '+') {
        // a + b doit être égal à 10 ou 100
        const somme = puissance10
        b = randint(7, somme - 1)
        a = somme - b
      } else {
        // a - b doit être égal à 10 ou 100
        const difference = puissance10
        b = randint(1, 20)
        a = difference + b
      }
    }

    const reponse = signe === '+' ? (a + b) * c : (a - b) * c
    const facteur = signe === '+' ? a + b : a - b

    this.question =
      signe === '+'
        ? `$${a}\\times ${c}+${b}\\times ${c}$`
        : `$${a}\\times ${c}-${b}\\times ${c}$`

    this.correction =
      signe === '+'
        ? `$\\begin{aligned}
    ${a}\\times ${c}+${b}\\times ${c}&=(${a}+${b})\\times ${c}\\\\
    &=${facteur}\\times ${c}\\\\
    &=${miseEnEvidence(texNombre(reponse, 1))}
    \\end{aligned}$`
        : `$\\begin{aligned}
    ${a}\\times ${c}-${b}\\times ${c}&=(${a}-${b})\\times ${c}\\\\
    &=${facteur}\\times ${c}\\\\
    &=${miseEnEvidence(texNombre(reponse, 1))}
    \\end{aligned}$`
    if (this.interactif) {
      this.question += ' $=$'
    }

    this.reponse = reponse
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(114, 14, 26, '-')
    else this.enonce()
  }
}
