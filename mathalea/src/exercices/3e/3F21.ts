import LectureExpressionFonctionsAffines from './3F21-1'
export const titre = 'Déterminer une fonction linéaire'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const uuid = 'b4c0d'
export const refs = {
  'fr-fr': ['3F21', 'BP1AUTO054'],
  'fr-ch': ['11LCFA2E-1', '11LSFA2E-1', 'PRQPF01C-5', 'PRQPF02C-1'],
}
export default class LectureExpressionFonctionsLineaires extends LectureExpressionFonctionsAffines {
  constructor() {
    super()
    this.lineaire = true
  }
}
