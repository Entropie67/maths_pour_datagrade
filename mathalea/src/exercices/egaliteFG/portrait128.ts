import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Maryam Mirzakhani'
export const dateDePublication = '24/07/2026'
export const uuid = 'bd7d5'
export const refs = {
  'fr-fr': ['Portraits-128'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait128 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Maryam Mirzakhani'
    this.photoSrc = '/alea/images/egalite/mirzakhani.jpg'
    this.photoAlt = 'Illustration représentant Maryam Mirzakhani'
    this.source =
      "Illustration — Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Première femme lauréate de la médaille Fields'
    this.ceQuElleFait =
      "Première femme lauréate de la Médaille Fields, Maryam Mirzakhani a marqué les mathématiques par ses travaux sur la géométrie des surfaces et les espaces de modules. Elle a utilisé des outils de géométrie hyperbolique et d'analyse pour étudier les structures complexes."
    this.leTrucStyle = 'Elle travaillait souvent en dessinant ses idées sur de grandes feuilles au sol !'
    this.parcours = 'Mathématicienne irano-américaine (1977-2017)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Transformations géométriques.<br>' +
      'Lycée : Représentations graphiques, dérivées, intégrales.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
