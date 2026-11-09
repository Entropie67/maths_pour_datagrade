import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import Trinome from '../../../modules/Trinome'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une image par une fonction'
export const interactifReady = true

export const uuid = 'cfa5e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculImage extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const p = this.canOfficielle
      ? new Trinome(1, -4, 1)
      : new Trinome(1, randint(1, 5), 1)
    const val = this.canOfficielle ? -1 : randint(-6, -1)
    this.reponse = val ** 2 + p.b.valeurDecimale * val + p.c.valeurDecimale
    this.question = `$f(x)=${p.tex}$`
    if (this.interactif) {
      this.question += `<br>$f(${val})=$`
    } else {
      this.question += `<br>$f(${val})=\\ldots$`
    }
    this.correction = `$f(${val})=${p.texCalculImage(val)}$<br>
    On a donc $f(${val})=${miseEnEvidence(this.reponse)}$.`

    this.canEnonce = `$f(x)=${p.tex}$`
    this.canReponseACompleter = `$f(${val})=\\ldots$`
  }
}
