import { texPrix } from '../../../lib/format/style'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Utiliser une proportionnalité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '6de10'

export const refs = {
  'fr-fr': ['can6P1-01'],
  'fr-ch': [],
}
export default class ProportionnaliteSimple extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.optionsChampTexte = { texteApres: ' €' }
  }

  nouvelleVersion() {
    const fruits = [
      ['pêches', 4, 10, 30],
      ['noix', 5, 4, 13],
      ['cerises', 6, 11, 20],
      ['pommes', 2, 20, 40],
      ['framboises', 15, 1, 5],
      ['fraises', 7, 5, 10],
      ['citrons', 1.5, 15, 30],
      ['bananes', 1.5, 15, 25],
    ]
    const a = this.quotaRandint('a', 0, 7)
    const b = fruits[a][1] as number
    const c = randint(fruits[a][2] as number, fruits[a][3] as number)
    this.reponse = arrondi((c / 5) * b, 2)
    this.question = `$${texNombre(c / 10)}$ kg de ${fruits[a][0]} coûtent $${texPrix((c / 10) * b)}$ €,
    combien coûtent $${texNombre(c / 5)}$ kg de ${fruits[a][0]} ?`
    this.correction = `On reconnaît une situation de proportionnalité.<br>
    La masse de ${fruits[a][0]} est proportionnelle au prix payé.<br>
    On remarque qu'on demande le prix pour une quantité double ($${texNombre(c / 5)}=2\\times ${texNombre(c / 10)}$).<br>
    Ainsi, le prix à payer pour $${texNombre(c / 5)}$ kg de ${fruits[a][0]} est :  $${texPrix((c / 10) * b)} \\times 2 = ${miseEnEvidence(texPrix(this.reponse))}$ €`

    this.canReponseACompleter = '$\\dots$ €'
  }
}
