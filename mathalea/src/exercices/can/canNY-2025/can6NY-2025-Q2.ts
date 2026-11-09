import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer des sommes ou différences'
export const interactifReady = true

export const uuid = '6e29b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculsNombres extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choix = this.quotaChoice('choix', [1, 2, 3, 4])
    if (choix === 1) {
      this.question = '$20+25$'
      this.correction = `$20+25=${miseEnEvidence(texNombre(45, 0))}$`
      this.reponse = 45
    }
    if (choix === 2) {
      this.question = '$25-20$'
      this.correction = `$25-20=${miseEnEvidence(texNombre(5, 0))}$`
      this.reponse = 5
    }
    if (choix === 3) {
      this.question = '$202+5$'
      this.correction = `$202+5=${miseEnEvidence(texNombre(207, 0))}$`
      this.reponse = 207
    }
    if (choix === 4) {
      this.question = '$202-5$'
      this.correction = `$202-5=${miseEnEvidence(texNombre(197, 0))}$`
      this.reponse = 197
    }
  }
}
