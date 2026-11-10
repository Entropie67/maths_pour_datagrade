import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Timnit Gebru'
export const dateDePublication = '24/07/2026'
export const uuid = '494cd'
export const refs = {
  'fr-fr': ['Portraits-133'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait133 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Timnit Gebru'
    this.photoSrc = '/alea/images/egalite/gebru.jpg'
    this.photoAlt = 'Portrait de Timnit Gebru'
    this.source =
      "Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = "Dénonce les biais des systèmes d'intelligence artificielle"
    this.ceQuElleFait =
      "Timnit Gebru est une chercheuse de renommée mondiale spécialisée dans l'éthique de l'intelligence artificielle et cofondatrice de l'organisation Black in AI. Ses travaux de recherche ont mis en lumière les biais raciaux et de genre présents dans les systèmes de reconnaissance faciale, ainsi que les risques sociaux et environnementaux liés aux grands modèles de langage. Après avoir dirigé l'équipe d'éthique de l'IA chez Google, elle a fondé en 2021 le DAIR Institute (Distributed AI Research Institute) pour mener une recherche indépendante sur les impacts des technologies d'IA sur les populations marginalisées."
    this.leTrucStyle =
      "Ses travaux forcent la communauté scientifique à prendre conscience des dérives potentielles des algorithmes et défendent une IA développée avec une exigence de justice sociale et de transparence."
    this.parcours = "Chercheuse en éthique de l'IA, fondatrice du DAIR Institute"
    this.mentionLivret = true
  }
}
