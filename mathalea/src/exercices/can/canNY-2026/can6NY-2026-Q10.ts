import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Décomposer un nombre'
export const interactifReady = true

export const uuid = 'qn8vm'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class SommeDeProduitsCompleter2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const den = this.canOfficielle
      ? 10
      : this.quotaChoice('den', [10, 100, 1000])
    const a = new Decimal(annee).div(den)
    this.reponse = texNombre(a, 3)
    this.question = 'Écrire, sous forme décimale, la fraction suivante.'
    this.question += `<br><br>
            $\\dfrac{${texNombre(annee, 0)}}{${texNombre(den, 0)}}$`
    this.correction = `$\\dfrac{${texNombre(annee, 0)}}{${texNombre(den, 0)}}=${miseEnEvidence(texNombre(a, 3))}$`
  }
}
