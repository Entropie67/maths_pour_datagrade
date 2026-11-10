import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Retrancher $1$ à un décimal'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '02/02/2026'
/**
 * @author  Gilles Mora
 *
 *
 */

export const uuid = 'f34bd'

export const refs = {
  'fr-fr': ['can4C4-03'],
  'fr-ch': [],
}
export default class Retrancher1 extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = choice([
      randint(2, 9) / 100,
      randint(11, 99, [20, 30, 40, 50, 60, 70, 80, 90]) / 100,
    ])

    this.question = `Calculer $${texNombre(a, 2)}-1$.`
    this.correction = `$${texNombre(a, 2)}-1=${miseEnEvidence(texNombre(a - 1, 2))}$`
    this.reponse = new Decimal(a).sub(1)

    this.canReponseACompleter = ``
  }
}
