import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un coefficient binomial'
export const interactifReady = true

export const uuid = '1216d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['4mProbStat-8'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/

function fact(nbr: number) {
  let i
  let f = 1
  for (i = 1; i <= nbr; i++) {
    f = f * i // ou f *= i;
  }
  return f
}
export default class Can2025TQ23 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.lycee
    this.optionsChampTexte = { texteApres: '.' }
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const n = this.canOfficielle ? 4 : randint(3, 5)
    const k = this.canOfficielle ? 2 : choice([n - 1, n - 2])
    this.reponse = texNombre(fact(n) / (fact(k) * fact(n - k)), 0)
    this.question = `Le coefficient binomial $\\dbinom{${n}}{${k}}$ est égal à :`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `$\\dbinom{${n}}{${k}}=\\dfrac{${n}!}{${k}!\\times (${n} - ${k})!}=${miseEnEvidence(this.reponse)}$.`
    this.canEnonce = `Le coefficient binomial $\\dbinom{${n}}{${k}}$ est égal à :`
  }
}
