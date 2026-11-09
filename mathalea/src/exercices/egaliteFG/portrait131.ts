import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Claire Voisin (livret Versailles)'
export const dateDePublication = '24/07/2026'
export const uuid = '21d39'
export const refs = {
  'fr-fr': ['Portraits-131'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait131 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Claire Voisin'
    this.photoSrc = '/alea/images/egalite/voisin-livret.jpg'
    this.photoAlt = 'Illustration représentant Claire Voisin'
    this.source =
      "Illustration — Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Fait avancer la conjecture de Hodge, un problème à un million de dollars'
    this.ceQuElleFait =
      "Claire Voisin est une mathématicienne française mondialement reconnue pour ses travaux en géométrie algébrique et en topologie. Ses recherches ont fait avancer la compréhension des variétés de Hodge. Militante pour l'égalité, elle inspire les jeunes mathématiciennes."
    this.leTrucStyle =
      "La conjecture de Hodge étudiée par Claire Voisin est l'un des sept problèmes du prix du millénaire. Il y a un million de dollars à la clé !"
    this.parcours = 'Mathématicienne française (1962-)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : — (aucune piste proposée par le livret).<br>' +
      'Lycée : Équations de courbes et de cercles, propriétés géométriques.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
