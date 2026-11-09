import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer des sommes et des différences avec 2024 et 2025'
export const interactifReady = true

export const uuid = 'cbf8e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class calcAvecSommesEtDiff extends ExerciceSimple {
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
      this.question = `$${texNombre(2025, 0)}+${texNombre(2024, 0)}$`
      this.correction = `$${texNombre(2025, 0)}+${texNombre(2024, 0)}=${miseEnEvidence(texNombre(4049, 0))}$`
      this.reponse = 4049
    }
    if (choix === 2) {
      this.question = `$${texNombre(2025, 0)}-${texNombre(2024, 0)}$`
      this.correction = `$${texNombre(2025, 0)}-${texNombre(2024, 0)}=${miseEnEvidence(texNombre(1, 0))}$`
      this.reponse = 1
    }
    if (choix === 3) {
      this.question = `$${texNombre(2025, 0)}+${texNombre(2025, 0)}-${texNombre(2024, 0)}$`
      this.correction = `$${texNombre(2025, 0)}+${texNombre(2025, 0)}-${texNombre(2024, 0)}=${miseEnEvidence(texNombre(2026, 0))}$`
      this.reponse = 2026
    }
    if (choix === 4) {
      this.question = `$${texNombre(2024, 0)}+${texNombre(2024, 0)}-${texNombre(2025, 0)}$`
      this.correction = `$${texNombre(2024, 0)}+${texNombre(2024, 0)}-${texNombre(2025, 0)}=${miseEnEvidence(texNombre(2023, 0))}$`
      this.reponse = 2023
    }
    if (choix === 5) {
      this.question = `$${texNombre(2025, 0)}-${texNombre(2024, 0)}+${texNombre(2025, 0)}-${texNombre(2024, 0)}$`
      this.correction = `$${texNombre(2025, 0)}-${texNombre(2024, 0)}+${texNombre(2025, 0)}-${texNombre(2024, 0)}=${miseEnEvidence(texNombre(2, 0))}$`
      this.reponse = 2
    }
  }
}
