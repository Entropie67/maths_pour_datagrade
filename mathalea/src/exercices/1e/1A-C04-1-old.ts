// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 1ac8c continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import FractionDecimaleEcritureDecimale2 from '../can/5e/can5C4-10'
export const titre = 'Passer de la fraction décimale à l’écriture décimale'
export const dateDePublication = '04/08/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2C22 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '1ac8c'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC4Old extends FractionDecimaleEcritureDecimale2 {
  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut convertir une somme de fractions décimales en un nombre décimal.<br>
    Le plus simple consiste à écrire chaque fraction décimale en nombre décimal puis d'effectuer la somme.
  </p>
  
`
    this.versionQcm = true
  }
}
