import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Évelyne Contejean'
export const dateDePublication = '17/07/2026'
export const uuid = '11c7e'
export const refs = {
  'fr-fr': ['Portraits-029'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait029 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Évelyne Contejean'
    this.photoSrc = '/alea/images/egalite/contejean.jpg'
    this.photoAlt = "Portrait d'Évelyne Contejean"
    this.source = 'Christophe Peus / Université Paris-Saclay'
    this.superPouvoir = 'Chasseuse de bugs par la preuve'
    this.ceQuElleFait = 'Prouve qu\'un programme fonctionne'
    this.leTrucStyle = 'Empêche les erreurs de calcul machine'
    this.parcours = 'Informatique'
  }
}
