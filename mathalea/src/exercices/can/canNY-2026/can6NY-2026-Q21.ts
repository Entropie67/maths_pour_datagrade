import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Rechercher un nombre'
export const interactifReady = true

export const uuid = 'zs3q3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class rechercherUnNombre2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const a = this.canOfficielle ? 6 : this.quotaRandint('a', 5, 20)
    this.reponse = texNombre(a, 0)

    this.question = `En ajoutant un nombre à $${texNombre(annee, 0)}$, on obtient $${texNombre(annee + a, 0)}$.<br>
        Quel nombre a-t-on ajouté ?`
    this.correction = `Comme $${a}+ ${texNombre(annee, 0)}=${texNombre(annee + a, 0)}$, 
        le nombre ajouté est $${miseEnEvidence(this.reponse)}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
