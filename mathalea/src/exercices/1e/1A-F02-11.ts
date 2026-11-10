import ordonneePointDroite from '../can/2e/can2G30-06'
export const titre =
  "Calculer l'ordonnée d'un point sur une droite (non définie explicitement)"
export const dateDePublication = '06/08/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2G30-06 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = 'af81c'

export const refs = {
  'fr-fr': ['1A-F02-11'],
  'fr-ch': ['1mQCM-2', '2mQCM-3'],
}
export default class Auto1AF2c extends ordonneePointDroite {
  nouvelleVersion() {
    super.nouvelleVersion()
    if (this.interactif) {
      this.question = (this.question ?? '').replace(
        /Quelle est l\x27ordonnée du point \$B\$\s*\?/g,
        'L’ordonnée du point $B$ est ',
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
