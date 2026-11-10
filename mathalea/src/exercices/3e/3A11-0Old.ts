import SimplifierFractionsOld from '../4e/4C24Old'
export const titre = "Simplifier des fractions à l'aide des nombres premiers"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '28/09/2022'
export const dateDeModifImportante = '03/10/2023'
export const uuid = '1871d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class SimplifierFractions3eOld extends SimplifierFractionsOld {
  constructor() {
    super()
    this.sup = 3
    this.sup2 = '2-3-5-7-11-13-17-19-23'
  }
}
