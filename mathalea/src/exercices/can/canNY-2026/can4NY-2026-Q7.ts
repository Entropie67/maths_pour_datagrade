import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec des entiers relatifs'
export const interactifReady = true

export const uuid = 'd6e18'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculsEntiersRelatifs2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const choix = this.canOfficielle ? 1 : this.quotaChoice('choix', [1, 2])
    const a = this.canOfficielle ? -15 : this.quotaRandint('a', -30, -5)
    if (choix === 1) {
      this.reponse = annee - a
      this.question = `$${texNombre(annee, 0)}-(${a})$`
      this.correction = `$${texNombre(annee, 0)}-(${a})=${texNombre(annee, 0)}+${-a}=${miseEnEvidence(texNombre(this.reponse, 0))}$`
    }
    if (choix === 2) {
      this.reponse = a - annee
      this.question = `$(${a})-${texNombre(annee, 0)}$`
      this.correction = `$(${a})-${texNombre(annee, 0)}=(${a})+(-${texNombre(annee, 0)})=${miseEnEvidence(texNombre(this.reponse, 0))}$`
    }
  }
}
