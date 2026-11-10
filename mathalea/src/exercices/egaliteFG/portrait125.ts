import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Gladys West'
export const dateDePublication = '24/07/2026'
export const uuid = '4d697'
export const refs = {
  'fr-fr': ['Portraits-125'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait125 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Gladys West'
    this.photoSrc = '/alea/images/egalite/west.jpg'
    this.photoAlt = 'Illustration représentant Gladys West'
    this.source =
      "Illustration — Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'A rendu le GPS possible grâce à la géodésie'
    this.ceQuElleFait =
      "Gladys West est une mathématicienne américaine dont les travaux de modélisation ont été cruciaux pour le développement du GPS. Embauchée en 1956 au Naval Surface Warfare Center de Dahlgren, elle fut l'une des rares femmes noires à y travailler comme mathématicienne et programmeuse. Elle s'est spécialisée dans la géodésie par satellite, traitant des données complexes pour modéliser avec une précision mathématique la forme exacte de la Terre (le géoïde)."
    this.leTrucStyle =
      "Elle a programmé les premiers ordinateurs de grande puissance pour garantir l'exactitude des calculs de positionnement et a été intronisée au Hall of Fame des pionniers de l'espace en 2018 pour sa contribution monumentale à la technologie moderne."
    this.parcours = 'Mathématicienne américaine (1930-)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Repérage sur la sphère, vitesses, géométrie plane.<br>' +
      'Lycée : Géométrie dans l\'espace, statistique.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
