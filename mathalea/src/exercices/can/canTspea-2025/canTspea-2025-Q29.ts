import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Exprimer une variable en fonction d'une autre"
export const interactifReady = true

export const uuid = '14546'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ29 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  nouvelleVersion() {
    const a1 = this.canOfficielle ? 3 : randint(2, 9)
    const a2 = this.canOfficielle ? 5 : randint(2, 9, a1)
    this.reponse = {
      reponse: {
        value: `${a1}\\times b+ ${a2}`,
        options: { fonction: true, variable: 'b' },
      },
    }
    this.question = `On considère l'expression littérale $\\dfrac{1}{b}=\\dfrac{${a1}}{c-${a2}}$.<br>
    En fonction de $b$ :<br> $c=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `L'égalité des produits en croix donne : $c-${a2}=${a1}\\times b$.<br>
    Ainsi, $c=${miseEnEvidence(`${a1} b+ ${a2}`)}$.`
    this.canEnonce = `On considère l'expression littérale $\\dfrac{1}{b}=\\dfrac{${a1}}{c-${a2}}$.`
    this.canReponseACompleter = 'En fonction de $b$ : <br> $c=\\ldots$'
  }
}
