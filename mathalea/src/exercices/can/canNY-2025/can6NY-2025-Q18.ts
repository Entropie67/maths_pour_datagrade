import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Déterminer un chiffre'
export const interactifReady = true

export const uuid = '4297f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ChiffreADeterminer extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const u = this.quotaRandint('u', 4, 9)
    const d = this.quotaRandint('d', 1, 9)
    const nbre = d * 10 + u
    this.question = `Le chiffre des unités de $${texNombre(2025)}+${nbre}$ est : `
    if (u < 5) {
      this.reponse = 5 + u
    } else {
      this.reponse = 5 + u - 10
    }
    this.correction = `En additionnant les deux chiffres des unités, on trouve $5+${u}=${5 + u}$. <br>
            Le chiffre des unités est donc $${miseEnEvidence(texNombre(this.reponse, 0))}$.`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = `Le chiffre des unités de $${texNombre(2024)}+${nbre}$ est : $\\ldots$`
  }
}
