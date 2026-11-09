import CosEtsin from '../../1e/1AN40'
export const interactifReady = true

export const titre = 'Déterminer les valeurs remarquables du cosinus et sinus'

export const dateDePublication = '01/06/2022'

/**
 * @author Stéphane Guyon
 */
export const uuid = '4c2a0'

export const refs = {
  'fr-fr': ['can1G2-01'],
  'fr-ch': [],
}
export default class CosEtsinsCAN extends CosEtsin {
  constructor() {
    super()
    this.nbQuestions = 1
    this.can = true
    this.sup = 2
  }
}
