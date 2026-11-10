import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sophie Mourlon'
export const dateDePublication = '17/07/2026'
export const uuid = '1b938'
export const refs = {
  'fr-fr': ['Portraits-083'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait083 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sophie Mourlon'
    this.photoSrc = '/alea/images/egalite/mourlon.jpg'
    this.photoAlt = 'Portrait de Sophie Mourlon'
    this.source = 'NewsTank'
    this.superPouvoir = 'Relieuse d\'énergie et transports'
    this.ceQuElleFait = 'Pilote la politique énergétique de la RATP'
    this.leTrucStyle = 'Harmonise électricité et métro'
    this.parcours = 'Mathématiques'
  }
}
