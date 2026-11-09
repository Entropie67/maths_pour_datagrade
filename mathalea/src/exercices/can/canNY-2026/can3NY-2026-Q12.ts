import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { abs } from '../../../lib/outils/nombres'
import FractionEtendue from '../../../modules/FractionEtendue'
export const titre = 'Simplifier une fraction simple'
export const interactifReady = true

export const uuid = 'yhwly'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class simplifierFractionSimple2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const annee = 2026
    const n = this.canOfficielle
      ? -annee
      : this.quotaChoice('n', [annee, -annee])
    const d = this.canOfficielle
      ? annee
      : this.quotaChoice('d', [-1, annee, -annee])
    const signe = n * d < 0 ? '-' : ''
    this.reponse = new FractionEtendue(n, d).texFractionSimplifiee
    this.question = `Écrire le plus simplement possible : $\\dfrac{${texNombre(n)}}{${texNombre(d)}}$.`
    this.correction = `$\\dfrac{${texNombre(n)}}{${texNombre(d)}}=`
    this.correction += !(signe === '' && n > 0)
      ? `${signe}\\dfrac{${texNombre(abs(n))}}{${texNombre(abs(d))}}=`
      : ''
    this.correction += `${miseEnEvidence(this.reponse)}$`
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
