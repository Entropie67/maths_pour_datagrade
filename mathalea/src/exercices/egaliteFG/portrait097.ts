import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Fatiha Saïs'
export const dateDePublication = '17/07/2026'
export const uuid = 'abdd9'
export const refs = {
  'fr-fr': ['Portraits-097'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait097 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Fatiha Saïs'
    this.photoSrc = '/alea/images/egalite/sais.jpg'
    this.photoAlt = 'Portrait de Fatiha Saïs'
    this.source = 'site personnel'
    this.superPouvoir = 'Détective de la cohérence des données'
    this.ceQuElleFait = 'Elle travaille sur l\'intelligence artificielle pour permettre aux machines de détecter les contradictions dans les bases de données'
    this.leTrucStyle = 'Elle aide à rendre le Web plus intelligent et capable de fournir des réponses fiables en croisant des sources variées'
    this.parcours = 'Informatique'
  }
}
