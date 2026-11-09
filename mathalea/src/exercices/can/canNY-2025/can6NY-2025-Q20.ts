import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
export const titre = 'Calculer une somme/différence'
export const interactifReady = true

export const uuid = '14867'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class CalculDivers extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    this.consigne = "Compléter l'égalité."
    switch (this.quotaRandint('choix', 4, 4)) {
      case 1:
        this.reponse = texNombre(1000, 0)
        this.question = `(${texNombre(2, 0)}\\times ~%{champ1}) ~+25=${texNombre(2025, 0)}`
        this.correction = `Le produit dans la parenthèse doit être égal à $${texNombre(2000, 0)}$.<br>
        Ainsi, $(\\underbrace{${texNombre(2, 0)}\\times ${miseEnEvidence(this.reponse)}}_{${texNombre(2000, 0)}}) +25=${texNombre(2025, 0)}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$(${texNombre(2, 0)}\\times \\ldots) +25=${texNombre(2025, 0)}$`
        break
      case 2:
        this.reponse = texNombre(100, 0)
        this.question = `(${texNombre(20, 0)}\\times ~%{champ1}) ~+25=${texNombre(2025, 0)}`
        this.correction = `Le produit dans la parenthèse doit être égal à $${texNombre(2000, 0)}$.<br>
        Ainsi, $(\\underbrace{${texNombre(20, 0)}\\times ${miseEnEvidence(this.reponse)}}_{${texNombre(2000, 0)}}) +25=${texNombre(2025, 0)}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$(${texNombre(20, 0)}\\times \\ldots) +25=${texNombre(2025, 0)}$`
        break
      case 3:
        this.reponse = texNombre(10, 0)
        this.question = `(${texNombre(200, 0)}\\times ~%{champ1}) ~+25=${texNombre(2025, 0)}`
        this.correction = `Le produit dans la parenthèse doit être égal à $${texNombre(2000, 0)}$.<br>
        Ainsi, $(\\underbrace{${texNombre(200, 0)}\\times ${miseEnEvidence(this.reponse)}}_{${texNombre(2000, 0)}}) +25=${texNombre(2025, 0)}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$(${texNombre(200, 0)}\\times \\ldots) +25=${texNombre(2025, 0)}$`
        break
      case 4:
        this.reponse = texNombre(25, 0)
        this.question = `(${texNombre(2, 0)}\\times ${texNombre(1000, 0)}) +~%{champ1}~=${texNombre(2025, 0)}`
        this.correction = `Le produit dans la parenthèse est égal à $200$. <br>
        Ainsi, $(\\underbrace{${texNombre(2, 0)}\\times ${texNombre(1000, 0)}}_{${texNombre(2000, 0)}}) + ${miseEnEvidence(this.reponse)}=${texNombre(2025, 0)}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$(${texNombre(2, 0)}\\times ${texNombre(1000, 0)}) + \\ldots=${texNombre(2025, 0)}$`
        break
      case 5:
        this.reponse = texNombre(1825, 0)
        this.question = `(${texNombre(2, 0)}\\times 100) +~%{champ1}~=${texNombre(2025, 0)}`
        this.correction = `Le produit dans la parenthèse est égal à $200$. <br>Le nombre que l'on doit ajouter à $200$ pour obtenir $${texNombre(2025, 0)}$ est donné par $${texNombre(2025, 0)}-200=${texNombre(1825, 0)}$.<br> 
       Ainsi,  $(\\underbrace{${texNombre(2, 0)}\\times 100}_{${texNombre(200, 0)}}) + ${miseEnEvidence(this.reponse)}=${texNombre(2025, 0)}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$(${texNombre(2, 0)}\\times 100) + \\ldots=${texNombre(2025, 0)}$`
        break
      case 6:
        this.reponse = texNombre(2005, 0)
        this.question = `(${texNombre(2, 0)}\\times 10) +~%{champ1}~=${texNombre(2025, 0)}`
        this.correction = `Le produit dans la parenthèse est égal à $20$. <br>Le nombre que l'on doit ajouter à $20$ pour obtenir $${texNombre(2025, 0)}$ est donné par $${texNombre(2025, 0)}-20=${texNombre(2005, 0)}$.<br> 
       Ainsi,  $(\\underbrace{${texNombre(2, 0)}\\times 10}_{${texNombre(20, 0)}}) + ${miseEnEvidence(this.reponse)}=${texNombre(2025, 0)}$`
        handleAnswers(this, 0, { champ1: { value: this.reponse } })
        this.canReponseACompleter = `$(${texNombre(2, 0)}\\times 10) + \\ldots=${texNombre(2025, 0)}$`
        break
    }
    this.canEnonce = this.consigne
  }
}
