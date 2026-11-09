import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { minToHoraire } from '../../../lib/outils/dateEtHoraires'
import { sp } from '../../../lib/outils/outilString'
import { prenomF } from '../../../lib/outils/Personne'
export const titre = 'Déterminer un nombre de minutes'
export const interactifReady = true

export const uuid = '4pvxi'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora + Éric Elter

*/
export default class nbreMinutes2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsDeComparaison = { HMS: true }
    this.formatChampTexte = KeyboardType.clavierHms
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const annee = 2026
    const heureDebut = 20
    const minutesDebut = annee % 100
    const prenom = prenomF()
    const dureeMinutes = this.canOfficielle
      ? 40
      : this.quotaRandint('dureeMinutes', 40, 55)
    const dureeHeures = 1

    // Calcul de l'heure de fin
    const totalMinutesDebut = heureDebut * 60 + minutesDebut
    const totalMinutesFin = totalMinutesDebut + dureeHeures * 60 + dureeMinutes
    const heureFin = Math.floor(totalMinutesFin / 60)
    const minutesFin = totalMinutesFin % 60

    const heureDebutAff = minToHoraire(totalMinutesDebut, true)
    const heureFinAff = minToHoraire(totalMinutesFin, true)

    this.question = `${prenom} commence à regarder un film à $${heureDebutAff}$.<br> La durée de ce film est $${dureeHeures}${sp()}\\text{h}${sp()}${dureeMinutes}${sp()}\\text{min}$. <br>
      À quelle heure le film sera-t-il terminé ?`

    this.correction = `Le film commence à $${heureDebutAff}$ et dure $${dureeHeures}${sp()}\\text{h}${sp()}${dureeMinutes}${sp()}\\text{min}$.<br>
      On calcule : $${heureDebut}${sp()}\\text{h}${sp()}${minutesDebut}${sp()}\\text{min}+${dureeHeures}${sp()}\\text{h}${sp()}${dureeMinutes}${sp()}\\text{min}=${heureDebut + dureeHeures}${sp()}\\text{h}${sp()}${minutesDebut + dureeMinutes}${sp()}\\text{min}$ $=$ $${miseEnEvidence(heureFinAff)}$.`

    this.reponse = {
      reponse: {
        value: `${heureFin}h ${minutesFin}`,
        options: { HMS: true },
      },
    }

    this.canEnonce = ''
    this.canReponseACompleter = `$\\ldots${sp()}\\text{h}${sp()}\\ldots${sp()}\\text{min}$`
  }
}
