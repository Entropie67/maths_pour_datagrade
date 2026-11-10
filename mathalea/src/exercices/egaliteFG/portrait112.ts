import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Maëva Arlandis'
export const dateDePublication = '24/07/2026'
export const uuid = '0b460'
export const refs = {
  'fr-fr': ['Portraits-112'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait112 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Maëva Arlandis'
    this.photoSrc = '/alea/images/egalite/arlandis.jpg'
    this.photoAlt = 'Portrait de Maëva Arlandis'
    this.source =
      "Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Ingénieure en robotique passionnée de mécanique et d\'électronique'
    this.ceQuElleFait =
      "«\u00a0J'ai toujours apprécié les sciences et la mécanique. La diversité dans la robotique m'a attirée (mécanique, informatique, électronique) et a su combler ma curiosité.\u00a0»"
    this.leTrucStyle =
      "Après un stage de fin d'études dans un bureau de R&D, elle a voulu un job plus «\u00a0terrain\u00a0», dans un secteur proche du divertissement/spectacle : c'est ainsi qu'elle s'est retrouvée à postuler à Disneyland Paris !"
    this.parcours = 'Ingénieur en Robotique, Master Informatique - IA pour la Robotique'
    this.mentionLivret = true
  }
}
