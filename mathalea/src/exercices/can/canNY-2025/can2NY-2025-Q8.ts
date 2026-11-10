import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
export const titre = 'Compléter une égalité'
export const interactifReady = true

export const uuid = '2f929'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class EgaliteCompleter extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    switch (this.quotaRandint('choix', 1, 4)) {
      case 1:
        this.reponse = texNombre(45, 0)
        this.consigne = `En utilisant l'égalité $${texNombre(2025, 0)}=81\\times 25$, compléter :`
        this.question = `\\sqrt{${texNombre(2025, 0)}}=~%{champ1} `
        this.correction = `On utilise la propriété $\\sqrt{a\\times b}=\\sqrt{a}\\times \\sqrt{b}$ valable pour $a$ et $b$ positifs.<br>
        $\\begin{aligned}
        \\sqrt{${texNombre(2025, 0)}}&=\\sqrt{81\\times 25}\\\\
        &=9\\times 5\\\\
        &=${miseEnEvidence(this.reponse)}
        \\end{aligned}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$\\sqrt{${texNombre(2025, 0)}}= \\ldots$`
        break
      case 2:
        this.consigne = `En utilisant l'égalité $${texNombre(2025, 0)}=9^2\\times 5^2$, compléter :`
        this.reponse = texNombre(2025, 0)
        this.question = '\\sqrt{%{champ1}}~= 45 '
        this.correction = `L'égalité s'écrit  $${texNombre(2025, 0)}=(9\\times 5)^2 =45^2$.<br>
        Ainsi, $\\sqrt{${miseEnEvidence(this.reponse)}}=45$.`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = '$\\sqrt{\\ldots}= 45$'
        break
      case 3:
        this.consigne = `En utilisant l'égalité $${texNombre(2025, 0)}=9^2\\times 5^2$, compléter :`
        this.reponse = texNombre(5, 0)
        this.question = `\\sqrt{${texNombre(2025, 0)}}= 9\\times~%{champ1}`
        this.correction = `L'égalité s'écrit  $${texNombre(2025, 0)}=(9\\times 5)^2$.<br>
        Ainsi, $\\sqrt{${texNombre(2025, 0)}}=9\\times ${miseEnEvidence(this.reponse)}$.`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$\\sqrt{${texNombre(2025, 0)}}= 9\\times\\ldots $`
        break
      case 4:
        this.consigne = `En utilisant l'égalité $${texNombre(2025, 0)}=9^2\\times 5^2$, compléter :`
        this.reponse = texNombre(2025, 0)
        this.question = '45^2=~%{champ1}'
        this.correction = `L'égalité s'écrit  $${texNombre(2025, 0)}=(9\\times 5)^2=45^2$.<br>
        Ainsi, $45^2= ${miseEnEvidence(this.reponse)}$.`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = '$45^2=\\ldots $'
        break
    }
    this.canEnonce = this.consigne
  }
}
