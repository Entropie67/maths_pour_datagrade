import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Lucia Clarotto'
export const dateDePublication = '24/07/2026'
export const uuid = '5097e'
export const refs = {
  'fr-fr': ['Portraits-108'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Sur le chemin de l'égalité en mathématiques pour tous les élèves - Académie de Versailles
 * Transcription par Lydie El-Halougi
 */
export default class Portrait108 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Lucia Clarotto'
    this.photoSrc = '/alea/images/egalite/clarotto.jpg'
    this.photoAlt = 'Portrait de Lucia Clarotto'
    this.source = 'Christophe Peus, http://www.chrispeus.com/ — Exposition «\u00a0Just Do Maths!\u00a0», Université Paris-Saclay'
    this.superPouvoir = 'Prédit les phénomènes environnementaux grâce aux données'
    this.ceQuElleFait =
      "Au service de la protection de la planète, elle est spécialiste de la géostatistique, une discipline qui permet d'analyser des données liées à l'environnement comme le climat, les vents, l'eau, les rayonnements solaires, les sols ou la pollution. Grâce à ces données, elle développe des modèles capables de mieux comprendre et de prédire des phénomènes environnementaux. Son travail cherche à développer des outils modernes et efficaces pour l'analyse de données en faveur de la transition écologique."
    this.leTrucStyle =
      "Les mathématiques peuvent aussi protéger la planète en aidant à prédire les risques environnementaux et à trouver des solutions pour un avenir plus durable."
    this.parcours = 'Enseignante-chercheuse, laboratoire Mathématiques et Informatique Appliquées'
    this.mentionLivret = true
  }
}
