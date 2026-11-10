import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec des décimaux'
export const interactifReady = true

export const uuid = '17caa'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class calcAvecDecimaux extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.optionsChampTexte = { texteAvant: ' $=$' }

    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = new Decimal(2025).div(
      this.quotaChoice('diviseur', [10, 100, 1000, 10000]),
    )
    this.reponse = texNombre(new Decimal(2025).add(a), 5)
    this.question = `$${texNombre(2025)}+${texNombre(a, 4)}$`
    this.correction = `$${texNombre(2025)}+${texNombre(a, 4)}=${miseEnEvidence(this.reponse)}$`
  }
}
