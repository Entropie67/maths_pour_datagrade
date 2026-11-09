import CosEtsin from '../../1e/1AN40'
export const interactifReady = true

export const titre = 'Déterminer les valeurs remarquables du cosinus et sinus'

export const dateDePublication = '01/06/2022'

/**
 * @author Stéphane Guyon
 */
export const uuid = '2dd6a'

export const refs = {
  'fr-fr': ['can1G2-02'],
  'fr-ch': ['2mTrigoTri-3'],
}
export default class CosEtsinsCAN extends CosEtsin {
  constructor() {
    super()
    this.nbQuestions = 1
    this.can = true
    this.sup = 3
  }
}
