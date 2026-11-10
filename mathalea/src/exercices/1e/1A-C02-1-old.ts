// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid dac3c continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ProgrammeCalcul2 from '../can/2e/can2N11-03'
export const titre = 'Calculer avec un programme de calcul'
export const dateDePublication = '04/08/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2N11-03 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'dac3c'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC2bOld extends ProgrammeCalcul2 {
  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut traduire la consigne donnée en français en langage mathématique.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Identifier les mots clés : inverse, somme, double, carré...</li>
    <li>Se rappeler leur signification mathématique.</li>
    <li>Faire attention à <strong>l'ordre des mots</strong>.</li>
    <li>Écrire le programme de calcul en respectant les priorités opératoires.</li>
  </ul>
  <p style="margin: 0;">
    Attention au piège de l'ordre des mots : "l'école du directeur" ne veut pas dire la même chose que "le directeur de l'école".
  </p>`
    this.versionQcm = true
  }
}
