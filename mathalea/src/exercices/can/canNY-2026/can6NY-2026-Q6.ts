import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Soustraire un décimal'
export const interactifReady = true

export const uuid = '5bjcc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class soustraireDecimal2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = new Decimal(2026)
    const a = this.canOfficielle
      ? new Decimal('1.5')
      : new Decimal(this.quotaRandint('a', 0, 4) * 2 + 1).div(2)
    this.reponse = annee.sub(a).toFixed(1)
    this.question = `$${texNombre(annee, 0)}-${texNombre(a, 1)}$`
    this.correction = `$${texNombre(annee, 0)}-${texNombre(a, 1)}=${miseEnEvidence(texNombre(annee.sub(a), 1))}$`
  }
}
