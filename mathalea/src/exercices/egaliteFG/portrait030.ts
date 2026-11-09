import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Véronique Cortier'
export const dateDePublication = '17/07/2026'
export const uuid = '2997b'
export const refs = {
  'fr-fr': ['Portraits-030'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait030 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Véronique Cortier'
    this.photoSrc = '/alea/images/egalite/cortier.jpg'
    this.photoAlt = 'Portrait de Véronique Cortier'
    this.source = 'Wikimedia Commons — auteur anonyme — CC BY-SA 4.0'
    this.superPouvoir = 'Protectrice de la démocratie'
    this.ceQuElleFait = 'Certifie la sécurité des votes électroniques'
    this.leTrucStyle = 'Traque les failles des scrutins en ligne'
    this.parcours = 'Informatique'
  }
}
