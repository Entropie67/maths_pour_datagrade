import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import Trinome from '../../../modules/Trinome'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec une valeur particulière'
export const interactifReady = true

export const uuid = 'fca9d'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculValeurParticuliere extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const p = this.canOfficielle
      ? new Trinome(1, 1, -1)
      : new Trinome(1, randint(1, 3), randint(1, 5))
    const val = this.canOfficielle ? 3 : randint(2, 5)
    this.reponse = val ** 2 + p.b.valeurDecimale * val + p.c.valeurDecimale
    this.question = `$${p.tex}$ pour $x=${val}$`
    if (this.interactif) {
      this.question += '<br>'
    }
    this.correction = `Pour $x=${val}$, on obtient : $${p.texCalculImage(val)}$<br>
     Pour $x=${val}$, $${p.tex}$ prend la valeur $${miseEnEvidence(this.reponse)}$.`
  }
}
