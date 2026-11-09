import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les chiffres'
export const interactifReady = true

export const uuid = '4cc5b'
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
      this.question = '$202-5$'
      this.correction = `$202-5=${miseEnEvidence(texNombre(197, 0))}$`
      this.reponse = 197
    } else if (choix === 2) {
      this.question = `$${texNombre(2025, 0)}-26$`
      this.correction = `$${texNombre(2025, 0)}-26= ${miseEnEvidence(texNombre(1999, 0))}$`
      this.reponse = 1999
    } else if (choix === 3) {
      this.question = `$${texNombre(2025, 0)}-30$`
      this.correction = `$${texNombre(2025, 0)}-30= ${miseEnEvidence(texNombre(1995, 0))}$`
      this.reponse = 1995
    }
  }
}
