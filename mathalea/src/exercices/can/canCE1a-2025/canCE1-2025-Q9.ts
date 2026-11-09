import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Trouver un nombre'
export const interactifReady = true

export const uuid = '89ece'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025CE1Q9 extends ExerciceCan {
  enonce(
    chiffre?: [string, number][],
    chiffre2?: [string, number][],
    a?: number,
    b?: number,
  ) {
    if (chiffre == null || chiffre2 == null || a == null || b == null) {
      chiffre = [
        ['quatre-vingt', 80],
        ['soixante', 60],
      ]
      chiffre2 = [
        ['onze', 11],
        ['douze', 12],
        ['treize', 13],
        ['quatorze', 14],
        ['quinze', 15],
        ['seize', 16],
        ['dix-sept', 17],
        ['dix-huit', 18],
        ['dix-neuf', 19],
      ]
      a = randint(0, 1)
      b = randint(0, 8)
    }
    chiffre = [
      ['quatre-vingt', 80],
      ['soixante', 60],
    ]
    chiffre2 = [
      ['onze', 11],
      ['douze', 12],
      ['treize', 13],
      ['quatorze', 14],
      ['quinze', 15],
      ['seize', 16],
      ['dix-sept', 17],
      ['dix-huit', 18],
      ['dix-neuf', 19],
    ]
    this.question = `Écris en chiffres : 
                             ${context.isHtml ? `<i>cent-${chiffre[a][0]}-${chiffre2[b][0]} </i>` : `\\textit{cent-${chiffre[a][0]}-${chiffre2[b][0]}} `}`
    this.reponse = 100 + chiffre[a][1] + chiffre2[b][1]
    this.correction = ` ${context.isHtml ? `<i>cent-${chiffre[a][0]}-${chiffre2[b][0]} </i>` : `\\textit{cent-${chiffre[a][0]}-${chiffre2[b][0]}} `} $=
                             ${miseEnEvidence(100 + chiffre[a][1] + chiffre2[b][1])}$ `

    if (this.interactif) {
      this.question += ' <br> '
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce([['quatre-vingt', 80]], [['douze', 12]], 0, 1)
    else this.enonce()
  }
}
