import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Hanna Bendjador'
export const dateDePublication = '17/07/2026'
export const uuid = 'f9c5e'
export const refs = {
  'fr-fr': ['Portraits-006'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait006 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Hanna Bendjador'
    this.photoSrc = '/alea/images/egalite/bendjador.jpg'
    this.photoAlt = "Portrait d'Hanna Bendjador"
    this.source = 'Le Monde des Grandes Écoles'
    this.superPouvoir = 'Exploratrice des interfaces physique-biologie'
    this.ceQuElleFait = 'Elle crée des modèles mathématiques pour comprendre comment les cellules réagissent à leur environnement physique'
    this.leTrucStyle = 'Lauréate du prix Jeunes Talents L\'Oréal-UNESCO, ses travaux font le pont entre théorie physique et monde vivant'
    this.parcours = 'Mathématiques'
  }
}
