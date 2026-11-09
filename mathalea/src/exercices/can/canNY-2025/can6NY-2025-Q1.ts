import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les chiffres'
export const interactifReady = true

export const uuid = '75811'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class calcAvecChiffres extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choix = this.quotaChoice('choix', [1, 2, 3, 4, 5, 6])

    if (choix === 1) {
      this.question = '$2+0+2+5$'
      this.correction = `$2+0+2+5=${miseEnEvidence(texNombre(9, 0))}$`
      this.reponse = 9
    } else if (choix === 2) {
      this.question = '$2\\times 0 \\times (2+5)$'
      this.correction = `$2\\times 0 \\times (2+5)=2\\times 0 \\times 10= 0 \\times 10=${miseEnEvidence(texNombre(0, 0))}$`
      this.reponse = 0
    } else if (choix === 3) {
      this.question = '$(2+ 0 + 2)\\times 5$'
      this.correction = `$(2+ 0 + 2)\\times 5=4 \\times 5=${miseEnEvidence(texNombre(20, 0))}$`
      this.reponse = 20
    } else if (choix === 4) {
      this.question = '$2+ 0 + (2\\times 5)$'
      this.correction = `$2+ 0 + (2\\times 5)=2+0+10=${miseEnEvidence(texNombre(12, 0))}$`
      this.reponse = 12
    } else if (choix === 5) {
      this.question = '$2+ (0 \\times 2) + 5$'
      this.correction = `$2+ (0 \\times 2) + 5=2+0+5=${miseEnEvidence(texNombre(7, 0))}$`
      this.reponse = 7
    } else {
      this.question = '$(2+0)\\times (2+5)$'
      this.correction = `$(2+0)\\times (2+5)=2 \\times 7=${miseEnEvidence(texNombre(14, 0))}$`
      this.reponse = 14
    }
  }
}
