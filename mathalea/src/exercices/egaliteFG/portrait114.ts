import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Rabetrano Miora Andriambololo-Nivo'
export const dateDePublication = '24/07/2026'
export const uuid = 'bf5ab'
export const refs = {
  'fr-fr': ['Portraits-114'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait114 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Rabetrano Miora Andriambololo-Nivo'
    this.photoSrc = '/alea/images/egalite/andriambololo-nivo.jpg'
    this.photoAlt = 'Portrait de Rabetrano Miora Andriambololo-Nivo'
    this.source =
      "Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Consultante en IA, passée de la logique mathématique au code'
    this.ceQuElleFait =
      "«\u00a0J'ai toujours aimé résoudre des problèmes : le côté logique, structuré des mathématiques, et le fait qu'il y ait souvent une solution à trouver.\u00a0»"
    this.leTrucStyle =
      "Avec l'arrivée de l'intelligence artificielle, il y a eu tellement d'outils pour apprendre plus facilement et rapidement à coder : c'est devenu bien plus accessible !"
    this.parcours = 'Études à Polytech Sorbonne, Consultante AI Engineer & Data Scientist en alternance chez Capgemini'
    this.mentionLivret = true
  }
}
