import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Ajouter une durée'
export const interactifReady = true

export const uuid = '22787'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter + Gilles Mora
 */
export default class AjouterMinutes extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsDeComparaison = { HMS: true }
    this.formatChampTexte = KeyboardType.clavierHms
  }

  nouvelleVersion() {
    const h = 20
    const k = this.quotaRandint('k', 8, 11) * 5
    this.question = `Ajouter $${k}$ minutes à $20$ h $25$ minutes.`

    this.correction = `$20$ h $25$ minutes + $${k}$ minutes  $=$$20$ h $25$ minutes + $35$ minutes  + $${k - 35}$ minutes  $=${miseEnEvidence(`${h + 1}\\text{ h } ${25 + k - 60}\\text{ min}`)}$.`
    this.reponse = {
      reponse: { value: `${h + 1}h ${25 + k - 60}`, options: { HMS: true } },
    }
    if (this.interactif) {
      this.question += '<br>'
    }

    this.canEnonce = `Ajouter $${k}$ minutes à $20$ h 25 minutes.`
    this.canReponseACompleter = `$\\ldots${sp()}\\text{h}${sp()}\\ldots${sp()}\\text{min}$`
  }
}
