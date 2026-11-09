import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexte } from '../../lib/interactif/questionMathLive' // fonctions de mise en place des éléments interactifs
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
export const interactifReady = true

export const titre = 'Compléter avec du vocabulaire sur les probabilités'
export const uuid = '4703c'
export const dateDePublication = '29/7/2024' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '08/09/2024'
export const refs = {
  'fr-fr': ['4S20-1', 'BP2FLUC11'],
  'fr-ch': ['11LCNO4B-2', '11LSNO4B-2'],
}
/**
 *
 * @author Mireille Gain
 */
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne =
      'Compléter avec les mots : issues, impossible, équiprobabilité, aléatoire, certain.'
    this.nbQuestions = 5 // Nombre de questions par défaut
  }

  nouvelleVersion() {
    this.nbQuestionsModifiable = false
    this.spacing = 1.5
    this.spacingCorr = 1.5
    const typeQuestionsDisponibles = [
      'issues',
      'imp',
      'equiprob',
      'alea',
      'certain',
    ] // On crée les 5 types de questions

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, rep, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'issues':
          texte =
            "Les résultats possibles d'une expérience aléatoire s'appellent les $\\ldots$" // Le LateX entre deux symboles $, les variables dans des ${ }
          rep = 'issues'
          texteCorr = `Les résultats possibles d'une expérience aléatoire s'appellent les ${texteEnCouleurEtGras('issues')}.`
          break
        case 'imp':
          texte = 'Un événement qui ne se réalise jamais est un événement $\\ldots$'
          rep = 'impossible'
          texteCorr = `Un événement qui ne se réalise jamais est un événement ${texteEnCouleurEtGras('impossible')}.`
          break
        case 'equiprob':
          texte =
            "Lorsque toutes les issues ont la même probabilité de se produire, on dit qu'il y a $\\ldots$"
          rep = 'équiprobabilité'
          texteCorr = `Lorsque toutes les issues ont la même probabilité de se produire, on dit qu'il y a ${texteEnCouleurEtGras('équiprobabilité')}.`
          break
        case 'alea':
          texte = 'Une expérience liée au hasard est une expérience $\\ldots$'
          rep = 'aléatoire'
          texteCorr = `Une expérience liée au hasard est une expérience ${texteEnCouleurEtGras('aléatoire')}.`
          break
        case 'certain':
        default:
          texte =
            "Un événement qui se réalise quelle que soit l'issue est un événement $\\ldots$"
          rep = 'certain'
          texteCorr = `Un événement qui se réalise quelle que soit l'issue est un événement ${texteEnCouleurEtGras('certain')}.`
          break
      }
      if (this.interactif) {
        texte += ajouteChampTexte(this, i, KeyboardType.alphanumeric)
        handleAnswers(this, i, {
          reponse: { value: rep, options: { texteSansCasse: true } },
        })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      } else {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
