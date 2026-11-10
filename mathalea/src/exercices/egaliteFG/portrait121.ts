import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Emmy Noether'
export const dateDePublication = '24/07/2026'
export const uuid = 'e5a90'
export const refs = {
  'fr-fr': ['Portraits-121'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait121 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Emmy Noether'
    this.photoSrc = '/alea/images/egalite/noether-portrait.jpg'
    this.photoAlt = 'Portrait d\'Emmy Noether, vers 1900-1910'
    this.source = 'Auteur inconnu (vers 1900-1910) — Wikimedia Commons, domaine public'
    this.superPouvoir = "Révolutionne l'algèbre abstraite et relie symétrie et physique"
    this.ceQuElleFait =
      "Emmy Noether est une mathématicienne allemande spécialiste d'algèbre abstraite et de physique théorique. Considérée par Albert Einstein comme «\u00a0le génie mathématique créatif le plus considérable produit depuis que les femmes ont eu accès aux études supérieures\u00a0», elle a révolutionné les théories des anneaux, des corps et des algèbres. En physique, le théorème de Noether explique le lien fondamental entre la symétrie et les lois de conservation et est considéré comme aussi important que la théorie de la relativité."
    this.leTrucStyle =
      "Malgré son génie, elle a dû enseigner sans salaire pendant des années, car les femmes n'avaient pas le droit de tenir des postes universitaires."
    this.parcours = 'Mathématicienne allemande (1882-1935)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Équations, géométrie dans l\'espace.<br>' +
      'Lycée : Ensembles de nombres, opérations sur les vecteurs, équations.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
