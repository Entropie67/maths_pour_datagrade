import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Convertir des m en cm'
export const interactifReady = true

export const uuid = 'ab0ff'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM1Q29 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 3 : randint(2, 29)
    this.reponse = texNombre(a * 100, 0)
    this.question = `Complète : <br> $${a}\\text{ m}$ $=$ `
    this.correction = ` $1\\text{ m}$ $=100\\text{ cm}$<br>
      Ainsi, pour passer des $\\text{m}$ aux $\\text{cm}$, on multiplie par $100$.<br>
        Comme $${a}\\times 100 =${texNombre(a * 100, 1)}$, alors $${a}\\text{ m}=${miseEnEvidence(texNombre(a * 100, 1))}\\text{ cm}$. `
    this.canReponseACompleter = ` $${a}\\text{ m}$ $=\\ldots\\text{ cm}$`
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: '$\\text{ cm}$' }
    } else {
      this.question += `${context.isHtml ? '$\\ldots\\text{ cm}$' : ''}`
    }

    this.canEnonce = 'Complète.'
  }
}
