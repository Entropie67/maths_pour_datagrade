import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer la durée d'un trajet en vélo"
export const interactifReady = true

export const uuid = 'e89b5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q30 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: ' min.' }
  }

  enonce(distance?: number, vitesse?: number) {
    if (distance == null || vitesse == null) {
      // Génération aléatoire pour avoir des durées simples
      // On veut durée = distance / vitesse qui donne un résultat simple en minutes
      const listeCas = [
        // Durée = 1,5 h = 90 min
        [30, 20],
        [45, 30],
        [60, 40],
        [75, 50],

        // Durée = 1,25 h = 75 min
        [25, 20],
        [50, 40],
        [75, 60],

        // Durée = 1,75 h = 105 min
        [35, 20],
        [70, 40],

        // Durée = 2,5 h = 150 min
        [50, 20],
        [75, 30],
        [100, 40],

        // Durée = 0,75 h = 45 min
        [15, 20],
        [30, 40],
        [45, 60],
      ]
      const cas = choice(listeCas)
      distance = cas[0]
      vitesse = cas[1]
    }

    // Calcul de la durée en heures puis conversion en minutes
    const dureeEnHeures = distance / vitesse
    const dureeEnMinutes = dureeEnHeures * 60

    this.question = `Un cycliste parcourt 
$${distance}$ km à une vitesse
moyenne de $${vitesse}$ km/h.<br>
Son trajet a duré `

    this.correction = `On a : $${distance}\\text{ km }=${texNombre(dureeEnHeures)}\\times ${vitesse}\\text{ km }$.<br>
Or, $${texNombre(dureeEnHeures)}$ h $=${texNombre(dureeEnHeures)}\\times 60 \\text{ min}=${texNombre(dureeEnMinutes, 0)}\\text{ min}$.<br>
Le trajet a duré $${miseEnEvidence(texNombre(dureeEnMinutes, 0))}$ min.`

    this.reponse = dureeEnMinutes

    this.canReponseACompleter = '$\\ldots\\text{ min}$'

    if (!this.interactif) {
      this.question += ' $\\ldots\\text{ min}$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(30, 20)
    else this.enonce()
  }
}
