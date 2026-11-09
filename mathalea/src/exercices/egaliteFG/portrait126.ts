import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sally Ride'
export const dateDePublication = '24/07/2026'
export const uuid = 'a3095'
export const refs = {
  'fr-fr': ['Portraits-126'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait126 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sally Ride'
    this.photoSrc = '/alea/images/egalite/ride.jpg'
    this.photoAlt = 'Illustration représentant Sally Ride'
    this.source =
      "Illustration — Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = "Première femme américaine dans l'espace"
    this.ceQuElleFait =
      "Sally Ride a été la première femme américaine dans l'espace. Physicienne de formation, elle a créé un bras robotisé pour la station internationale. Elle est devenue un symbole pour les femmes dans les STEM."
    this.leTrucStyle =
      "Après ses vols dans l'espace, elle s'est engagée en faveur de l'éducation scientifique des jeunes filles."
    this.parcours = 'Physicienne et astronaute américaine (1951-2012)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Géométrie dans l\'espace, vitesses.<br>' +
      'Lycée : Calculs vectoriels, trajectoires, géométrie analytique.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
