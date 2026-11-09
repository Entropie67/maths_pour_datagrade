import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les chiffres (relatifs)'
export const interactifReady = true

export const uuid = 'uc3qa'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class calcAvecChiffresRel extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const a = this.canOfficielle ? 5 : this.quotaRandint('a', 1, 9)

    this.reponse = a - annee
    this.question = `$${a}-${texNombre(annee, 0)}$`
    this.correction = `$${a}-${texNombre(annee, 0)}=${a}+(-${texNombre(annee, 0)})=${miseEnEvidence(texNombre(this.reponse, 0))}$`
  }
}
