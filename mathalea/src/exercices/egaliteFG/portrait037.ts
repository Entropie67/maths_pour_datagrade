import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Nathalie Drach-Temam'
export const dateDePublication = '17/07/2026'
export const uuid = 'ade5d'
export const refs = {
  'fr-fr': ['Portraits-037'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait037 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Nathalie Drach-Temam'
    this.photoSrc = '/alea/images/egalite/drach-temam.jpg'
    this.photoAlt = 'Portrait de Nathalie Drach-Temam'
    this.source = 'Laurent Ardhuin / Sorbonne Université — CC BY-SA 4.0'
    this.superPouvoir = 'Architecte des processeurs'
    this.ceQuElleFait = 'Étudie l\'échange d\'infos dans les processeurs'
    this.leTrucStyle = 'Accélère le matériel informatique mondial'
    this.parcours = 'Informatique'
  }
}
