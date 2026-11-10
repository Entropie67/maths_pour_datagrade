import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Maëlle Jounay'
export const dateDePublication = '17/07/2026'
export const uuid = 'd1bb3'
export const refs = {
  'fr-fr': ['Portraits-063'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait063 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Maëlle Jounay'
    this.photoSrc = '/alea/images/egalite/jounay.jpg'
    this.photoAlt = 'Portrait de Maëlle Jounay'
    this.source = 'EDF'
    this.superPouvoir = 'Décarboneuse d\'usines'
    this.ceQuElleFait = 'Modélise le remplacement du gaz par l’électricité'
    this.leTrucStyle = 'Programme des pompes à chaleur géantes'
    this.parcours = 'Mathématiques'
  }
}
