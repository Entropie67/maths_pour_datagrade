import SerieDeTransformations from '../4e/4G12'
export const titre = 'Trouver les symétries successives dans un damier'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '4/12/2021'
export const uuid = 'dbc1d'
export const refs = {
  'fr-fr': ['5G3A-11'],
  'fr-2016': ['5G12-2'],
  'fr-ch': ['9R1ES4E-3', '9R2ES4E-3', '9R3ES4E-3', 'PRQES02D-12'],
}
export default class SerieDeTransformations5e extends SerieDeTransformations {
  constructor() {
    super()
    this.version = 2
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = false
  }
}
