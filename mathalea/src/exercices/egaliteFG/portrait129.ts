import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Katherine Johnson'
export const dateDePublication = '24/07/2026'
export const uuid = '2359b'
export const refs = {
  'fr-fr': ['Portraits-129'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait129 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Katherine Johnson'
    this.photoSrc = '/alea/images/egalite/johnson-katherine.jpg'
    this.photoAlt = 'Illustration représentant Katherine Johnson'
    this.source =
      "Illustration — Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Calcule les trajectoires des missions Mercury et Apollo'
    this.ceQuElleFait =
      "Katherine Johnson, mathématicienne afro-américaine de la NASA, a été essentielle au calcul des trajectoires des premières missions spatiales américaines, notamment les missions Mercury et Apollo. Grâce à ses compétences en géométrie et calcul vectoriel, elle a assuré le succès de missions historiques comme Apollo 11."
    this.leTrucStyle =
      "Avant chaque lancement, même les ordinateurs étaient corrigés manuellement par Katherine Johnson ! Elle est d'ailleurs l'une des héroïnes du film «\u00a0Les figures de l'ombre\u00a0»."
    this.parcours = 'Mathématicienne afro-américaine (1918-2020)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Géométrie dans l\'espace.<br>' +
      'Lycée : Géométrie analytique, vecteurs, fonctions, dérivées, trajectoires.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
