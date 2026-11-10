import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Compléter une égalité'
export const interactifReady = true

export const uuid = 't8ona'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora + Éric Elter
 */
export default class CalculDivers2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    this.consigne = "Compléter l'égalité.<br>"
    switch (this.canOfficielle ? 1 : this.quotaRandint('cas', 1, 5)) {
      case 1:
        this.reponse = texNombre(10, 0)
        this.question = `${texNombre(annee / 10, 1)}=202+\\dfrac{${annee % 10}}{%{champ1}}`
        this.correction = `$${texNombre(annee / 10, 1)}=202+${texNombre((annee % 10) / 10, 1)}=202+\\dfrac{${annee % 10}}{${miseEnEvidence(this.reponse)}}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(annee / 10, 1)}=202+\\dfrac{${annee % 10}}{\\ldots}$`
        break
      case 2:
        this.reponse = texNombre(annee % 10, 0)
        this.question = `${texNombre(annee / 10, 1)}=202+\\dfrac{%{champ1}}{10}`
        this.correction = `$${texNombre(annee / 10, 1)}=202+${texNombre((annee % 10) / 10, 1)}=202+\\dfrac{${miseEnEvidence(this.reponse)}}{10}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(annee / 10, 1)}=202+\\dfrac{\\ldots}{10}$`
        break
      case 3:
        this.reponse = texNombre(annee % 100, 0)
        this.question = `${texNombre(annee / 100, 2)}=20+\\dfrac{%{champ1}}{100}`
        this.correction = `$${texNombre(annee / 100, 2)}=20+${texNombre((annee % 100) / 100, 2)}=20+\\dfrac{${miseEnEvidence(this.reponse)}}{100}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(annee / 100, 2)}=20+\\dfrac{\\ldots}{100}$`
        break
      case 4:
        this.reponse = texNombre(annee % 1000, 0)
        this.question = `${texNombre(annee / 1000, 3)}=2+\\dfrac{%{champ1}}{${texNombre(1000)}}`
        this.correction = `$${texNombre(annee / 1000, 3)}=2+${texNombre((annee % 1000) / 1000, 3)}=2+\\dfrac{${miseEnEvidence(this.reponse)}}{${texNombre(1000)}}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(annee / 1000, 2)}=2+\\dfrac{\\ldots}{${texNombre(1000)}}$`
        break
      case 5:
        this.reponse = texNombre(1000, 0)
        this.question = `${texNombre(annee / 1000, 3)}=2+\\dfrac{${annee % 1000}}{%{champ1}}`
        this.correction = `$${texNombre(annee / 1000, 3)}=2+${texNombre((annee % 1000) / 1000, 3)}=2+\\dfrac{${annee % 1000}}{${miseEnEvidence(this.reponse)}}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(annee / 1000, 2)}=2+\\dfrac{${annee % 1000}}{\\ldots}$`
        break
    }
    this.canEnonce = this.consigne
  }
}
