import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Patricia Bouyer-Decitre'
export const dateDePublication = '17/07/2026'
export const uuid = '2b670'
export const refs = {
  'fr-fr': ['Portraits-018'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait018 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Patricia Bouyer-Decitre'
    this.photoSrc = '/alea/images/egalite/bouyer-decitre.jpg'
    this.photoAlt = 'Portrait de Patricia Bouyer-Decitre'
    this.source = 'Université Paris-Saclay'
    this.superPouvoir = 'Contrôleuse technique des logiciels'
    this.ceQuElleFait = 'Vérifie le comportement des programmes complexes'
    this.leTrucStyle = 'Détecte les dangers dans les systèmes de pilotage'
    this.parcours = 'Informatique'
  }
}
