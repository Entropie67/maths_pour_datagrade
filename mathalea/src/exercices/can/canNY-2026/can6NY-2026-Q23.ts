import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { prenomF } from '../../../lib/outils/Personne'
export const titre = 'Déterminer un reste à payer'
export const interactifReady = true

export const uuid = 'nlcug'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class TrouverUnPrix2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: ' €' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const P = prenomF()
    const a = this.canOfficielle
      ? 1200 + (annee % 100)
      : this.quotaRandint('a', 11, 19) * 100 + (annee % 100)
    this.question = `${P} a acheté un scooter électrique coûtant $${texNombre(annee, 0)}$ €.<br> 
            Elle règle $${texNombre(a, 0)}$ € à la livraison du scooter puis règlera la moitié du montant restant le mois suivant. <br>
            Quelle somme lui restera-t-il à payer ensuite pour le dernier versement ?  `
    this.correction = `$${texNombre(annee, 0)}-${texNombre(a, 0)}=${texNombre(annee - a, 0)}$<br>
    Après le premier versement de $${texNombre(a, 0)}$ €, ${P} doit encore payer $${texNombre(annee - a, 0)}$ €. <br>
    $${texNombre(annee - a, 0)} \\div 2 = ${texNombre((annee - a) / 2, 0)}$<br>
            La moitié de $${texNombre(annee - a, 0)}$ € est $${texNombre((annee - a) / 2, 0)}$ €. <br>
              Ainsi, son dernier versement sera de $${miseEnEvidence(`${texNombre((annee - a) / 2, 0)}`)}$ €.
                   `
    this.reponse = `${(annee - a) / 2}`
    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$\\ldots$ €'
  }
}
