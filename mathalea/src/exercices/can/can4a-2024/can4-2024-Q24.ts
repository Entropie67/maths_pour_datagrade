import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Réduire une expression littérale'
export const interactifReady = true

export const uuid = '23d19'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable

    this.optionsChampTexte = { texteAvant: ' $=$', texteApres: '.' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = `${reduireAxPlusB(16, -5)}`
      this.question = 'Réduis'
      this.question += this.interactif ? ' : <br> ' : ' '
      this.question += '$2x-5+14x$'
      this.correction = `$2x-5+14x=${miseEnEvidence('16x-5')}$`
    } else {
      const a = randint(2, 9)
      const b = randint(2, 9)
      const c = randint(2, 9)
      const d = randint(2, 9)
      this.question = 'Réduire ' + (this.interactif ? ' : <br> ' : ' ')
      if (choice([true, false])) {
        this.reponse = `${reduireAxPlusB(a + c, b + d)}`
        this.question += `$${a}x+${b}+${c}x+${d}$ `
        this.correction = ` On réduit l'expression :<br>
        $\\begin{aligned}
        ${a}x+${b}+${c}x+${d}&=${a}x+${c}x+${b}+${d}\\\\
        &=${miseEnEvidence(this.reponse)}
        \\end{aligned}$`
      } else {
        this.reponse = `${reduireAxPlusB(a + c, b)}`
        this.question += `$${a}x+${b}+${c}x$`
        this.correction = ` On réduit l'expression :<br>
        $\\begin{aligned}
        ${a}x+${b}+${c}x&=${a}x+${c}x+${b}\\\\
        &=${miseEnEvidence(this.reponse)}
        \\end{aligned}$`
      }
    }
  }
}
