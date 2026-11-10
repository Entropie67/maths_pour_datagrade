import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../../lib/outils/deprecatedFractions'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'

import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Multiplier une fraction décimale par $10$, $100$, $1\\,000$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '03/07/2025'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const uuid = '0515e'

export const refs = {
  'fr-fr': ['can6N21-06', '6N2autoC-1'],
  'fr-ch': ['NR'],
}
export default class MultiplieFractionDPar10Par100Par1000 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const a = choice([randint(11, 99), randint(100, 999), randint(2, 9)])
    const den = this.quotaChoice('den', [10, 100, 1000])
    const b = this.quotaChoice('b', [10, 100, 1000])
    const resultat = arrondi((a * b) / den, 3)
    this.question = `Calculer sous la forme d'un entier ou d'un décimal : $${texFractionFromString(a, den)}\\times${texNombre(b)}$.`
    this.correction = `$\\begin{aligned}
        ${texFractionFromString(a, den)} \\times ${texNombre(
          b,
        )} &= ${texFractionFromString(a * b, den)}\\\\
                ${texFractionFromString(a, den)} \\times ${texNombre(
                  b,
                )} & = ${miseEnEvidence(texNombre((a / den) * b, 3))}
                \\end{aligned}$`
    this.reponse = resultat
  }
}
