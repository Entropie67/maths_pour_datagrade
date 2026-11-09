import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Agnès Desolneux'
export const dateDePublication = '17/07/2026'
export const uuid = 'f1e6b'
export const refs = {
  'fr-fr': ['Portraits-033'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait033 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Agnès Desolneux'
    this.photoSrc = '/alea/images/egalite/desolneux.jpg'
    this.photoAlt = "Portrait d'Agnès Desolneux"
    this.source = 'Christophe Peus / Université Paris-Saclay'
    this.superPouvoir = 'Restauratrice d\'images'
    this.ceQuElleFait = 'Répare des images floues par statistiques'
    this.leTrucStyle = 'Aide les satellites à voir net depuis l’espace'
    this.parcours = 'Mathématiques'
  }
}
