import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Rechercher un nombre'
export const interactifReady = true

export const uuid = '1836e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class rechercherUnNombre extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 5, 20)
    this.reponse = texNombre(a, 0)

    this.question = `En ajoutant un nombre à $${texNombre(2025, 0)}$, on obtient $${texNombre(2025 + a, 0)}$.<br>
        Quel nombre a-t-on ajouté ?`
    this.correction = `Comme $${a}+ ${texNombre(2025, 0)}=${texNombre(2025 + a, 0)}$, 
        le nombre ajouté est $${miseEnEvidence(this.reponse)}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
