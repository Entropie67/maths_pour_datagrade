import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les chiffres'
export const interactifReady = true

export const uuid = '24246'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class calcAvecChiffresPrio extends ExerciceSimple {
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
      this.question = '$2\\times 0+2 \\times 5$'
      this.correction = `$2\\times 0+2 \\times 5=0+10=${miseEnEvidence(texNombre(10, 0))}$`
      this.reponse = 10
    } else if (choix === 2) {
      this.question = '$20 \\times 2+5$'
      this.correction = `$20 \\times 2+5=40+5=${miseEnEvidence(texNombre(45, 0))}$`
      this.reponse = 45
    } else if (choix === 3) {
      this.question = '$20+2\\times 5$'
      this.correction = `$20+2\\times 5=20+10=${miseEnEvidence(texNombre(30, 0))}$`
      this.reponse = 30
    } else if (choix === 4) {
      this.question = '$2+ 0 \\times 25$'
      this.correction = `$2+ 0 \\times 25=2+0=${miseEnEvidence(texNombre(2, 0))}$`
      this.reponse = 2
    } else if (choix === 5) {
      this.question = '$2\\times (0+2+ 5)$'
      this.correction = `$2\\times (0+2+ 5)=2 \\times 7=${miseEnEvidence(texNombre(14, 0))}$`
      this.reponse = 14
    } else {
      this.question = '$(20+2)\\times 5$'
      this.correction = `$(20+2)\\times 5=22 \\times 5=${miseEnEvidence(texNombre(110, 0))}$`
      this.reponse = 110
    }
  }
}
