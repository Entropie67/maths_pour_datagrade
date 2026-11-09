import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'

import { bleuMathalea } from '../../../lib/colors'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer le complément à $100$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote & Gilles Mora
 * Créé pendant l'été 2021
 */
export const uuid = 'd656b'

export const refs = {
  'fr-fr': ['can6C1-06'],
  'fr-ch': [],
}
export default class ComplementACent extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.typeExercice = 'simple'
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 11, 49, [20, 30, 40])
    this.question = `Calculer $100-${a}$.`
    this.correction = `$100-${a}=${miseEnEvidence(100 - a)}$<br>`
    this.reponse = 100 - a
    this.correction += texteEnCouleur(
      `Mentalement : <br>
    On décompose $${a}$ en $${a - (a % 10)}+${a % 10}$. Retrancher $${a}$ revient à retrancher d'abord  $${a - (a % 10)}$  puis $${a % 10}$. <br>
    Ainsi, $100-${a}=\\underbrace{100-${a - (a % 10)}}_{${100 - (a - (a % 10))}}-${a % 10}=${100 - (a - (a % 10))}-${a % 10}=${100 - a}$.
     `,
      bleuMathalea,
    )
  }
}
