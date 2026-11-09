// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 1252f continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import CalculComplexeFraction from '../can/3e/can3C1-06'
export const titre = 'Effectuer un calcul complexe avec des fractions'
export const dateDePublication = '06/08/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can3C1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '1252f'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC2cOld extends CalculComplexeFraction {
  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut effectuer un calcul fractionnaire.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Identifier les priorités opératoires.</li>
    <li>Se demander quelle opération effectuer en premier.</li>
    <li>Se rappeler les règles de calcul avec les fractions :
     <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>mettre au même dénominateur pour additionner ou soustraire ;</li>
    <li>multiplier les numérateurs entre eux et les dénominateurs entre eux pour multiplier ;</li>
    <li>multiplier par l'inverse de la seconde fraction pour diviser.</li>
   </ul>
     </li>
  </ul>
`
    this.versionQcm = true
  }
}
