import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Marie Zeidler'
export const dateDePublication = '24/07/2026'
export const uuid = '81c3f'
export const refs = {
  'fr-fr': ['Portraits-113'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait113 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Marie Zeidler'
    this.photoSrc = '/alea/images/egalite/zeidler.jpg'
    this.photoAlt = 'Portrait de Marie Zeidler'
    this.source =
      "Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Formatrice en gestion de projet, passée de la biochimie au management'
    this.ceQuElleFait =
      "Après un baccalauréat scientifique, elle s'oriente vers un BTS Microbiologie et Biochimie. Souhaitant prétendre à des responsabilités managériales, elle poursuit ses études en intégrant une école d'ingénieur généraliste, l'EI.CESI."
    this.leTrucStyle =
      "C'est grâce à cette formation suivie en alternance qu'elle a pu appliquer directement les connaissances théoriques apprises à l'école, en pratique au sein de l'entreprise."
    this.parcours = 'Formatrice Gestion de projet & Responsable Bureau PMO chez Thales'
    this.mentionLivret = true
  }
}
