import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Christine Keribin'
export const dateDePublication = '17/07/2026'
export const uuid = 'ef0d6'
export const refs = {
  'fr-fr': ['Portraits-065'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait065 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Christine Keribin'
    this.photoSrc = '/alea/images/egalite/keribin.jpg'
    this.photoAlt = 'Portrait de Christine Keribin'
    this.source = 'Christophe Peus / Université Paris-Saclay'
    this.superPouvoir = 'Rangeuse de données géantes'
    this.ceQuElleFait = 'Repère des groupes cachés dans les données'
    this.leTrucStyle = 'Analyse le cerveau ou les flux de trains'
    this.parcours = 'Mathématiques'
  }
}
