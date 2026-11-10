import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

import { bleuMathalea } from '../../../lib/colors'
import { arrondi } from '../../../lib/outils/nombres'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver le complément à $1$ avec des centièmes'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * @author Jean-claude Lhote & Gilles Mora
 * Créé pendant l'été 2021
 */
export const uuid = '89135'

export const refs = {
  'fr-fr': ['can6C3-04', '6N2A-flash3', '5N2autoA-6'],
  'fr-ch': ['NR'],
}
export default class ComplementAUn extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const a =
      this.quotaRandint('dixieme', 1, 9) / 10 +
      this.quotaRandint('centieme', 1, 9) / 100
    this.question = `Calculer $1-${texNombre(a)}$.`
    this.correction = `$1-${texNombre(a)}=${miseEnEvidence(texNombre(1 - a))}$<br><br>`
    this.correction += texteEnCouleur(
      `Mentalement : <br>
    $1$ unité = $100$ centièmes.<br>
    On enlève $${texNombre(100 * a)}$ centièmes à $100$ centièmes, il en reste $${texNombre(100 * (1 - a))}$.<br>
    Ainsi, $1-${texNombre(a)}=${texNombre(1 - a)}$.  `,
      bleuMathalea,
    )
    this.reponse = arrondi(1 - a)
  }
}
