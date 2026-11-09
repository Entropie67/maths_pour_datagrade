import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Calculer une somme/différence'
export const interactifReady = true

export const uuid = '3ch5d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class CalculDivers2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    // Paramètre modifiable : l'année
    const annee = 2026
    const deuxDerniersChiffres = annee % 100
    const anneeMoinsDeuxDerniers = annee - deuxDerniersChiffres

    this.question = "Compléter l'égalité.<br>"

    switch (this.canOfficielle ? 1 : this.quotaRandint('choix', 1, 6)) {
      case 1: {
        // (2 × ?) + deuxDerniersChiffres = annee
        const facteur = 2
        this.reponse = texNombre(anneeMoinsDeuxDerniers / facteur, 0)

        if (this.interactif) {
          this.optionsChampTexte = {
            texteAvant: `$(${texNombre(facteur, 0)}\\times$`,
            texteApres: `$) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`,
          }
        } else {
          this.question += `$(${texNombre(facteur, 0)}\\times \\ldots) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`
        }

        this.correction = `Le produit dans la parenthèse doit être égal à $${texNombre(anneeMoinsDeuxDerniers, 0)}$.<br>
        Ainsi, $(\\underbrace{${texNombre(facteur, 0)}\\times ${miseEnEvidence(this.reponse)}}_{${texNombre(anneeMoinsDeuxDerniers, 0)}}) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`
        this.canReponseACompleter = `$(${texNombre(facteur, 0)}\\times \\ldots) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`
        break
      }
      case 2: {
        // (20 × ?) + deuxDerniersChiffres = annee
        const facteur = 20
        this.reponse = texNombre(anneeMoinsDeuxDerniers / facteur, 0)

        if (this.interactif) {
          this.optionsChampTexte = {
            texteAvant: `$(${texNombre(facteur, 0)}\\times$`,
            texteApres: `$) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`,
          }
        } else {
          this.question += `$(${texNombre(facteur, 0)}\\times \\ldots) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`
        }

        this.correction = `Le produit dans la parenthèse doit être égal à $${texNombre(anneeMoinsDeuxDerniers, 0)}$.<br>
        Ainsi, $(\\underbrace{${texNombre(facteur, 0)}\\times ${miseEnEvidence(this.reponse)}}_{${texNombre(anneeMoinsDeuxDerniers, 0)}}) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`
        this.canReponseACompleter = `$(${texNombre(facteur, 0)}\\times \\ldots) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`
        break
      }
      case 3: {
        // (200 × ?) + deuxDerniersChiffres = annee
        const facteur = 200
        this.reponse = texNombre(anneeMoinsDeuxDerniers / facteur, 0)

        if (this.interactif) {
          this.optionsChampTexte = {
            texteAvant: `$(${texNombre(facteur, 0)}\\times$`,
            texteApres: `$) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`,
          }
        } else {
          this.question += `$(${texNombre(facteur, 0)}\\times \\ldots) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`
        }

        this.correction = `Le produit dans la parenthèse doit être égal à $${texNombre(anneeMoinsDeuxDerniers, 0)}$.<br>
        Ainsi, $(\\underbrace{${texNombre(facteur, 0)}\\times ${miseEnEvidence(this.reponse)}}_{${texNombre(anneeMoinsDeuxDerniers, 0)}}) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`
        this.canReponseACompleter = `$(${texNombre(facteur, 0)}\\times \\ldots) +${deuxDerniersChiffres}=${texNombre(annee, 0)}$`
        break
      }
      case 4: {
        // (2 × 1000) + ? = annee
        const produit = 2000
        this.reponse = texNombre(annee - produit, 0)

        if (this.interactif) {
          this.optionsChampTexte = {
            texteAvant: `$(${texNombre(2, 0)}\\times ${texNombre(1000, 0)}) +$`,
            texteApres: `$=${texNombre(annee, 0)}$`,
          }
        } else {
          this.question += `$(${texNombre(2, 0)}\\times ${texNombre(1000, 0)}) + \\ldots=${texNombre(annee, 0)}$`
        }

        this.correction = `Le produit dans la parenthèse est égal à $${texNombre(produit, 0)}$. <br>
        Ainsi, $(\\underbrace{${texNombre(2, 0)}\\times ${texNombre(1000, 0)}}_{${texNombre(produit, 0)}}) + ${miseEnEvidence(this.reponse)}=${texNombre(annee, 0)}$`
        this.canReponseACompleter = `$(${texNombre(2, 0)}\\times ${texNombre(1000, 0)}) + \\ldots=${texNombre(annee, 0)}$`
        break
      }
      case 5: {
        // (2 × 100) + ? = annee
        const produit = 200
        const complement = annee - produit
        this.reponse = texNombre(complement, 0)

        if (this.interactif) {
          this.optionsChampTexte = {
            texteAvant: `$(${texNombre(2, 0)}\\times 100) +$`,
            texteApres: `$=${texNombre(annee, 0)}$`,
          }
        } else {
          this.question += `$(${texNombre(2, 0)}\\times 100) + \\ldots=${texNombre(annee, 0)}$`
        }

        this.correction = `Le produit dans la parenthèse est égal à $${texNombre(produit, 0)}$. <br>Le nombre que l'on doit ajouter à $${texNombre(produit, 0)}$ pour obtenir $${texNombre(annee, 0)}$ est donné par $${texNombre(annee, 0)}-${texNombre(produit, 0)}=${texNombre(complement, 0)}$.<br> 
       Ainsi,  $(\\underbrace{${texNombre(2, 0)}\\times 100}_{${texNombre(produit, 0)}}) + ${miseEnEvidence(this.reponse)}=${texNombre(annee, 0)}$`
        this.canReponseACompleter = `$(${texNombre(2, 0)}\\times 100) + \\ldots=${texNombre(annee, 0)}$`
        break
      }
      case 6: {
        // (2 × 10) + ? = annee
        const produit = 20
        const complement = annee - produit
        this.reponse = texNombre(complement, 0)

        if (this.interactif) {
          this.optionsChampTexte = {
            texteAvant: `$(${texNombre(2, 0)}\\times 10) +$`,
            texteApres: `$=${texNombre(annee, 0)}$`,
          }
        } else {
          this.question += `$(${texNombre(2, 0)}\\times 10) + \\ldots=${texNombre(annee, 0)}$`
        }

        this.correction = `Le produit dans la parenthèse est égal à $${texNombre(produit, 0)}$. <br>Le nombre que l'on doit ajouter à $${texNombre(produit, 0)}$ pour obtenir $${texNombre(annee, 0)}$ est donné par $${texNombre(annee, 0)}-${texNombre(produit, 0)}=${texNombre(complement, 0)}$.<br> 
       Ainsi,  $(\\underbrace{${texNombre(2, 0)}\\times 10}_{${texNombre(produit, 0)}}) + ${miseEnEvidence(this.reponse)}=${texNombre(annee, 0)}$`
        this.canReponseACompleter = `$(${texNombre(2, 0)}\\times 10) + \\ldots=${texNombre(annee, 0)}$`
        break
      }
    }
    this.canEnonce = "Compléter l'égalité."
  }
}
