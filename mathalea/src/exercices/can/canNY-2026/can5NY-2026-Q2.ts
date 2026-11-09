import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec des décimaux'
export const interactifReady = true

export const uuid = 'oowsf'
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
    const annee = 2026
    const a = new Decimal(annee).div(
      this.canOfficielle
        ? 100
        : this.quotaChoice('diviseur', [10, 100, 1000, 10000]),
    )
    this.reponse = texNombre(new Decimal(annee).add(a), 5)
    this.question = `$${texNombre(annee)}+${texNombre(a, 4)}$`
    this.correction = `$${texNombre(annee)}+${texNombre(a, 4)}=${miseEnEvidence(this.reponse)}$`
  }
}
