import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une moyenne'
export const interactifReady = true

export const uuid = 'a34f6'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: '.' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 22
      this.question = `$20$ ${sp(4)} ; ${sp(4)} $16$ ${sp(4)} ; ${sp(4)} $30$<br>
      La moyenne de ces trois nombres est : `
      this.correction = `La somme des $3$ valeurs est : $20+16+30 =66$.<br>
      La moyenne est donc $\\dfrac{66}{3}=${miseEnEvidence(this.reponse)}$.`
    } else {
      const a = randint(2, 6)
      const b = randint(8, 15)
      const d = choice([27, 30, 33, 36, 39, 42, 45, 48])

      const c = d - a - b
      this.reponse = d / 3
      this.question = `$${a}$ ${sp(4)} ; ${sp(4)} $${b}$ ${sp(4)} ; ${sp(4)} $${c}$<br>
      La moyenne de ces trois nombres est : `
      this.correction = `La somme des $3$ valeurs est : $${a}+${b}+${c} =${d}$.<br>
                La moyenne est donc $\\dfrac{${d}}{3}=${miseEnEvidence(this.reponse)}$.`
    }

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }
}
