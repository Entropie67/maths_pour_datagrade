import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Convertir en mm'
export const interactifReady = true

export const uuid = '1217e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM2Q29 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 54 : randint(51, 69, 60)
    this.reponse = texNombre(a * 10, 0)
    this.question = `Complète : <br> $${a}\\text{ cm}$ $=$ `
    this.correction = ` $1\\text{ cm}$ $=10\\text{ mm}$<br>
      Ainsi, pour passer des $\\text{cm}$ aux $\\text{mm}$, on multiplie par $10$.<br>
        Comme $${a}\\times 10 =${texNombre(a * 10, 1)}$, alors $${a}\\text{ cm}=${miseEnEvidence(texNombre(a * 10, 1))}\\text{ mm}$. `
    this.canReponseACompleter = ` $${a}\\text{ cm}$ $=\\ldots\\text{ mm}$`
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: '$\\text{ mm}$' }
    } else {
      this.question += `${context.isHtml ? '$\\ldots\\text{ mm}$' : ''}`
    }

    this.canEnonce = 'Complète.'
  }
}
