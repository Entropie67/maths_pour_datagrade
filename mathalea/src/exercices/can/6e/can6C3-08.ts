import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { miseEnEvidence } from '../../../lib/outils/embellissements'
export const titre = 'Calculer la moitié d’un nombre décimal'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '13/09/2022'

/**
 * @author Gilles Mora
 */

export const uuid = 'bfec4'

export const refs = {
  'fr-fr': ['can6C3-08', '6N2H-flash1'],
  'fr-ch': [],
}
export default class CalculMoitieDecimal extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const a = choice([
      new Decimal(randint(1, 10) * 2 + 1).div(2),
      new Decimal(randint(0, 10) * 2 + 1).div(10),
    ])
    this.reponse = new Decimal(a).div(2)
    this.question = `Calculer la moitié de $${texNombre(a, 1)}$.`
    this.correction = `$${texNombre(a, 1)}\\div 2=${miseEnEvidence(texNombre(Number(this.reponse), 2))}$
          `
  }
}
