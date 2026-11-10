import PortraitExercice from './_PortraitExercice'

export const titre = "Portrait : Hypatie d'Alexandrie"
export const dateDePublication = '24/07/2026'
export const uuid = 'ec418'
export const refs = {
  'fr-fr': ['Portraits-117'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait117 extends PortraitExercice {
  constructor() {
    super()
    this.nom = "Hypatie d'Alexandrie"
    this.photoSrc = '/alea/images/egalite/hypatie-portrait.png'
    this.photoAlt = "Portrait imaginaire d'Hypatie d'Alexandrie, par Jules Maurice Gaspard (1908)"
    this.source = 'Jules Maurice Gaspard (1908) — Wikimedia Commons, domaine public'
    this.superPouvoir = 'Enseigne les mathématiques, l\'astronomie et la philosophie à Alexandrie'
    this.ceQuElleFait =
      "Hypatie, mathématicienne et philosophe de l'Antiquité, a joué un rôle central dans le développement des sciences au début du Ve siècle. Elle a enseigné les mathématiques, l'astronomie et la philosophie à Alexandrie."
    this.leTrucStyle =
      "Elle fut l'une des premières femmes connues pour enseigner publiquement la philosophie et les sciences, avant d'être victime de violences politiques."
    this.parcours = 'Mathématicienne et philosophe de l\'Antiquité (vers 370-415)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Propriétés des figures géométriques, constructions géométriques, théorème de Pythagore.<br>' +
      'Lycée : Équations de cercles, paraboles, hyperboles ; arithmétique & équations diophantiennes (maths expert).<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
