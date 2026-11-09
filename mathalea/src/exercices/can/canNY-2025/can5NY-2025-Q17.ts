import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Compléter une égalité'
export const interactifReady = true

export const uuid = '17654'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora + Éric Elter
 */
export default class CalculDivers extends ExerciceSimple {
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
    switch (this.quotaRandint('cas', 1, 5)) {
      case 1:
        this.reponse = texNombre(2, 0)
        this.question = `${texNombre(202.5, 1)}=202+\\dfrac{1}{%{champ1}}`
        this.correction = `$${texNombre(202.5, 1)}=202+${texNombre(0.5, 1)}=202+\\dfrac{1}{${miseEnEvidence(this.reponse)}}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(202.5, 1)}=202+\\dfrac{1}{\\ldots}$`
        break
      case 2:
        this.reponse = texNombre(1, 0)
        this.question = `${texNombre(202.5, 1)}=202+\\dfrac{%{champ1}}{2}`
        this.correction = `$${texNombre(202.5, 1)}=202+${texNombre(0.5, 1)}=202+\\dfrac{${miseEnEvidence(this.reponse)}}{2}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(202.5, 1)}=202+\\dfrac{\\ldots}{2}$`
        break
      case 3:
        this.reponse = texNombre(25, 0)
        this.question = `${texNombre(20.25, 2)}=20+\\dfrac{%{champ1}}{100}`
        this.correction = `$${texNombre(20.25, 2)}=20+${texNombre(0.25, 2)}=20+\\dfrac{${miseEnEvidence(this.reponse)}}{100}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(20.25, 2)}=20+\\dfrac{\\ldots}{100}$`
        break
      case 4:
        this.reponse = texNombre(1, 0)
        this.question = `${texNombre(20.25, 2)}=20+\\dfrac{%{champ1}}{4}`
        this.correction = `$${texNombre(20.25, 2)}=20+${texNombre(0.25, 2)}=20++\\dfrac{${miseEnEvidence(this.reponse)}}{4}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(20.25, 2)}=20+\\dfrac{\\ldots}{4}$`
        break
      case 5:
        this.reponse = texNombre(4, 0)
        this.question = `${texNombre(20.25, 2)}=20+\\dfrac{1}{%{champ1}}`
        this.correction = `$${texNombre(20.25, 2)}=20+${texNombre(0.25, 2)}=20++\\dfrac{1}{${miseEnEvidence(this.reponse)}}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(20.25, 2)}=20+\\dfrac{1}{\\ldots}$`
        break
    }
    this.canEnonce = this.consigne
  }
}
