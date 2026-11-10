import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une moyenne'
export const interactifReady = true

export const uuid = '93a9e'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculMoyenne extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteApres: '.' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? -3 : randint(-5, -2)
    const b = this.canOfficielle ? 8 : randint(6, 10)
    const d = this.canOfficielle ? 15 : randint(3, 7) * 3

    const c = d - a - b
    this.reponse = d / 3
    this.question = `$${a}$ ${sp(4)} ; ${sp(4)} $${b}$ ${sp(4)} ; ${sp(4)} $${c}$<br>
         La moyenne de ces trois nombres est : `
    this.correction = `La somme des $3$ valeurs est : $${a}+${b}+${c} =${d}$.<br>
                   La moyenne est donc $\\dfrac{${d}}{3}=${miseEnEvidence(this.reponse)}$.`

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }
}
