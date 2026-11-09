import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Florence Nightingale'
export const dateDePublication = '24/07/2026'
export const uuid = 'f5a50'
export const refs = {
  'fr-fr': ['Portraits-120'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait120 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Florence Nightingale'
    this.photoSrc = '/alea/images/egalite/nightingale-portrait.jpg'
    this.photoAlt = 'Portrait de Florence Nightingale, par Henry Hering, vers 1860'
    this.source = 'Henry Hering (vers 1860), National Portrait Gallery — Wikimedia Commons, domaine public'
    this.superPouvoir = 'Pionnière de la visualisation statistique des données de santé'
    this.ceQuElleFait =
      "Florence Nightingale est surtout connue pour son travail en tant qu'infirmière et son rôle dans l'amélioration des conditions sanitaires dans les hôpitaux, mais elle a également été une pionnière dans l'utilisation des statistiques pour analyser des données. Elle a créé des diagrammes pour illustrer l'impact de l'hygiène sur la mortalité, une méthode encore utilisée aujourd'hui en analyse des données."
    this.leTrucStyle =
      "Son travail a contribué à convaincre l'armée britannique de réformer ses hôpitaux, réduisant drastiquement les taux de mortalité."
    this.parcours = 'Infirmière et statisticienne britannique (1820-1910)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Probabilités, interprétation de graphiques, statistiques.<br>' +
      'Lycée : Analyse de données, décisions basées sur les données.<br><br>' +
      'Pour aller plus loin (livret p.89) : à propos de Florence Nightingale, une ressource nationale (propositions d\'adaptations pour vos classes) : ' +
      '<a href="https://eduscol.education.fr/document/40107/download" target="_blank" rel="noopener noreferrer">Lien</a><br><br>' +
      'Des affiches (livret p.89) : cette série d\'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : ' +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
