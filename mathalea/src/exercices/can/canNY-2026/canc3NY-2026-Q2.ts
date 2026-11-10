import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les chiffres'
export const interactifReady = true

export const uuid = 'xd0yc'
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
    const annee = 2026
    const choix = this.canOfficielle ? 2 : this.quotaChoice('choix', [1, 2, 3])

    if (choix === 1) {
      this.question = `$202-${annee % 10}$`
      this.correction = `$202-${annee % 10}=${miseEnEvidence(texNombre(202 - (annee % 10), 0))}$`
      this.reponse = 202 - (annee % 10)
    } else if (choix === 2) {
      this.question = `$${texNombre(annee, 0)}-${(annee % 100) + 1}$`
      this.correction = `$${texNombre(annee, 0)}-${(annee % 100) + 1}= ${miseEnEvidence(texNombre(annee - ((annee % 100) + 1), 0))}$`
      this.reponse = annee - ((annee % 100) + 1)
    } else if (choix === 3) {
      this.question = `$${texNombre(annee, 0)}-30$`
      this.correction = `$${texNombre(annee, 0)}-30= ${miseEnEvidence(texNombre(annee - 30, 0))}$`
      this.reponse = annee - 30
    }
  }
}
