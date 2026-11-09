import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { formatMinute } from '../../../lib/outils/texNombre'
import Hms from '../../../modules/Hms'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une heure de début'
export const interactifReady = true

export const uuid = 'dava4'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q28 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierHms
    this.optionsDeComparaison = { HMS: true }
  }

  enonce(hFin?: number, minFin?: number, duree?: number) {
    if (hFin == null || minFin == null || duree == null) {
      // Version aléatoire
      // Durée entre 15 et 55 minutes (multiples de 5)
      duree = choice([15, 20, 25, 30, 35, 40, 45, 50, 55])

      // Heure de fin entre 10h et 20h
      hFin = randint(10, 20)

      // Minutes de fin : 00, 05, 10, 15, 20, 25 (pour avoir des calculs simples)
      minFin = choice([0, 5, 10, 15, 20, 25])
    }

    // Calcul de l'heure de début en soustrayant la durée
    let hDebut = hFin
    let minDebut = minFin - duree

    // Si les minutes deviennent négatives, on retire 1 heure et on ajoute 60 min
    if (minDebut < 0) {
      hDebut--
      minDebut += 60
    }

    this.reponse = new Hms({ hour: hDebut, minute: minDebut }).toString()

    this.question = `Le devoir a duré $${duree}$ minutes et s'est terminé à $${hFin}$ h $${formatMinute(minFin)}$ min.<br>
Il a débuté à `

    this.correction = `Pour trouver l'heure de début, on soustrait la durée de l'heure de fin :<br>
$${hFin}$ h $${formatMinute(minFin)}$ min $-$ $${duree}$ min`

    if (minFin < duree) {
      // Cas avec retenue (passage à l'heure précédente)
      this.correction += ` $= ${hFin - 1}$ h $${formatMinute(minFin + 60)}$ min $-$ $${duree}$ min
$= ${miseEnEvidence(`${hDebut}\\text{ h }${formatMinute(minDebut)}\\text{ min}`)}$.`
    } else {
      // Cas simple sans retenue
      this.correction += ` $= ${miseEnEvidence(`${hDebut}\\text{ h }${formatMinute(minDebut)}\\text{ min}`)}$.`
    }

    this.canEnonce = `Le devoir a duré $${duree}$ minutes et s'est terminé à $${hFin}$ h $${formatMinute(minFin)}$ min.<br>
Il a débuté à :`
    this.canReponseACompleter = '$\\ldots$ h $\\ldots$ min'

    if (!this.interactif) {
      this.question += '$\\ldots$ h $\\ldots$ min'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(15, 10, 45)
    else this.enonce()
  }
}
