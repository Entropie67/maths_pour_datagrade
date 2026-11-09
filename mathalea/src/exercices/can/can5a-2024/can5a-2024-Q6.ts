import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomF } from '../../../lib/outils/Personne'
import { formatMinute } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une durée en minutes'
export const interactifReady = true

export const uuid = '7eb06'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = '55'
      this.question = `Eugène part à la piscine à $8$ h $10$ min et arrive à $9$ h $05$ min.<br>
      La durée  de son trajet ${this.interactif ? 'en minutes' : ''} est de : `
      this.correction = `Pour atteindre $9$ h, il faut $50$ min, puis il faut ajouter encore $5$
      min pour atteindre $9$ h $05$ min. <br>Son trajet aura  duré  $${miseEnEvidence('55')}$ min.`
    } else {
      const a = this.quotaRandint('a', 14, 19)
      const b = this.quotaChoice('b', [20, 25, 35, 45, 55])

      const d = this.quotaChoice('d', [5, 10, 15, 20, 25])
      this.reponse = 60 - b + d
      const prenom1 = prenomF()
      this.question = `${prenom1} part à  $${a}$ h $${b}$ min et arrive à  $${a + 1}$ h $${d}$ min.<br>
          Quelle est la durée de son trajet ?`
      this.correction = `Pour atteindre $${a + 1}$ h, il faut $${60 - b}$ min, puis il faut ajouter encore $${d}$
           min pour atteindre $${a + 1}$ h $${d}$ min. <br>
           Son trajet aura  duré  $${miseEnEvidence(formatMinute(60 - b + d))}$ min.`
    }
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: 'min.' }
    } else {
      this.question += `${context.isHtml ? '$\\ldots$ min.' : ''}`
    }

    this.canReponseACompleter = ' $\\ldots$ min'
  }
}
