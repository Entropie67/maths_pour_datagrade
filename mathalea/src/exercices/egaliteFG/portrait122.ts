import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Julia Robinson'
export const dateDePublication = '24/07/2026'
export const uuid = 'cadb6'
export const refs = {
  'fr-fr': ['Portraits-122'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait122 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Julia Robinson'
    this.photoSrc = '/alea/images/egalite/robinson-julia.jpg'
    this.photoAlt = 'Illustration représentant Julia Robinson'
    this.source =
      "Illustration — Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'A contribué à résoudre le dixième problème de Hilbert'
    this.ceQuElleFait =
      "Julia Robinson était une mathématicienne américaine célèbre pour ses travaux en logique mathématique et théorie des nombres. Elle a contribué à prouver que le problème de décidabilité des équations diophantiennes est indécidable. Malgré les barrières de genre, elle a exercé une influence majeure sur les mathématiques du XXe siècle."
    this.leTrucStyle =
      "Elle a été la première femme élue présidente de l'American Mathematical Society."
    this.parcours = 'Mathématicienne américaine (1919-1985)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Logique, nombres, algorithmes, équations, probabilités.<br>' +
      'Lycée : Variables aléatoires, équations, logique, algorithmes.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
