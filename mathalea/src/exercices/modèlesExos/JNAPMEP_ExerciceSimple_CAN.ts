// Cette liste d'imports se construit seul
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Trouver un titre pertinent' // Ce titre est nécessaire et doit commencer par un verbe à l'infinitif

// Les éléménts ci-dessous sont nécessaires pour la prise en compte d'un champ classique pour l'interactivité
export const interactifReady = true

// Toujours utile cette information
export const dateDePublication = '18/10/2025'

/* Les éléments ci-dessous sont indispensables pour le référencement d'un exercice
         - uuid : C'est la plaque d'identité de l'exercice. Cette référence, une fois fournie, ne sera plus jamais changée et permettra
                  de toujours retrouver l'exercice depuis l'interface même s'il disparait (volontairement ou involontairement) du menu
          - refs : c'est l'identité de l'exercice pour être plus facilement identifiable par l'utilisateur.
                  Il y a une référence française et suisse
*/
export const uuid = 'jnapmep0' // Cet élement doit être différent d un exercice à l autre. Lancer pnpm start pour copier l uuid
// aléatoire proposé par le moteur
export const refs = {
  'fr-fr': ['Exemple'], // Cet élément doit être choisi en lien avec le référentiel
  'fr-ch': [], // Cet élément peut rester vide et sera géré ultérieurement par Nathan, qui gère le référentiel suisse.
}

/**
 * Descriptif didacactique de l'exercice : Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter // Information utile pour retrouver l'auteur d'un exercice

*/
export default class NomExercice extends ExerciceSimple {
  // NomExercice est un nom en CamelCase précisant la classe de l'exercice
  constructor() {
    super()
    this.typeExercice = 'simple' // On ne change pas ce type
    this.nbQuestions = 1 // Le nb de questions affiché à l'ouverture de l'exercice
  }

  nouvelleVersion() {
    this.question = '2+3'
    this.correction = '2+3=5'
    this.reponse = 5
    // this.canEnonce = texte
    // this.canReponseACompleter = '$\\ldots$ et $\\ldots$'
  }
}
