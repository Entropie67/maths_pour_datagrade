import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer le quart d'une quantité"
export const interactifReady = true

export const uuid = 'f5788'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/
export default class PourcentageFacileCM2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let distance: number
    let unite: string

    if (this.canOfficielle) {
      distance = 60
      unite = 'km'
    } else {
      distance = randint(1, 9) * 10
      unite = choice(['km', 'm', 'kg', 'g'])
    }
    this.optionsChampTexte = { texteApres: unite, texteAvant: ' $=$' }

    this.reponse = distance.toFixed(0)
    this.question = `Le quart de $${texNombre(distance * 4, 0)}\\text{ ${unite}}$`

    this.canReponseACompleter = `$\\ldots$ ${unite}`
    this.correction = `Prendre le quart d'une quantité revient à la diviser par $4$. <br>
    Ainsi, le quart de $${texNombre(distance * 4, 0)}\\text{ ${unite}}$ est égal à $${texNombre(distance * 4, 0)}\\div 4=${miseEnEvidence(this.reponse)}\\text{ ${unite}}$.`
  }
}
