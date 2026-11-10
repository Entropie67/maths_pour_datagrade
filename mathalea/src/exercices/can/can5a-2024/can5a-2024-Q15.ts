import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Calculer une quatrième proportionnelle dans un tableau de proportionnalité'
export const interactifReady = true

export const uuid = 'b3169'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 35
      this.question = 'On donne le tableau de proportionnalité :<br>'
      this.question += `${context.isHtml ? '<br>' : ''}`
      this.question += tableauColonneLigne([8, 5], [56], ['?']) + '<br>'
      this.correction = `On constate que $56$ s'obtient en multipliant $8$ par $7$.
          Ainsi, on obtient la quatrième proportionnelle en multipliant $5$ par $7$.<br>
          La valeur cherchée est donc $5\\times 7=${miseEnEvidence('35')}$.`
    } else {
      const a = randint(1, 6)
      const k = randint(3, 9)
      const b = a * k
      const c = randint(1, 9, a)
      this.reponse = c * k
      this.question = 'On donne le tableau de proportionnalité :<br>'
      this.question += `${context.isHtml ? '<br>' : ''}`
      this.question += tableauColonneLigne([a, b], [c], [''])
      this.question += '<br>'
      this.correction = `On constate que $${b}$ s'obtient en multipliant $${a}$ par $${k}$.
          Ainsi, on obtient la quatrième proportionnelle en multipliant $${c}$ par $${k}$.<br>
          La valeur cherchée est donc $${c}\\times ${k}=${miseEnEvidence(k * c)}$.`
    }

    this.canReponseACompleter = '? $=\\ldots$'
    if (!this.interactif) {
      this.question += '? $=\\ldots$'
    } else {
      this.question += '? $=$'
    }
  }
}
