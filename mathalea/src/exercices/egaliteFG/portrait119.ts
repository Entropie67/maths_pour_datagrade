import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Ada Lovelace'
export const dateDePublication = '24/07/2026'
export const uuid = '5ec65'
export const refs = {
  'fr-fr': ['Portraits-119'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait119 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Ada Lovelace'
    this.photoSrc = '/alea/images/egalite/lovelace-portrait.jpg'
    this.photoAlt = 'Portrait d\'Ada Lovelace (détail), par Margaret Sarah Carpenter, 1836'
    this.source = 'Margaret Sarah Carpenter (1836) — Wikimedia Commons, domaine public'
    this.superPouvoir = "Première programmeuse de l'histoire"
    this.ceQuElleFait =
      "Ada Lovelace, souvent considérée comme la première programmeuse de l'histoire, est une figure clé dans le développement des idées liées à l'informatique et à la programmation. Collaborant avec Charles Babbage, elle a imaginé comment sa machine analytique pourrait exécuter des instructions codées : les premiers algorithmes. Visionnaire, elle a compris que les machines pouvaient aller au-delà des simples calculs, posant les bases de l'informatique moderne."
    this.leTrucStyle =
      "Ada Lovelace avait prédit que les machines pourraient composer de la musique, une vision étonnante pour l'époque !"
    this.parcours = 'Mathématicienne britannique (1815-1852)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Algorithmique et programmation (Scratch).<br>' +
      'Lycée : Algorithmique et programmation (Python) : boucles, logique conditionnelle.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
