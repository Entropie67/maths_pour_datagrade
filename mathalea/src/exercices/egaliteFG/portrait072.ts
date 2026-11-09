import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Nadia Maïzi'
export const dateDePublication = '17/07/2026'
export const uuid = 'dd501'
export const refs = {
  'fr-fr': ['Portraits-072'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait072 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Nadia Maïzi'
    this.photoSrc = '/alea/images/egalite/maizi.jpg'
    this.photoAlt = 'Portrait de Nadia Maïzi'
    this.source = 'Mines Paris - PSL'
    this.superPouvoir = 'Voyageuse du futur énergétique'
    this.ceQuElleFait = 'Simule la consommation d\'énergie sur 50 ans'
    this.leTrucStyle = 'Aide à choisir les centrales de demain'
    this.parcours = 'Mathématiques'
  }
}
