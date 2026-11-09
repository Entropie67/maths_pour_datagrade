import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une vitesse moyenne'
export const interactifReady = true

export const uuid = '9fygi'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q17 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: 'km/h' }
  }

  enonce(
    distance?: number,
    minutesTexte?: string,
    minutesNombre?: number,
    multiplicateur?: number,
  ) {
    const listeChoix: [string, string, number, number][] = [
      ['quinze', 'Quinze', 15, 4],
      ['dix', 'Dix', 10, 6],
      ['vingt', 'Vingt', 20, 3],
    ]

    if (
      distance == null ||
      minutesTexte == null ||
      minutesNombre == null ||
      multiplicateur == null
    ) {
      const a = choice(listeChoix)
      minutesTexte = a[0]
      minutesNombre = a[2]
      multiplicateur = a[3]
      distance = randint(1, 3) * 10
    }

    const reponse = distance * multiplicateur

    this.question = `Si l'on parcourt $${distance}\\text{ km}$ en ${minutesTexte} minutes, alors la vitesse moyenne est : ${this.interactif ? '' : '$\\ldots \\text{ km/h}$.'}`
    this.correction = `${minutesTexte.charAt(0).toUpperCase() + minutesTexte.slice(1)} minutes représentent $\\dfrac{1}{${multiplicateur}}$ heure.<br>
Donc en $1$ heure, on parcourt $${distance}\\times ${multiplicateur}=${miseEnEvidence(reponse)}\\text{ km}$. <br>
La vitesse moyenne est donc $${miseEnEvidence(reponse)}\\text{ km/h}$.`
    this.reponse = reponse

    this.canEnonce = `Si l'on parcourt $${distance}\\text{ km}$ en ${minutesTexte} minutes, alors la vitesse moyenne est :`
    this.canReponseACompleter = '$\\ldots$ km/h'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(20, 'quinze', 15, 4)
    else this.enonce()
  }
}
