// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 14552 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 13/09/2026 (commit 50bb1acb9).
import ÉcrirePourcentage from '../can/5e/can5P06-old'
export const titre = 'Écrire sous la forme d’un pourcentage'
export const dateDePublication = '09/12/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2C22 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '14552'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC4fOld extends ÉcrirePourcentage {
  constructor() {
    super()
    this.versionQcm = true
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut écrire un nombre sous forme de pourcentage.<br>


    Se rappeler qu'un pourcentage est une fraction de dénominateur $100$.

  </p>`
  }
}
