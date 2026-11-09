import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Trouver un reste dans une division euclidienne'
export const interactifReady = true

export const uuid = '1cf22'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class resteDivEuclido extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', [2, 5, 10, 20, 100, 1000, 2000])

    this.reponse = 2025 % a
    this.question = `Quel est le reste de la division euclidienne de $${texNombre(2025, 0)}$ par $${texNombre(a)}$ ?`
    if (this.reponse === 0) {
      this.correction = `$${texNombre(2025, 0)}$ est divisible par $${a}$, donc le reste est $${miseEnEvidence('0')}$.`
    } else {
      this.correction = `$${texNombre(2025, 0)}=${texNombre(a)}\\times ${texNombre((2025 - this.reponse) / a, 0)}+${this.reponse}$<br>
            Donc le reste est $${miseEnEvidence(texNombre(this.reponse, 0))}$.`
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
