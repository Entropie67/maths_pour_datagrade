import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Déterminer un nombre de minutes'
export const interactifReady = true

export const uuid = 'da6a3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora + Éric Elter

*/
export default class nbreMinutes extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    this.consigne = "Compléter l'égalité.<br>"
    switch (this.quotaRandint('cas', 1, 4)) {
      case 1:
        this.reponse = texNombre(15, 0)
        this.question = `${texNombre(20.25, 2)} \\text{ h }=20 \\text{ h } ~%{champ1} \\text{ min }`
        this.correction = `$${texNombre(20.25, 2)} \\text{ h }=20 \\text{ h } + ${texNombre(0.25, 2)} \\text{ h }= 20 \\text{ h } + \\dfrac14 \\text{ h } = 20 \\text{ h } + ${miseEnEvidence(this.reponse)} \\text{ min. }$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(20.25, 2)} \\text{ h }=20 \\text{ h } \\ldots \\text{ min }$`
        break
      case 2:
        this.reponse = texNombre(30, 0)
        this.question = `${texNombre(202.5, 1)} \\text{ h }=202 \\text{ h } ~%{champ1} \\text{ min }`
        this.correction = `$${texNombre(202.5, 1)} \\text{ h }=202 \\text{ h } + ${texNombre(0.5, 1)} \\text{ h }= 202 \\text{ h } + \\dfrac12 \\text{ h } = 202 \\text{ h } ${miseEnEvidence(this.reponse)} \\text{ min. }$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(202.5, 1)} \\text{ h }=202 \\text{ h }\\ldots \\text{ min }$`
        break
      case 3:
        this.reponse = texNombre(20.25, 2)
        this.question =
          '20 \\text{ h } 15 \\text{ min } = ~%{champ1} \\text{ h }'
        this.correction = `$20 \\text{ h } 15 \\text{ min }= 20 \\text{ h } + \\dfrac14 \\text{ h } =20 \\text{ h } + ${texNombre(0.25, 2)} \\text{ h }= ${miseEnEvidence(this.reponse)} \\text{ h. }$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter =
          '$20 \\text{ h } 15 \\text{ min }= \\ldots \\text{ h }$'
        break
      case 4:
        this.reponse = texNombre(202.5, 1)
        this.question =
          '202 \\text{ h } 30 \\text{ min } = ~%{champ1} \\text{ h }'
        this.correction = `$202 \\text{ h } 30 \\text{ min }= 202 \\text{ h } + \\dfrac12 \\text{ h } =202 \\text{ h } + ${texNombre(0.5, 1)} \\text{ h } = ${miseEnEvidence(this.reponse)} \\text{ h. }$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter =
          '$202 \\text{ h } 30 \\text{ min }= \\ldots \\text{ h }$'
        break
    }
    this.canEnonce = this.consigne
  }
}
