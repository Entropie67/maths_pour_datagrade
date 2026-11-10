import { texPrix } from '../../../lib/format/style'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Utiliser une proportionnalité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote (quelques modif Gilles)
 * Créé pendant l'été 2021

 */
export const uuid = '5e28d'

export const refs = {
  'fr-fr': ['can6P1-02', '6P3C-flash1'],
  'fr-ch': [],
}
export default class ProportionnaliteCompliquee extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.optionsChampTexte = { texteApres: ' €' }
  }

  nouvelleVersion() {
    const fruits = [
      ['pêches', 4, 3, 7],
      ['noix', 5, 4, 9],
      ['cerises', 6, 4, 7],
      ['pommes', 2, 3, 9],
      ['framboises', 15, 3, 6],
      ['fraises', 7, 4, 7],
      ['citrons', 1.5, 3, 7],
      ['bananes', 1.5, 3, 8],
    ]

    const a = this.quotaRandint('a', 0, 7) // index du fruit
    const b =
      (fruits[a][1] as number) *
      this.quotaChoice('coeff', [1.1, 1.2, 1.3, 0.9, 0.8, 0.7]) // prix au kg
    // const b = new Decimal(fruits[a][1] * (1 + choice([-1, 1]) * randint(1, 3) * 0.1)) // prix au kg
    const c = randint(fruits[a][2] as number, fruits[a][3] as number) // nombre de kg première valeur
    const d = randint(3, 6, c) // nombre de kg supplémentaires
    this.reponse = b * d
    this.question = `$${c}$ kg de ${fruits[a][0]} coûtent $${texPrix(c * b)}$ €.<br> $${c + d}$ kg de ces mêmes ${fruits[a][0]} coûtent $${texPrix((c + d) * b)}$ €.<br>
    Combien coûtent $${d}$ kg de ces ${fruits[a][0]} ?`
    this.correction = `On reconnaît une situation de proportionnalité. <br>
    La masse de fruits est proportionnelle au prix payé.<br>
    On remarque que le prix demandé est celui qui correspond à la différence des deux masses données dans la question. <br>
    Ainsi, le prix est alors donné par la différence des deux prix. <br>
      On a  $${d}$ kg $= ${c + d}$ kg $-$ $${c}$ kg, donc les $${d}$ kg de ${fruits[a][0]} coûteront $${texPrix((c + d) * b)}$ € $ - ${texPrix(c * b)}$ € $ =${miseEnEvidence(texPrix(this.reponse))}$ €.`
    this.reponse = this.reponse.toFixed(2)

    this.canReponseACompleter = '$\\dots$ €'
  }
}
