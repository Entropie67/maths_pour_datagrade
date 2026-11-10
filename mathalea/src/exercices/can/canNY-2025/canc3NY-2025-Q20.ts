import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { prenomF } from '../../../lib/outils/Personne'
export const titre = 'Résoudre un problème'
export const interactifReady = true

export const uuid = 'ffe8e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter + Gilles Mora

*/
export default class resoudreUnProblemeArgent extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: '€' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const prenoms = prenomF(2)

    const a = this.quotaRandint('a', 5, 15) * 100
    this.reponse = 2025 - a
    this.question = `${prenoms[0]} et ${prenoms[1]} ont ensemble $${texNombre(2025, 0)}$ €.<br>
     ${prenoms[0]} a $${texNombre(a, 0)}$ €.<br>
       Combien a ${prenoms[1]} ?`

    this.correction = `$${texNombre(2025, 0)}-${texNombre(a, 0)}=${texNombre(this.reponse, 0)}$.<br>
    ${prenoms[1]} a $${miseEnEvidence(texNombre(this.reponse, 0))}$ €.`

    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$\\ldots$ €'
  }
}
