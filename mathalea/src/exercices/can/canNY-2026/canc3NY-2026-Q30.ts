import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { prenomM } from '../../../lib/outils/Personne'
export const titre = ''
export const interactifReady = true

export const uuid = 'mmqav'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter + Gilles Mora

*/
export default class resoudreUnProbleme2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: '€' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const prenoms = prenomM(2)
    this.reponse = this.canOfficielle
      ? 8
      : this.quotaRandint('reponse', 8, 12, [10])
    const a = this.reponse * 2
    const b = annee + a
    this.question = `${prenoms[0]} a $${texNombre(annee, 0)}$ € et ${prenoms[1]} a $${texNombre(b, 0)}$ €.<br>
       Combien ${prenoms[1]} doit-il donner d'argent à ${prenoms[0]} pour qu'ils aient tous les deux la même somme ?`

    this.correction = `${prenoms[1]} doit donner $${miseEnEvidence(texNombre(this.reponse, 0))}$ € à ${prenoms[0]}.<br>
        Ils auront $${texNombre(annee + this.reponse, 0)}$ € chacun.`

    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$\\ldots$ €'
  }
}
