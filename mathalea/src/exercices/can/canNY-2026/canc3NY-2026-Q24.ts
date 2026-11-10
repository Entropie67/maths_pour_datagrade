import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Utiliser une égalité pour compléter un calcul'
export const interactifReady = true

export const uuid = '4eyns'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora + Éric Elter
 */
export default class CalculDivers2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const a = this.canOfficielle ? 18 : this.quotaRandint('a', 15, 25)
    this.reponse = a
    this.question = `Quel nombre doit-on soustraire à $${annee}$ pour obtenir $${texNombre(annee - a, 0)}$ ?`

    this.correction = `$${texNombre(annee, 0)}-${texNombre(a, 0)}=${texNombre(annee - a, 0)}$.<br>
      Ainsi, il faut soustraire $${miseEnEvidence(texNombre(a, 0))}$ à $${texNombre(annee, 0)}$ pour obtenir 
      $${texNombre(annee - a, 0)}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
