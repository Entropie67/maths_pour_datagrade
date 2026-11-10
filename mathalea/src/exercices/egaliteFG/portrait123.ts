import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Mary Cartwright'
export const dateDePublication = '24/07/2026'
export const uuid = '81b2d'
export const refs = {
  'fr-fr': ['Portraits-123'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait123 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Mary Cartwright'
    this.photoSrc = '/alea/images/egalite/cartwright.jpg'
    this.photoAlt = 'Illustration représentant Mary Cartwright'
    this.source =
      "Illustration — Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Pionnière de la théorie du chaos'
    this.ceQuElleFait =
      "Mary Cartwright était une mathématicienne britannique dont les travaux ont marqué la naissance de la théorie du chaos. Elle a étudié les systèmes dynamiques et montré comment des phénomènes apparemment imprévisibles (par exemple des oscillations électriques) peuvent être modélisés mathématiquement via les équations différentielles."
    this.leTrucStyle =
      "Son travail avec Littlewood a inspiré la théorie du chaos bien avant qu'elle soit célèbre !"
    this.parcours = 'Mathématicienne britannique (1900-1998)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : — (aucune piste proposée par le livret).<br>' +
      'Lycée : Fonctions, suites, équations différentielles.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
