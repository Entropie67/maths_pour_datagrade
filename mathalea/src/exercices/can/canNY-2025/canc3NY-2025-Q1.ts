import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les chiffres'
export const interactifReady = true

export const uuid = 'a4cbf'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter + Gilles Mora

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
    const choix = this.quotaChoice('choix', [1, 2, 3])

    if (choix === 1) {
      this.question = '$2+0+2+5$'
      this.correction = `$2+0+2+5=${miseEnEvidence(texNombre(9, 0))}$`
      this.reponse = 9
    } else if (choix === 2) {
      this.question = '$20+25$'
      this.correction = `$20+25= ${miseEnEvidence(texNombre(45, 0))}$`
      this.reponse = 45
    } else if (choix === 3) {
      this.question = '$202+5$'
      this.correction = `$202+5=${miseEnEvidence(texNombre(207, 0))}$`
      this.reponse = 207
    }
  }
}
