import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { prenomM } from '../../../lib/outils/Personne'
export const titre = ''
export const interactifReady = true

export const uuid = '1c133'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculDivers extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choixM = prenomM()
    const pm = this.quotaRandint('pm', 1, 9) * 100 + 25
    switch (this.quotaRandint('choix', 1, 2)) {
      case 1:
        this.question = `Louise a une collection de timbres qui est composée de $${texNombre(2025, 0)}$ timbres.<br>
         ${choixM} en possède $${pm}$ de plus.<br>
         Combien en a-t-il ?`
        this.reponse = texNombre(2025 + pm, 0)
        this.correction = ` ${choixM} possède $${pm}$ timbres de plus que Louise.<br>
        $${texNombre(2025, 0)} + ${pm}=${this.reponse}$<br>
         ${choixM} a $${miseEnEvidence(this.reponse)}$ timbres.`
        break
      case 2:
        this.question = `Louise a une collection de timbres qui est composée de $${texNombre(2025, 0)}$ timbres.<br>
        ${choixM} en possède $${pm}$ de moins.<br>
        Combien en a-t-il ?`
        this.reponse = texNombre(2025 - pm, 0)
        this.correction = ` ${choixM}  possède $${pm}$ timbres de moins que Louise.<br>
       $${texNombre(2025, 0)} - ${pm}=${this.reponse}$<br>
      ${choixM} en a $${miseEnEvidence(this.reponse)}$ timbres.`
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
