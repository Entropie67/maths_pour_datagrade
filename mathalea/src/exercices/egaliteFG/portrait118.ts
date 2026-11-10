import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sophie Germain (livret Versailles)'
export const dateDePublication = '24/07/2026'
export const uuid = '8a4a9'
export const refs = {
  'fr-fr': ['Portraits-118'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait118 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sophie Germain'
    this.photoSrc = '/alea/images/egalite/germain-sophie-portrait.jpg'
    this.photoAlt = 'Portrait de Sophie Germain (gravure, début du XIXe siècle)'
    this.source = 'Auteur inconnu, début XIXe siècle — Wikimedia Commons, domaine public'
    this.superPouvoir = 'Pionnière de la théorie des nombres premiers'
    this.ceQuElleFait =
      "Sophie Germain est une pionnière des mathématiques, connue pour ses contributions à la théorie des nombres, notamment sur les nombres premiers, de l'élasticité et de la mécanique. Malgré les obstacles liés à son époque, elle a contribué à résoudre des questions complexes, comme le dernier théorème de Fermat pour certains cas. Sa détermination et son génie ont ouvert la voie aux femmes dans le domaine des sciences."
    this.leTrucStyle =
      "Elle a dû utiliser un pseudonyme masculin, «\u00a0Monsieur Le Blanc\u00a0», pour pouvoir correspondre avec d'éminents mathématiciens comme Gauss."
    this.parcours = 'Mathématicienne française (1776-1831)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Propriétés des nombres entiers, nombres premiers, géométrie plane (Thalès).<br>' +
      'Lycée : Arithmétique modulaire (congruences), théorie des nombres.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
