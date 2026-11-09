import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec des entiers relatifs'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = '7b6ee'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculsEntiersRelatifs extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choix = this.quotaChoice('choix', [1, 2])
    const a = this.quotaRandint('a', -30, -5)
    if (choix === 1) {
      this.reponse = 2025 - a
      this.question = `$${texNombre(2025, 0)}-(${a})$`
      this.correction = `$${texNombre(2025, 0)}-(${a})=${texNombre(2025, 0)}+${-a}=${miseEnEvidence(texNombre(this.reponse, 0))}$`
    }
    if (choix === 2) {
      this.reponse = a - 2025
      this.question = `$(${a})-${texNombre(2025, 0)}$`
      this.correction = `$(${a})-${texNombre(2025, 0)}=(${a})+(-${texNombre(2025, 0)})=${miseEnEvidence(texNombre(this.reponse, 0))}$`
    }
  }
}
