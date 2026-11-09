import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { texNombre } from '../../../lib/outils/texNombre'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Utiliser une égalité pour compléter un calcul'
export const interactifReady = true

export const uuid = 'b0611'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
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
    this.consigne = `En utilisant l'égalité $${texNombre(2025, 0)}=9\\times 9 \\times 5\\times 5$, compléter${sp()}:`
    switch (this.quotaRandint('typeDeQuestions', 1, 4)) {
      case 1:
        this.reponse = texNombre(81, 0)
        this.question = `${texNombre(2025, 0)}= ~25 \\times %{champ1} `
        this.correction = `$${texNombre(2025, 0)}= \\underbrace{5\\times 5}_{25}\\times\\underbrace{9\\times 9 }_{${miseEnEvidence(this.reponse)}}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(2025, 0)}= 25\\times \\ldots $`
        break
      case 2:
        this.reponse = texNombre(25, 0)
        this.question = `${texNombre(2025, 0)}= ~%{champ1}\\times 81`
        this.correction = `$${texNombre(2025, 0)}= \\underbrace{5\\times 5}_{${miseEnEvidence(this.reponse)}}\\times \\underbrace{9\\times 9}_{81}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(2025, 0)}=\\ldots \\times 81 $`
        break
      case 3:
        this.reponse = texNombre(45, 0)
        this.question = `${texNombre(2025, 0)}= ~%{champ1} \\times 45`
        this.correction = `$${texNombre(2025, 0)}=\\underbrace{9\\times 5}_{45}\\times \\underbrace{9\\times 5}_{45}=${miseEnEvidence(this.reponse)}\\times 45$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$${texNombre(2025, 0)}=\\ldots \\times 45$`
        break
      case 4:
        this.reponse = texNombre(2025, 0)
        this.question = ' %{champ1}~=81\\times 25'
        this.correction = `$${miseEnEvidence(this.reponse)}=\\underbrace{9\\times 9}_{81}\\times \\underbrace{5\\times 5}_{25}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = '$\\ldots=81\\times 25$'
        break
    }
    this.canEnonce = this.consigne
  }
}
