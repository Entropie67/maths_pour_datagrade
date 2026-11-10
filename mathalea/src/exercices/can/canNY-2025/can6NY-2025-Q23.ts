import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { prenomF } from '../../../lib/outils/Personne'
export const titre = 'Déterminer un reste à payer'
export const interactifReady = true

export const uuid = '9b8f9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class TrouverUnPrix extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: ' €' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const P = prenomF()
    const a = this.quotaRandint('a', 11, 19) * 100 + 25
    this.question = `${P} a acheté un scooter électrique coûtant $${texNombre(2025, 0)}$ €.<br> 
            Elle règle $${texNombre(a, 0)}$ € à la livraison du scooter puis règlera la moitié du montant restant le mois suivant. <br>
            Quelle somme lui restera-t-il à payer ensuite pour le dernier versement ?  `
    this.correction = `$${texNombre(2025, 0)}-${texNombre(a, 0)}=${texNombre(2025 - a, 0)}$<br>
    Après le premier versement de $${texNombre(a, 0)}$ €, ${P} doit encore payer $${texNombre(2025 - a, 0)}$ €. <br>
    $${texNombre(2025 - a, 0)} \\div 2 = ${texNombre((2025 - a) / 2, 0)}$<br>
            La moitié de $${texNombre(2025 - a, 0)}$ € est $${texNombre((2025 - a) / 2, 0)}$ €. <br>
              Ainsi, son dernier versement sera de $${miseEnEvidence(`${texNombre((2025 - a) / 2, 0)}`)}$ €.
                   `
    this.reponse = `${(2025 - a) / 2}`
    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$\\ldots$ €'
  }
}
