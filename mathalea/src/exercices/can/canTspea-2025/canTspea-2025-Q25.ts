import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer un terme d'une suite récurrente"
export const interactifReady = true

export const uuid = 'aa613'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ25 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.lycee
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: ` <br>$u_{${texNombre(2025, 0)}}=$` }
  }

  nouvelleVersion() {
    this.reponse = 1
    this.question =
      'Soit la suite $(u_n)$ définie par $u_0=1$ et pour tout $n\\in\\mathbb{N}$, $u_{n+1}=\\dfrac{1}{u_n}$.'

    if (!this.interactif) {
      this.question += `<br>$u_{${texNombre(2025, 0)}}=\\ldots$`
    }
    this.correction = `On constate que $u_1=\\dfrac{1}{1}=1$, la suite est constante. <br>
    Ainsi $u_{${texNombre(2025, 0)}}=${miseEnEvidence(1)}$.`
    this.canReponseACompleter = `$u_{${texNombre(2025, 0)}}=\\ldots$`
  }
}
