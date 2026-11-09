import DevinetteNombreMystere from '../6e/6N1A-7'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = 'Deviner : je suis un nombre entier mystère'

export const dateDePublication = '30/09/2026'
/**
 * @author Éric Elter
 */

export const uuid = 'ff08e'

export const refs = {
  'fr-fr': ['CM1N1E', 'CM2N1D'],
  'fr-ch': ['NR'],
}
export default class DevinetteNombreEntierMystere extends DevinetteNombreMystere {
  constructor() {
    super()
    this.sup = 4
    this.besoinFormulaire2Texte = [
      'Unités de numération utilisées',
      [
        'Nombres séparés par des tirets :',
        '1 : Centaines de mille',
        '2 : Dizaines de mille',
        '3 : Unités de mille',
        '4 : Centaines',
        '5 : Dizaines',
        '6 : Unités',
        '7 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = '3'
    this.sup3 = '1-2-7-8'
    this.sup4 = true
    this.sup5 = true
    this.nbQuestions = 1
  }
}
