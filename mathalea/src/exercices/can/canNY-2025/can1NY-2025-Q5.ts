import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec des fractions'
export const interactifReady = true

export const uuid = '1c3f8'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora+EE
 */
export default class calculsFractions extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2023, 2026)
    if (this.quotaChoice('choix', [true, false])) {
      this.question = `Calculer  $\\left(\\dfrac{1}{${texNombre(2025, 0)}}\\div \\dfrac{1}{${texNombre(2025, 0)}}\\right)\\div\\dfrac{1}{${texNombre(a, 0)}}$.`
      this.reponse = a
      this.correction = `$\\left(\\dfrac{1}{${texNombre(2025, 0)}}\\div \\dfrac{1}{${texNombre(2025, 0)}}\\right)\\div\\dfrac{1}{${texNombre(a, 0)}}=1\\div \\dfrac{1}{${texNombre(a, 0)}}=${miseEnEvidence(texNombre(this.reponse, 0))}$`
      if (this.interactif) {
        this.question = `Calculer.<br><br>  $\\left(\\dfrac{1}{${texNombre(2025, 0)}}\\div \\dfrac{1}{${texNombre(2025, 0)}}\\right)\\div\\dfrac{1}{${texNombre(a, 0)}}$`
      }
    } else {
      this.question = `Calculer  $\\left(\\dfrac{1}{${texNombre(2025, 0)}}\\times \\dfrac{${texNombre(2025, 0)}}{${texNombre(a, 0)}}\\right)\\div\\dfrac{1}{${texNombre(a, 0)}}$`
      this.reponse = 1
      this.correction = `$\\left(\\dfrac{1}{${texNombre(2025, 0)}}\\times \\dfrac{${texNombre(2025, 0)}}{${texNombre(a, 0)}}\\right)\\div\\dfrac{1}{${texNombre(a, 0)}}=\\dfrac{1}{${texNombre(a, 0)}}\\times ${texNombre(a, 0)}=${miseEnEvidence(texNombre(this.reponse, 0))}$`
      if (this.interactif) {
        this.question = `Calculer.<br><br>  $\\left(\\dfrac{1}{${texNombre(2025, 0)}}\\times \\dfrac{${texNombre(2025, 0)}}{${texNombre(a, 0)}}\\right)\\div\\dfrac{1}{${texNombre(a, 0)}}$`
      }
    }
  }
}
