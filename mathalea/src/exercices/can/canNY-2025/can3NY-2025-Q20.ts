import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import FractionEtendue from '../../../modules/FractionEtendue'
export const titre = 'Additionner deux fractions'
export const interactifReady = true

export const uuid = 'eebe6'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class additionFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsDeComparaison = { fractionEgale: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 10)

    if (this.quotaChoice('sens', [true, false])) {
      this.reponse = new FractionEtendue(1 + 2 * a, 4050).toLatex()
      this.question = `Calculer sous la forme d'une fraction :<br>
    $\\dfrac{${a}}{${texNombre(2025, 0)}} +\\dfrac{1}{${texNombre(4050)}}$`

      this.correction = ` $\\dfrac{${a}}{${texNombre(2025, 0)}} +\\dfrac{1}{${texNombre(4050, 0)}}=\\dfrac{${2 * a}}{${texNombre(4050, 0)}} +\\dfrac{1}{${texNombre(4050, 0)}}=${miseEnEvidence(`\\dfrac{${1 + 2 * a}}{${texNombre(4050, 0)}}`)}$`
    } else {
      this.reponse = new FractionEtendue(2 * a - 1, 4050).toLatex()
      this.question = `Calculer sous la forme d'une fraction : <br>
    $\\dfrac{${a}}{${texNombre(2025, 0)}} -\\dfrac{1}{${texNombre(4050)}}$`
      this.correction = ` $\\dfrac{${a}}{${texNombre(2025, 0)}} -\\dfrac{1}{${texNombre(4050, 0)}}=\\dfrac{${2 * a}}{${texNombre(4050, 0)}} -\\dfrac{1}{${texNombre(4050, 0)}}=${miseEnEvidence(`\\dfrac{${2 * a - 1}}{${texNombre(4050, 0)}}`)}$`
    }
  }
}
