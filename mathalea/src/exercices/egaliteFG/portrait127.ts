import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Shakuntala Devi'
export const dateDePublication = '24/07/2026'
export const uuid = '88379'
export const refs = {
  'fr-fr': ['Portraits-127'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait127 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Shakuntala Devi'
    this.photoSrc = '/alea/images/egalite/devi.jpg'
    this.photoAlt = 'Illustration représentant Shakuntala Devi'
    this.source =
      "Illustration — Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Prodige du calcul mental, surnommée «\u00a0l\'ordinateur humain\u00a0»'
    this.ceQuElleFait =
      "Surnommée «\u00a0l'ordinateur humain\u00a0», Shakuntala Devi était une prodige indienne du calcul mental. Capable de résoudre des multiplications complexes en quelques secondes sans aide mécanique, elle a popularisé l'importance des mathématiques dans l'éducation."
    this.leTrucStyle =
      "Elle a multiplié deux nombres à 13 chiffres en moins de 30 secondes, un record mondial !"
    this.parcours = 'Mathématicienne indienne (1929-2013)'
    this.mentionLivret = true
    this.comment =
      'Liens curriculaires possibles (livret p.87) :<br>' +
      'Collège : Calcul mental, puissances, racines carrées.<br>' +
      'Lycée : Calcul numérique rapide, puissances, racines.<br><br>' +
      "Des affiches (livret p.89) : cette série d'affiches met en lumière des femmes scientifiques provenant de diverses époques et disciplines, conçues pour être imprimées et exposées dans les établissements : " +
      '<a href="https://drive.google.com/file/d/16CvcfZVZvTtwEQGGuENLzSXsYa56djux/view?usp=sharing" target="_blank" rel="noopener noreferrer">Lien</a>'
  }
}
