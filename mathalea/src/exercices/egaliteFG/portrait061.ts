import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Aurélie Jean'
export const dateDePublication = '17/07/2026'
export const uuid = '80dd2'
export const refs = {
  'fr-fr': ['Portraits-061'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait061 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Aurélie Jean'
    this.photoSrc = '/alea/images/egalite/jean.png'
    this.photoAlt = "Portrait d'Aurélie Jean"
    this.source = 'Bitcoin.fr — CC BY 3.0'
    this.superPouvoir = 'Dompteuse d\'algorithmes'
    this.ceQuElleFait = 'Modélise le cœur humain et le cancer'
    this.leTrucStyle = 'Accélère le diagnostic médical par les maths'
    this.parcours = 'Mathématiques'
  }
}
