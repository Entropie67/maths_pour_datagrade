import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Résoudre un problème avec une différence'
export const interactifReady = true

export const uuid = 'd7ce2'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/

export default class QuestionDeDifference extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let nbCarteGagnee: number
    let nbCarteTotale: number
    if (this.canOfficielle) {
      nbCarteGagnee = 6
      nbCarteTotale = 11
    } else {
      nbCarteGagnee = randint(5, 9)
      nbCarteTotale = nbCarteGagnee + randint(4, 9)
    }
    this.question = `À midi, j'ai gagné $${nbCarteGagnee}$ cartes.<br>J'en ai maintenant $${nbCarteTotale}$.<br>Combien en avais-je ce matin ?`

    this.canReponseACompleter = "Ce matin, j'avais $\\ldots$ cartes"
    this.reponse = texNombre(nbCarteTotale - nbCarteGagnee, 0)
    this.correction = `Ce matin, j'avais $${miseEnEvidence(this.reponse)}$ cartes.<br>`
    this.correction += `En effet, $${miseEnEvidence(this.reponse)}+${texNombre(nbCarteGagnee, 0)} = ${texNombre(nbCarteTotale, 0)}$.`
  }
}
