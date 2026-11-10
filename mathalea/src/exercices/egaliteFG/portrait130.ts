import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Valérie Thomas'
export const dateDePublication = '24/07/2026'
export const uuid = '919d7'
export const refs = {
  'fr-fr': ['Portraits-130'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait130 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Valérie Thomas'
    this.photoSrc = '/alea/images/egalite/thomas-valerie.jpg'
    this.photoAlt = 'Illustration représentant Valérie Thomas'
    this.source =
      "Illustration — Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Inventrice de la projection tridimensionnelle illusoire'
    this.ceQuElleFait =
      "Valérie Thomas est une inventrice et scientifique franco-américaine, connue pour l'invention de la projection tridimensionnelle sans lunettes spéciales en 1980. Physicienne de formation, elle a travaillé à la NASA, contribuant aux avancées dans l'imagerie et la télédétection."
    this.leTrucStyle = "Son invention est utilisée aujourd'hui dans la télévision et la médecine !"
    this.parcours = 'Inventrice et physicienne franco-américaine (1943-)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : — (aucune piste proposée par le livret).<br>' +
      'Lycée : Vecteurs, trigonométrie, traitement de données.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
