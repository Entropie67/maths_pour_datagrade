// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid ba2ec continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ProgrammeCalcul2 from '../can/5e/can5C3-01'
export const titre = 'Écrire une fraction avec un nombre décimal'
export const dateDePublication = '05/01/2026'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2C16 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'ba2ec'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC4gOld extends ProgrammeCalcul2 {
  constructor() {
    super()
    this.versionQcm = true
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut calculer un quotient avec des nombres décimaux.<br>
    Il suffit de transformer le quotient pour obtenir une fraction, avec des nombres entiers au numérateur et dénominateur. Puis selon les situations :
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Réduire la fraction obtenue.</li>
    <li>Tester les propositions en surveillant les erreurs de facteur $10$.</li>
  </ul>`
  }
}
