// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 27154 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ordonneePointDroite from '../can/2e/can2G30-06'
export const titre =
  "Calculer l'ordonnée d'un point sur une droite (non définie explicitement)"
export const dateDePublication = '06/08/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2G30-06 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '27154'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AF2cOld extends ordonneePointDroite {
  constructor() {
    super()
    this.versionQcm = true
  }
}
