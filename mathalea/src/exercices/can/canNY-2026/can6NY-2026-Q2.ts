import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer des sommes ou différences'
export const interactifReady = true

export const uuid = 'b799f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculsNombres2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choix = this.canOfficielle
      ? 1
      : this.quotaChoice('choix', [1, 2, 3, 4])
    if (choix === 1) {
      this.question = '$20+26$'
      this.correction = `$20+26=${miseEnEvidence(texNombre(46, 0))}$`
      this.reponse = 46
    }
    if (choix === 2) {
      this.question = '$26-20$'
      this.correction = `$26-20=${miseEnEvidence(texNombre(6, 0))}$`
      this.reponse = 6
    }
    if (choix === 3) {
      this.question = '$202+6$'
      this.correction = `$202+6=${miseEnEvidence(texNombre(208, 0))}$`
      this.reponse = 208
    }
    if (choix === 4) {
      this.question = '$202-6$'
      this.correction = `$202-6=${miseEnEvidence(texNombre(196, 0))}$`
      this.reponse = 196
    }
  }
}
