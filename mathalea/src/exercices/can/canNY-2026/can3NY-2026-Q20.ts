import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import FractionEtendue from '../../../modules/FractionEtendue'
export const titre = 'Additionner deux fractions'
export const interactifReady = true

export const uuid = 'e4h54'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class additionFraction2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    // this.optionsDeComparaison = { fractionEgale: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 2 : this.quotaRandint('a', 1, 10)
    const annee = 2026
    // this.question = `Calculer sous la forme d'une fraction :<br>`
    this.question = `Calculer :<br>`
    if (this.canOfficielle ? true : this.quotaChoice('sens', [true, false])) {
      this.reponse = new FractionEtendue(1 + 2 * a, 2 * annee).toLatex()
      this.question += `$\\dfrac{${a}}{${texNombre(annee, 0)}} +\\dfrac{1}{${texNombre(2 * annee)}}$`

      this.correction = ` $\\dfrac{${a}}{${texNombre(annee, 0)}} +\\dfrac{1}{${texNombre(2 * annee, 0)}}=\\dfrac{${2 * a}}{${texNombre(2 * annee, 0)}} +\\dfrac{1}{${texNombre(2 * annee, 0)}}=${miseEnEvidence(`\\dfrac{${1 + 2 * a}}{${texNombre(2 * annee, 0)}}`)}$`
    } else {
      this.reponse = new FractionEtendue(2 * a - 1, 2 * annee).toLatex()
      this.question += `$\\dfrac{${a}}{${texNombre(annee, 0)}} -\\dfrac{1}{${texNombre(2 * annee)}}$`
      this.correction = ` $\\dfrac{${a}}{${texNombre(annee, 0)}} -\\dfrac{1}{${texNombre(2 * annee, 0)}}=\\dfrac{${2 * a}}{${texNombre(2 * annee, 0)}} -\\dfrac{1}{${texNombre(2 * annee, 0)}}=${miseEnEvidence(`\\dfrac{${2 * a - 1}}{${texNombre(2 * annee, 0)}}`)}$`
    }
  }
}
