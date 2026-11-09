import MesureAnglesParticuliers from '../6e/6G4B-2'
export const titre = 'Connaître la mesure de quelques angles particuliers'
export const amcReady = false
export const interactifReady = true

export const dateDePublication = '02/09/2026'

/**
 * @author Éric Elter
 */

export const uuid = '32ebb'

export const refs = {
  'fr-fr': ['5G4autoB'],
  'fr-ch': ['NR'],
}
export default class MesureAnglesParticuliersAuto5e extends MesureAnglesParticuliers {
  constructor() {
    super()
    this.sup = '3-5'
  }
}
