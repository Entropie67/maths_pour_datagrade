import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Déterminer une équation cartésienne d'un cercle"
export const dateDePublication = '04/09/2025'
export const interactifReady = false
export const uuid = 'c0c0d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mEqCar-1'],
}

/**
 * Équation cartésienne d'un cercle
 * @author Nathan Scheinmann
 */

export default class ExerciceTangenteCourbe extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      const r = randint(1, 10)
      const x1 = randint(-10, 10)
      const y1 = randint(-10, 10)
      texte += `Déterminer une équation cartésienne du cercle de rayon $${r}$ et de centre $(${x1}\\,;\\,${y1})$.`
      texteCorr += `La formule de l'équation d'un cercle de centre $(x_0\\,;\\,y_0)$ et de rayon $r$ est :<br>
      \\[(x - x_0)^2 + (y - y_0)^2 = r^2\\]<br>
      Ici, $x_0 = ${x1}, y_0 = ${y1}$ et $r=${r}$. L'équation du cercle recherché est <br>
      \\[(x  ${ecritureAlgebrique(-x1)})^2 + (y  ${ecritureAlgebrique(-y1)})^2 = ${r}^2\\]
      Pour la mettre sous la forme cartésienne, on développe :<br><br>
      $\\begin{aligned}
      & x^2 - 2\\times ${ecritureParentheseSiNegatif(x1)}\\times x + ${ecritureParentheseSiNegatif(x1)}^2 + y^2 - 2\\times ${ecritureParentheseSiNegatif(y1)}\\times y + ${ecritureParentheseSiNegatif(y1)}^2 = ${r ** 2} \\\\
      & x^2 + y^2  ${ecritureAlgebriqueSauf1(-2 * x1)}x ${ecritureAlgebriqueSauf1(-2 * y1)}y  ${ecritureAlgebrique(x1 ** 2 + y1 ** 2 - r ** 2)} = 0
      \\end{aligned}$<br>
      Une équation cartésienne du cercle est donc :
      $${miseEnEvidence(`x^2 + y^2  ${ecritureAlgebriqueSauf1(-2 * x1)}x ${ecritureAlgebriqueSauf1(-2 * y1)}y  ${ecritureAlgebrique(x1 ** 2 + y1 ** 2 - r ** 2)} = 0`)}$`
      if (this.questionJamaisPosee(i, r, x1, y1)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
