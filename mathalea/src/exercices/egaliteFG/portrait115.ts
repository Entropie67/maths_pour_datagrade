import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Laura Schittecatte'
export const dateDePublication = '24/07/2026'
export const uuid = '6d2a7'
export const refs = {
  'fr-fr': ['Portraits-115'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait115 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Laura Schittecatte'
    this.photoSrc = '/alea/images/egalite/schittecatte.jpg'
    this.photoAlt = 'Portrait de Laura Schittecatte'
    this.source =
      "Livret «\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"
    this.superPouvoir = 'Ingénieure en physico-chimie, docteure passionnée de sciences depuis le collège'
    this.ceQuElleFait =
      "Au collège et au lycée, elle a toujours adoré les sciences (maths, physique et chimie), sans savoir quel métier elle souhaitait faire plus tard. Elle s'oriente donc vers une classe préparatoire, puis une école de chimie généraliste."
    this.leTrucStyle =
      "Après une thèse de doctorat en R&D, elle découvre différents domaines de la science des matériaux et met en application ses compétences techniques dans le secteur industriel, où elle continue d'apprendre chaque jour."
    this.parcours = 'Ingénieure en physico-chimie, PhD, L\'Oréal'
    this.mentionLivret = true
  }
}
