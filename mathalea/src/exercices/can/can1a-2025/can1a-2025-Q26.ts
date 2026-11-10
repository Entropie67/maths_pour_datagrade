import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Déterminer un taux global d'évolution"
export const interactifReady = true

export const uuid = '54342'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q26 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteApres: '$\\%$.' }
  }

  nouvelleVersion() {
    const dim = this.canOfficielle ? 10 : randint(2, 6) * 10
    const coeffmul = this.canOfficielle ? 0.9 : 1 - dim / 100

    this.reponse = texNombre((1 - coeffmul ** 2) * 100, 2)
    this.question = `Deux diminutions successives de  $${dim}\\,\\%$ correspondent à une diminution globale de `

    if (!this.interactif) {
      this.question += ' $\\ldots \\,\\%$.'
    }
    this.correction = ` Le coefficient multiplicateur  associé à une baisse de $${dim}\\,\\%$ est $${texNombre(coeffmul, 2)}$.<br>
    Le coefficient multiplicateur global associé à ces deux diminutions est $${texNombre(coeffmul, 2)}\\times ${texNombre(coeffmul, 2)}= ${texNombre(coeffmul ** 2, 2)}$.<br>
    On en déduit que le taux d'évolution global est $${texNombre(coeffmul ** 2, 2)}-1=${texNombre(coeffmul ** 2 - 1, 2)}$.<br>
    La diminution globale est donc de $${miseEnEvidence(this.reponse)} \\,\\%$.`
    this.canReponseACompleter = ' $\\ldots \\,\\%$.'
  }
}
