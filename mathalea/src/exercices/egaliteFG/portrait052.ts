import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Alice Guionnet'
export const dateDePublication = '17/07/2026'
export const uuid = 'e0eee'
export const refs = {
  'fr-fr': ['Portraits-052'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait052 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Alice Guionnet'
    this.photoSrc = '/alea/images/egalite/guionnet.jpg'
    this.photoAlt = "Portrait d'Alice Guionnet"
    this.source = 'Renate Schmid / MFO — CC BY-SA 2.0 DE'
    this.superPouvoir = 'Dompteuse du hasard'
    this.ceQuElleFait = 'Utilise les matrices aléatoires pour comprendre le désordre'
    this.leTrucStyle = 'Ses théories servent en physique et télécoms'
    this.parcours = 'Mathématiques'
  }
}
