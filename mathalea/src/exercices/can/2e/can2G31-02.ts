import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texFractionReduite } from '../../../lib/outils/deprecatedFractions'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer les coordonnées du point d’intersection entre l’axe des ordonnées et une droite'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = '898a7'

export const refs = {
  'fr-fr': ['can2G31-02', '2G32-flash2'],
  'fr-ch': [],
}
export default class CoordonneesPointIntersectionAxeOrdonneesDroite extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { texteSansCasse: true }
    this.formatChampTexte = KeyboardType.clavierEnsemble
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', -10, 10, [0])
    const b = this.quotaRandint('b', 1, 10)
    const n = this.quotaRandint('n', -5, 5, [0])
    const c = n * b

    this.reponse = `0;${-c / b}`
    if (c > 0) {
      this.question = `Déterminer les coordonnées du point d'intersection ${context.isDiaporama ? '<br>' : ''} entre la droite d'équation $${rienSi1(a)}x+${rienSi1(b)}y+${c}=0$ ${context.isDiaporama ? '<br>' : ''} et l'axe des ordonnées.<br>
       `
      this.correction = `Puisque le point d'intersection se situe sur l'axe des ordonnées, son abscisse est nulle ($x=0$).
    <br>
  Son ordonnée est donc la solution de l'équation : $${rienSi1(b)}y+${c}=0$, c'est-à-dire $y=${texFractionReduite(-c, b)}$.
  <br>Les coordonnées de ce point sont donc : $${miseEnEvidence(`(0; ${texFractionReduite(-c, b)})`)}$.`

      this.canEnonce = `Déterminer les coordonnées du point d'intersection entre la droite d'équation $${rienSi1(a)}x+${rienSi1(b)}y+${c}=0$ et l'axe des ordonnées.`
    } else {
      this.question = `Déterminer les coordonnées du point d'intersection ${context.isDiaporama ? '<br>' : ''} entre la droite d'équation $${rienSi1(a)}x+${rienSi1(b)}y${c}=0$ ${context.isDiaporama ? '<br>' : ''} et l'axe des ordonnées.<br>
  `
      this.correction = `Puisque le point d'intersection se situe sur l'axe des ordonnées, son abscisse est nulle ($x=0$).
<br>
Son ordonnée est donc la solution de l'équation : $${rienSi1(b)}y${c}=0$, c'est-à-dire $y=${texFractionReduite(-c, b)}$.
<br>Les coordonnées de ce point sont donc : $${miseEnEvidence(`(0;${texFractionReduite(-c, b)})`)}$.`

      this.canEnonce = `Déterminer les coordonnées du point d'intersection entre la droite d'équation $${rienSi1(a)}x+${rienSi1(b)}y${c}=0$ et l'axe des ordonnées.`
    }
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: '$)$' }
      this.question += '<br>$($'
    }
  }
}
