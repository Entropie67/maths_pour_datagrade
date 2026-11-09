import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer les coordonnées d’un point sur une droite'
export const interactifReady = true

export const dateDePublication = '04/11/2022'
/**
 * @author Gilles Mora
 */

export const uuid = 'dfe60'

export const refs = {
  'fr-fr': ['can2G30-07', '2G31-flash4'],
  'fr-ch': [],
}
export default class CoordonneesPointDroite extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { texteSansCasse: true }
    this.formatChampTexte = KeyboardType.clavierEnsemble
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', -10, 10, [0])
    const b = this.quotaRandint('b', -10, 10, [0])
    const c = this.quotaRandint('c', -10, 10, [0])

    this.reponse = `${c};${a * c + b}`
    this.question = ` Déterminer les coordonnées du point ${context.isDiaporama ? '<br>' : ''} de la droite 
        d'équation $y=${reduireAxPlusB(a, b)}$ ${context.isDiaporama ? '<br>' : ''}dont l'abscisse est $${c}$.
       `

    if (this.interactif) {
      this.optionsChampTexte = { texteApres: '$)$' }
      this.question += '<br>$($'
    }
    if (a === 1) {
      this.correction = `Puisque $${c}$ est l'abscisse de ce point, son ordonnée est donnée par :<br>
        $y= ${c}+${ecritureParentheseSiNegatif(b)}=${a * c + b}$.<br>
  Les coordonnées du point sont donc : $${miseEnEvidence(`(${c};${texNombre(a * c + b)})`)}$.`
    } else {
      this.correction = `Puisque $${c}$ est l'abscisse de ce point, son ordonnée est donnée par :<br>

  $y=${a}\\times ${ecritureParentheseSiNegatif(c)}+${ecritureParentheseSiNegatif(b)}=${a * c} + ${ecritureParentheseSiNegatif(b)}=${a * c + b}$.<br>
  Les coordonnées du point sont donc : $${miseEnEvidence(`(${c};${texNombre(a * c + b)})`)}$.`
    }

    this.canEnonce = ` Déterminer les coordonnées du point de la droite
    d'équation $y=${reduireAxPlusB(a, b)}$ dont l'abscisse est $${c}$. `
  }
}
