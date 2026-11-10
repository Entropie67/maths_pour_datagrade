import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer des sommes et des différences avec 2025 et 2026'
export const interactifReady = true

export const uuid = 'ff4cc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class calcAvecSommesEtDiffannee2026 extends ExerciceSimple {
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
      : this.quotaChoice('choix', [1, 2, 3, 4, 5]) //, 2, 3, 4, 5
    const annee1 = 2026
    const annee2 = annee1 - 1
    if (choix === 1) {
      this.question = `$${texNombre(annee1, 0)}+${texNombre(annee2, 0)}$`
      this.correction = `$${texNombre(annee1, 0)}+${texNombre(annee2, 0)}=${miseEnEvidence(texNombre(annee1 + annee2, 0))}$`
      this.reponse = 4051
    }
    if (choix === 2) {
      this.question = `$${texNombre(annee1, 0)}-${texNombre(annee2, 0)}$`
      this.correction = `$${texNombre(annee1, 0)}-${texNombre(annee2, 0)}=${miseEnEvidence(texNombre(1, 0))}$`
      this.reponse = 1
    }
    if (choix === 3) {
      this.question = `$${texNombre(annee1, 0)}+${texNombre(annee1, 0)}-${texNombre(annee2, 0)}$`
      this.correction = `$${texNombre(annee1, 0)}+${texNombre(annee1, 0)}-${texNombre(annee2, 0)}=${miseEnEvidence(texNombre(annee1 + 1, 0))}$`
      this.reponse = annee1 + 1
    }
    if (choix === 4) {
      this.question = `$${texNombre(annee1, 0)}+${texNombre(annee1, 0)}-${texNombre(annee1, 0)}$`
      this.correction = `$${texNombre(annee1, 0)}+${texNombre(annee1, 0)}-${texNombre(annee1, 0)}=${miseEnEvidence(texNombre(annee1, 0))}$`
      this.reponse = annee1
    }
    if (choix === 5) {
      this.question = `$${texNombre(annee1, 0)}-${texNombre(annee2, 0)}+${texNombre(annee1, 0)}-${texNombre(annee2, 0)}$`
      this.correction = `$${texNombre(annee1, 0)}-${texNombre(annee2, 0)}+${texNombre(annee1, 0)}-${texNombre(annee2, 0)}=${miseEnEvidence(texNombre(2, 0))}$`
      this.reponse = 2
    }
  }
}
