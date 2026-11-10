import LectureGraphiqueParaboleA from '../can/1e/can1SD11-04'
export const titre =
  'Lire graphiquement les valeurs de $a$ et de $b$ dans $ax^2+b$'
export const dateDePublication = '01/08/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can1F24 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = 'dd96b'

export const refs = {
  'fr-fr': ['1A-F02-12'],
  'fr-ch': ['1mF3-22'],
}
export default class Auto1AF2d extends LectureGraphiqueParaboleA {
  nouvelleVersion() {
    super.nouvelleVersion()
    if (this.interactif) {
      this.question = (this.question ?? '').replace(
        /À partir de cette représentation graphique, déterminer la valeur de \$a\$\.<br>/g,
        'À partir de cette représentation graphique, la valeur de $a$ est ',
      )
      if (!this.versionQcm)
        this.optionsChampTexte = { texteAvant: '', texteApres: '.' }
    }
  }

  constructor() {
    super()
    this.versionQcm = false
  }
}
