import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les chiffres'
export const interactifReady = true

export const uuid = 'sdxi0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter + Gilles Mora

*/
export default class calcAvecChiffres2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choix = this.canOfficielle ? 1 : this.quotaChoice('choix', [1, 2, 3])
    const annee = 2026
    if (choix === 1) {
      this.question = `$2+0+2+${annee % 10}$`
      this.correction = `$2+0+2+${annee % 10}=${miseEnEvidence(texNombre(4 + (annee % 10), 0))}$`
      this.reponse = 4 + (annee % 10)
    } else if (choix === 2) {
      this.question = `$20+${annee % 100}$`
      this.correction = `$20+25= ${miseEnEvidence(texNombre(20 + (annee % 100), 0))}$`
      this.reponse = 20 + (annee % 100)
    } else if (choix === 3) {
      this.question = `$202+${annee % 10}$`
      this.correction = `$202+${annee % 10}=${miseEnEvidence(texNombre(202 + (annee % 10), 0))}$`
      this.reponse = 202 + (annee % 10)
    }
  }
}
