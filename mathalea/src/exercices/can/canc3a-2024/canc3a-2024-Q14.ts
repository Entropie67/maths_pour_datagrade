import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Multiplier par 10, ...'
export const interactifReady = true

export const uuid = 'f195a'

/**
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)
 */

export default class MultiplieDixiemeCM2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatInteractif = 'fillInTheBlank'
    this.canOfficielle = false
    this.consigne = 'Complète :'
  }

  nouvelleVersion() {
    let nb: number
    let puissance: number
    if (this.canOfficielle) {
      puissance = 1
      nb = 41
    } else {
      puissance = randint(1, 3)
      nb = randint(6, 9) * 10 + randint(6, 9) * 10 ** (puissance - 1)
    }
    this.reponse = { champ1: { value: texNombre(10 ** puissance, 3) } }
    this.question = ` %{champ1}\\times ${texNombre(nb / 10 ** puissance, 3)}=${texNombre(nb, 0)}`
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$\\ldots\\times ${texNombre(nb / 10 ** puissance, 3)}=${texNombre(nb, 0)}$`
    this.correction = `Le chiffre des dixièmes du nombre de départ est devenu le chiffre des ${puissance === 1 ? 'unités' : puissance === 2 ? 'dizaines' : 'centaines'}.<br>
    C'est donc que le nombre a été multiplié par $1$ ${puissance === 1 ? 'dizaine' : puissance === 2 ? 'centaine' : 'millier'}.<br>`
    this.correction += `Donc $${miseEnEvidence(texNombre(10 ** puissance, 3))}\\times ${texNombre(nb / 10 ** puissance, 3)}=${texNombre(nb, 0)}$`
  }
}
