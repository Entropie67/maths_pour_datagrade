import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { minToHoraire } from '../../../lib/outils/dateEtHoraires'
import { sp } from '../../../lib/outils/outilString'
export const titre = "Compléter une suite d'heures/minutes"
export const interactifReady = true

export const uuid = 'b34re'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class SuiteACompleterHeures2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsDeComparaison = { HMS: true }
    this.formatChampTexte = KeyboardType.clavierHms
  }

  nouvelleVersion() {
    const h = 20
    const k = this.canOfficielle ? 16 : this.quotaRandint('k', 14, 18)
    const annee = 26
    const minutes1Aff = minToHoraire(20 * 60 + annee, true)
    const minutes2Aff = minToHoraire(20 * 60 + annee + k, true)
    const minutes3Aff = minToHoraire(20 * 60 + annee + 2 * k, true)

    this.question = `Compléter la suite : <br>
         $${minutes1Aff}$ ${sp()}; $${minutes2Aff}$ ${sp()}; $${minutes3Aff}$ ${sp()};  `

    this.correction = `On ajoute $${k}$ minutes à chaque fois, donc l'heure qui suit est $${miseEnEvidence(h + 1)}\\text{ h }${miseEnEvidence(String(annee + 3 * k - 60).padStart(2, '0'))}\\text{ min}$.`
    this.reponse = {
      reponse: {
        value: `${h + 1}h ${annee + 3 * k - 60}`,
        options: { HMS: true },
      },
    }
    if (!this.interactif) {
      this.question += `$\\ldots${sp()}\\text{h}${sp()}\\ldots${sp()}\\text{min}$`
    }

    this.canEnonce = 'Compléter la suite.'
    this.canReponseACompleter = `$${h}$ h $${annee}$ min <br> $${h}$ h $${annee + k}$ min <br> $${h}$ h $${annee + 2 * k}$ min <br>  $\\ldots$ h $\\ldots$ min`
  }
}
