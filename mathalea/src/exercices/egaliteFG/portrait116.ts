import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Catherine Langlet'
export const dateDePublication = '24/07/2026'
export const uuid = '7ef52'
export const refs = {
  'fr-fr': ['Portraits-116'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait116 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Catherine Langlet'
    this.photoSrc = '/alea/images/egalite/langlet.jpg'
    this.photoAlt = 'Portrait de Catherine Langlet'
    this.source =
      "Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Pilote d\'évaluation design automobile, tombée dans la mécanique dès l\'enfance'
    this.ceQuElleFait =
      "Passionnée d'automobile depuis toute petite grâce à son père, restaurateur de véhicules anciens, elle était sa partenaire de garage et sa copilote lors de sorties automobiles."
    this.leTrucStyle =
      "C'est seulement au lycée qu'elle comprend que la filière mécanique n'est pas réservée aux hommes ! Exit l'objectif d'être prof de maths, place à une orientation en filière technique."
    this.parcours = 'Pilote évaluation design, Renault Group'
    this.mentionLivret = true
  }
}
