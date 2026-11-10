import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Dorothy Vaughan'
export const dateDePublication = '24/07/2026'
export const uuid = '53722'
export const refs = {
  'fr-fr': ['Portraits-124'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait124 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Dorothy Vaughan'
    this.photoSrc = '/alea/images/egalite/vaughan.jpg'
    this.photoAlt = 'Illustration représentant Dorothy Vaughan'
    this.source =
      "Illustration — Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Pionnière afro-américaine du calcul à la NASA'
    this.ceQuElleFait =
      "Dorothy Vaughan était une mathématicienne et informaticienne afro-américaine, pionnière à la NASA. Embauchée en 1943 à la NACA (ancêtre de la NASA), elle dirigea une équipe de «\u00a0calculatrices humaines\u00a0», principalement des femmes afro-américaines, effectuant des calculs essentiels pour l'aérospatiale. Elle a appris le langage Fortran pour préparer la transition vers l'informatique moderne."
    this.leTrucStyle =
      "Elle est la première femme noire à obtenir une direction d'équipe à la NASA, et s'efforce de soutenir la carrière de ses employées."
    this.parcours = 'Mathématicienne et informaticienne américaine (1910-2008)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Calcul numérique et littéral, vitesses, modélisation.<br>' +
      'Lycée : Fonctions, équations, algorithmique.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
