import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = ''
export const interactifReady = true

export const uuid = 'm650d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculRetrancher2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const a = this.canOfficielle ? 3 : this.quotaRandint('a', 1, 9)
    const d = new Decimal(a).div(10)
    const c = new Decimal(a).div(100)
    switch (
      this.canOfficielle ? 1 : this.quotaRandint('typeDeQuestions', 1, 2)
    ) {
      case 1:
        this.question = `Quel nombre obtient-on en retranchant $${a}$ ${a === 1 ? 'dixième' : 'dixièmes'} à $${texNombre(annee, 0)}$ ?`
        this.reponse = texNombre(new Decimal(annee).sub(d), 1)
        this.correction = `$${texNombre(annee, 0)} -${texNombre(d, 1)}=${miseEnEvidence(this.reponse)}$`
        break
      case 2:
        this.question = `Quel nombre obtient-on en retranchant $${a}$ ${a === 1 ? 'centième' : 'centièmes'} à $${texNombre(annee, 0)}$ ?`
        this.reponse = texNombre(new Decimal(annee).sub(c), 2)
        this.correction = `$${texNombre(annee)} -${texNombre(c, 2)}=${miseEnEvidence(this.reponse)}$`
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
