import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Déterminer un chiffre'
export const interactifReady = true

export const uuid = 'b26na'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ChiffreADeterminer2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const chiffreUnites = annee % 10
    const u = this.canOfficielle ? 5 : this.quotaRandint('u', 3, 9)
    const d = this.canOfficielle ? 2 : this.quotaRandint('d', 1, 9)
    const nbre = d * 10 + u
    this.question = `Le chiffre des unités de $${texNombre(annee)}+${nbre}$ est : `
    if (u < 10 - chiffreUnites) {
      this.reponse = chiffreUnites + u
    } else {
      this.reponse = chiffreUnites + u - 10
    }
    this.correction = `En additionnant les deux chiffres des unités, on trouve $${chiffreUnites}+${u}=${chiffreUnites + u}$. <br>
            Le chiffre des unités est donc $${miseEnEvidence(texNombre(this.reponse, 0))}$.`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = `Le chiffre des unités de $${texNombre(annee)}+${nbre}$ est : $\\ldots$`
  }
}
