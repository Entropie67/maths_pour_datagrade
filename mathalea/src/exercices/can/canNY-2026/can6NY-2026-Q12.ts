import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { prenomF } from '../../../lib/outils/Personne'
export const titre = 'Trouver un âge'
export const interactifReady = true

export const uuid = '65998'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ageATrouver2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: ' ans' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const a = this.canOfficielle ? 2040 : this.quotaRandint('a', 2040, 2080)
    const prenom = prenomF(1)
    this.question =
      'Si ' + prenom + ` naît en $${annee}$, quel âge aura-t-elle en $${a}$ ?`
    this.reponse = a - annee
    this.correction =
      prenom +
      ` aura $(${a}-${annee})$ ans, soit $${miseEnEvidence(texNombre(this.reponse))}$ ans.`
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
