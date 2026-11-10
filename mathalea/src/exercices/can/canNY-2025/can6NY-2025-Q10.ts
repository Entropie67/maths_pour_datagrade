import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Décomposer un nombre'
export const interactifReady = true

export const uuid = '00198'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class SommeDeProduitsCompleter extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const den = this.quotaChoice('den', [10, 100, 1000])
    const a = new Decimal(2025).div(den)
    this.reponse = texNombre(a, 3)
    this.question = 'Écrire, sous forme décimale, la fraction suivante.'
    this.question += `<br><br>
            $\\dfrac{${texNombre(2025, 0)}}{${texNombre(den, 0)}}$`
    this.correction = `$\\dfrac{${texNombre(2025, 0)}}{${texNombre(den, 0)}}=${miseEnEvidence(texNombre(a, 3))}$`
  }
}
