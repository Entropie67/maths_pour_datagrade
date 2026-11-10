import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer des sommes avec 2026'
export const interactifReady = true

export const uuid = 'jltht'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class calcAvecSommes2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const choix = this.canOfficielle
      ? 1
      : this.quotaChoice('choix', [1, 2, 3, 4])
    if (choix === 1) {
      this.question = `$${texNombre(annee, 0)}+${texNombre(annee, 0)}$`
      this.correction = `$${texNombre(annee, 0)}+${texNombre(annee, 0)}=${miseEnEvidence(texNombre(2 * annee, 0))}$`
      this.reponse = 2 * annee
    }
    if (choix === 2) {
      this.question = `$${texNombre(annee, 0)}\\times 2$`
      this.correction = `$${texNombre(annee, 0)}\\times 2=${miseEnEvidence(texNombre(2 * annee, 0))}$`
      this.reponse = 2 * annee
    }
    if (choix === 3) {
      this.question = `$${texNombre(annee, 0)}+${texNombre(annee - 1, 0)}$`
      this.correction = `$${texNombre(annee, 0)}+${texNombre(annee - 1, 0)}=${miseEnEvidence(texNombre(2 * annee - 1, 0))}$`
      this.reponse = 2 * annee - 1
    }
    if (choix === 4) {
      this.question = `$${texNombre(annee, 0)}+${texNombre(annee + 1, 0)}$`
      this.correction = `$${texNombre(annee, 0)}+${texNombre(annee + 1, 0)}=${miseEnEvidence(texNombre(2 * annee + 1, 0))}$`
      this.reponse = 2 * annee + 1
    }
  }
}
