import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { personne } from '../../../lib/outils/Personne'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une vitesse moyenne'
export const interactifReady = true

export const uuid = 'simpr'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q12 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(prenom?: string, distance?: number, temps?: number) {
    if (prenom == null || distance == null || temps == null) {
      // Version aléatoire
      const P = personne()
      prenom = P.prenom

      // Liste des cas : [distance en km, temps en min]
      const listeCas = [
        // 20 minutes
        [3, 20],
        [4, 20],
        [5, 20],
        [6, 20],
        // 15 minutes
        [2, 15],
        [3, 15],
        [4, 15],
        [5, 15],
        // 10 minutes
        [2, 10],
        [3, 10],
      ]

      const cas = choice(listeCas)
      distance = cas[0]
      temps = cas[1]
    }

    this.formatChampTexte = KeyboardType.clavierDeBase

    // Calcul de la vitesse moyenne en km/h
    const vitesse = (distance / temps) * 60
    this.reponse = vitesse.toFixed(1)

    this.question = `${prenom} a couru $${distance}$ km en $${temps}$ min.<br>
Sa vitesse moyenne est `

    this.correction = `En $${temps}$ min, ${prenom} a parcouru $${distance}$ km.<br>
En $60$ min (soit $1$ h), ${prenom} parcourt $${60 / temps}$ fois plus, soit $${distance}\\times ${60 / temps}=${miseEnEvidence(vitesse)}$ km/h.`

    this.canReponseACompleter = '$\\ldots$ km/h'

    if (this.interactif) {
      this.optionsChampTexte = { texteApres: 'km/h.' }
    } else {
      this.question += ' $\\ldots$ km/h.'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('Denis', 4, 20)
    else this.enonce()
  }
}
