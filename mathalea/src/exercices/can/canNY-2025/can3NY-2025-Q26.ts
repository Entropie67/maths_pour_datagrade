import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Calculer une image'
export const interactifReady = true

export const uuid = '28fc0'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class calculImage extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  nouvelleVersion() {
    const c = this.quotaRandint('c', -5, -1)
    this.question = `$f(x)=x^2+${texNombre(2025, 0)}$<br>`
    this.reponse = c * c + 2025
    this.correction = `$f(${c})=(${c})^2+${texNombre(2025, 0)}$<br>`
    this.correction += `$f(${c})=${c * c}+${texNombre(2025, 0)}$<br>`
    this.correction += `$f(${c})=${miseEnEvidence(texNombre(this.reponse))}$`
    if (this.interactif) {
      this.question += `$f(${c})=$`
    } else {
      this.question += `Calculer $f(${c})$.`
    }
    this.canEnonce = `$f(x)=x^2+${texNombre(2025, 0)}$`
    this.canReponseACompleter = `$f(${c})=\\ldots$`
  }
}
