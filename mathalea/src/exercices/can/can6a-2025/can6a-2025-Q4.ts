import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Écrire un nombre en chiffres'
export const interactifReady = true

export const uuid = '51b60'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025N6Q4 extends ExerciceCan {
  enonce(
    chiffre?: [string, number][],
    chiffre2?: [string, number][],
    a?: number,
    b?: number,
    choix?: boolean,
  ) {
    if (
      chiffre == null ||
      chiffre2 == null ||
      a == null ||
      b == null ||
      choix == null
    ) {
      chiffre = [
        ['vingt', 20],
        ['trente', 30],
      ]
      chiffre2 = [
        ['deux', 2],
        ['trois', 3],
        ['quatre', 4],
        ['cinq', 5],
        ['six', 6],
        ['sept', 7],
        ['huit', 8],
        ['neuf', 9],
      ]
      a = randint(0, 1)
      b = randint(0, 7)
      choix = choice([true, false])
    }
    chiffre = [
      ['vingt', 20],
      ['trente', 30],
    ]
    chiffre2 = [
      ['deux', 2],
      ['trois', 3],
      ['quatre', 4],
      ['cinq', 5],
      ['six', 6],
      ['sept', 7],
      ['huit', 8],
      ['neuf', 9],
    ]
    this.question = `Écris, en chiffres, le nombre : 
 ${
   choix
     ? `${context.isHtml ? `<i>mille-${chiffre[a][0]}-${chiffre2[b][0]} </i>` : `\\textit{mille-${chiffre[a][0]}-${chiffre2[b][0]}} `}`
     : `${context.isHtml ? `<i>mille-${chiffre2[b][0]} </i>` : `\\textit{mille-${chiffre2[b][0]}} `}`
 }`

    this.reponse = choix
      ? texNombre(1000 + chiffre[a][1] + chiffre2[b][1], 0)
      : texNombre(1000 + chiffre2[b][1], 0)
    this.correction = ` ${
      choix
        ? `${context.isHtml ? `<i>mille-${chiffre[a][0]}-${chiffre2[b][0]} </i>` : `\\textit{mille-${chiffre[a][0]}-${chiffre2[b][0]}} `}`
        : `${context.isHtml ? `<i>mille-${chiffre2[b][0]} </i>` : `\\textit{mille-${chiffre2[b][0]}} `}`
    } $=${miseEnEvidence(this.reponse)}$`

    if (this.interactif) {
      this.question += ' <br> '
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce([['vingt', 20]], [['quatre', 4]], 0, 2, true)
    else this.enonce()
  }
}
