import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec un cosinus'
export const interactifReady = true

export const uuid = 'bdaaf'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q21 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 100 : randint(2, 9) * 100
    const coeff = this.canOfficielle ? 2024 : randint(2, 20) * 2
    const coeffb = this.canOfficielle ? 1 : choice([0, 1])
    const signe = this.canOfficielle ? '+' : choice(['+', '-'])
    this.question = ` $${a} ${signe} \\cos(${texNombre(coeff + coeffb, 0)}\\pi)$`
    this.correction =
      'Si $n$ est pair $\\cos(n\\pi)=1$ et si $n$ est impair, $\\cos(n\\pi)=-1$.<br>'
    if (signe === '+') {
      this.reponse = coeffb === 0 ? a + 1 : a - 1

      this.correction += `$${a} ${signe} \\cos(${texNombre(coeff + coeffb, 0)}\\pi)=${coeffb === 0 ? `${a} ${signe} 1` : `${a} ${signe} (-1)`}=${miseEnEvidence(this.reponse)}$`
    } else {
      this.reponse = coeffb === 0 ? a - 1 : a + 1
      this.correction += `$${a} ${signe} \\cos(${texNombre(coeff + coeffb, 0)}\\pi)=${coeffb === 0 ? `${a} ${signe} 1` : `${a} ${signe} (-1)`}=${miseEnEvidence(this.reponse)}$`
    }
  }
}
