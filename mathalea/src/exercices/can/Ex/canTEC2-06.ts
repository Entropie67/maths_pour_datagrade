import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { Complexe } from '../../../lib/mathFonctions/Complexe'
import { choice } from '../../../lib/outils/arrayOutils'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Donner un complexe à partir de son expression trigonométrique'

export const dateDePublication = '01/01/2026'

export const uuid = '16c6f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote
 */
export default class DifferentesEcrituresDesComplexes extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.reponse = ''
  }

  nouvelleVersion() {
    if (choice([true, false])) {
      const z = Complexe.fromPolar(
        randint(1, 5),
        (Math.PI / choice([2, 3, 4, 6])) * randint(1, 5) * choice([-1, 1]),
      )
      this.question = `Soit le nombre complexe $z=${z.texExpoForm()}$.<br> Écrire $z$ sous forme trigonométrique algébrique. `
      this.reponse = z.tex()
      this.correction = `On a :<br>$\\begin{aligned}z&=${z.texExpoForm()}\\\\&=${z.texTrigoForm()}\\\\&=${miseEnEvidence(z.tex())}\\end{aligned}$`
    } else {
      const z = new Complexe(
        randint(0, 5) * choice([-1, 2]),
        randint(0, 5) * choice([-1, 2]),
      )
      this.question = `Soit le nombre complexe $z=${z.tex()}$.<br> Écrire $z$ sous forme trigonométrique exponentielle. `
      this.reponse = z.texExpoForm()
      this.correction = `On a :<br>$\\begin{aligned}z&=${z.tex()}\\\\&=${z.texTrigoForm()}\\\\&=${miseEnEvidence(z.texExpoForm())}\\end{aligned}$`
    }
  }
}
