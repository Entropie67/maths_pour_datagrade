import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Fei-Fei Li'
export const dateDePublication = '24/07/2026'
export const uuid = 'dda8e'
export const refs = {
  'fr-fr': ['Portraits-132'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait132 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Fei-Fei Li'
    this.photoSrc = '/alea/images/egalite/li-feifei.jpg'
    this.photoAlt = 'Portrait de Fei-Fei Li'
    this.source =
      "Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = "Surnommée la «\u00a0marraine de l'IA moderne\u00a0»"
    this.ceQuElleFait =
      "Fei-Fei Li est une professeure d'informatique à l'Université de Stanford, souvent désignée comme la «\u00a0marraine de l'IA moderne\u00a0». Convaincue que la performance des algorithmes dépendait avant tout de la richesse des données, elle a dirigé la création d'ImageNet. Cette base de données massive de 14 millions d'images a été le catalyseur de la révolution du deep learning en permettant aux machines d'apprendre à reconnaître des objets avec une précision inédite. Elle a également cofondé l'organisation AI4ALL pour promouvoir la diversité dans ce secteur."
    this.leTrucStyle =
      "En déplaçant le curseur de l'algorithme vers la donnée, elle a ouvert la voie à l'explosion technologique de l'IA actuelle et milite pour que cette discipline soit centrée sur l'humain et l'inclusion."
    this.parcours = "Professeure d'informatique, Université de Stanford"
    this.mentionLivret = true
  }
}
