import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les chiffres'
export const interactifReady = true

export const uuid = 'b3152'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class calcAvecChiffres2026 extends ExerciceSimple {
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
      : this.quotaChoice('choix', [1, 2, 3, 4, 5, 6])

    if (choix === 1) {
      this.question = '$2+0+2+6$'
      this.correction = `$2+0+2+6=${miseEnEvidence(texNombre(10, 0))}$`
      this.reponse = 10
    } else if (choix === 2) {
      this.question = '$2\\times 0 \\times (2+6)$'
      this.correction = `$2\\times 0 \\times (2+6)=2\\times 0 \\times 8= 0 \\times 8=${miseEnEvidence(texNombre(0, 0))}$`
      this.reponse = 0
    } else if (choix === 3) {
      this.question = '$(2+ 0 + 2)\\times 6$'
      this.correction = `$(2+ 0 + 2)\\times 6=4 \\times 6=${miseEnEvidence(texNombre(24, 0))}$`
      this.reponse = 24
    } else if (choix === 4) {
      this.question = '$2+ 0 + (2\\times 6)$'
      this.correction = `$2+ 0 + (2\\times 6)=2+0+12=${miseEnEvidence(texNombre(14, 0))}$`
      this.reponse = 14
    } else if (choix === 5) {
      this.question = '$2+ (0 \\times 2) + 6$'
      this.correction = `$2+ (0 \\times 2) + 6=2+0+6=${miseEnEvidence(texNombre(8, 0))}$`
      this.reponse = 8
    } else {
      this.question = '$(2+0)\\times (2+6)$'
      this.correction = `$(2+0)\\times (2+6)=2 \\times 8=${miseEnEvidence(texNombre(16, 0))}$`
      this.reponse = 16
    }
  }
}
