import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les chiffres'
export const interactifReady = true

export const uuid = 'd44fe'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
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
    const choix = this.quotaChoice('choix', [1, 2, 3, 4, 5])

    if (choix === 1) {
      this.question = '$20\\times 25$'
      this.correction = `$20\\times 25=${miseEnEvidence(texNombre(500, 0))}$`
      this.reponse = 500
    } else if (choix === 2) {
      this.question = '$202\\times 5$'
      this.correction = `$202\\times 5=${miseEnEvidence(texNombre(1010, 0))}$`
      this.reponse = 1010
    } else if (choix === 3) {
      this.question = '$20\\times 2,5$'
      this.correction = `$20\\times 2,5=20\\times 2+20\\times 0,5=${miseEnEvidence(texNombre(50, 0))}$`
      this.reponse = 50
    } else if (choix === 4) {
      this.question = '$2\\times 0,25$'
      this.correction = `$2\\times 0,25=${miseEnEvidence(texNombre(0.5, 1))}$`
      this.reponse = 0.5
    } else if (choix === 5) {
      this.question = '$20,2\\times 5$'
      this.correction = `$20,2\\times 5=${miseEnEvidence(texNombre(101, 0))}$`
      this.reponse = 101
    }
  }
}
