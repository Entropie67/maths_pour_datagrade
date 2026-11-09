import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { prenomF } from '../../../lib/outils/Personne'
export const titre = 'Trouver une année'
export const interactifReady = true

export const uuid = 'r2s5h'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class anneeATrouver2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const a = this.canOfficielle ? 30 : this.quotaRandint('a', 30, 50)
    const prenom = prenomF(1)
    this.question =
      'Si ' +
      prenom +
      ` a $${a}$ ans en $${annee}$, en quelle année est-elle née  ?`
    this.reponse = annee - a
    this.correction = `Comme $${texNombre(annee)}-${a}=${texNombre(this.reponse, 0)}$, ${prenom} est née en $${miseEnEvidence(this.reponse)}$.`
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
