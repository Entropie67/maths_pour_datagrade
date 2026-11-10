import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer le périmètre d'un cercle"
export const interactifReady = true

export const uuid = '416d2'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class PerimetreCercle extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: '$\\text{ cm}$' }
  }

  nouvelleVersion() {
    const r = this.canOfficielle ? 10 : randint(3, 12)
    const reponse = `${2 * r}\\times \\pi`
    this.reponse = reponse
    this.question = `Valeur exacte du périmètre du cercle de rayon $${r}\\text{ cm}$`
    this.correction = `Le périmètre d'un cercle de rayon $r$ est $2\\times \\pi\\times r$. <br>  
         Comme $r=${r}$, la valeur exacte du périmètre est : $${miseEnEvidence(reponse)}\\text{ cm}$.`

    this.canReponseACompleter = '$\\ldots\\text{ cm}$'
    if (!this.interactif) {
      this.question += ' $\\ldots\\text{ cm}$.'
    }
  }
}
