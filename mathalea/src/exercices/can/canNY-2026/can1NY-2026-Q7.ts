import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
export const titre = 'Donner une écriture scientifique'
export const interactifReady = true

export const uuid = 'gbgfa'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class ecritureScien2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = { texteSansCasse: true }
  }

  nouvelleVersion() {
    const annee = 2026
    const exposant = this.canOfficielle
      ? 0
      : this.quotaRandint('exposant', 0, 2)
    const a = new Decimal(annee).div(new Decimal(10).pow(exposant))
    this.question = `Donner l'écriture scientifique de $${texNombre(a)}$.`
    this.reponse = `${texNombre(annee / 1000, 3)}\\times10^${3 - exposant}`
    this.correction = `L'écriture scientifique de $${texNombre(a)}$ est $${miseEnEvidence(`${this.reponse}`)}$.`
    if (this.interactif) {
      this.question += `<br>$${texNombre(a)}=$`
    }
  }
}
