import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Utiliser un script Python'
export const interactifReady = true

export const uuid = '9e9fb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q12 extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 3 : randint(-5, 5, [-1, 0, 1])
    const coeff = this.canOfficielle ? 2 : randint(-3, 3, [-1, 0, 1])
    this.question = 'Soit le script Python : <br><br>'
    if (context.isHtml) {
      this.question += `$\\begin{array}{|l|}
      \\hline
      \\texttt{def resultat(a) :}  \\\\
      ${sp(9)} \\texttt{return (a**2${ecritureAlgebrique(coeff)}*a)} \\\\
      \\hline
      \\end{array}$<br><br>
      Que renvoie  $\\texttt{resultat(${a})}$ ?`
    } else {
      this.question += `\\hspace*{10mm}\\fbox{
      \\parbox{0.5\\linewidth}{\\setlength{\\parskip}{.5cm}
      \\texttt{def resultat(a) :}\\\\
       \\hspace*{7mm}\\texttt{return (a**2${ecritureAlgebrique(coeff)}*a)}
       }
      }\\\\
      \\medskip
      
      Que renvoie  $\\texttt{resultat(${a})}$ ?`
    }
    this.reponse = a ** 2 + coeff * a
    this.correction = ` L'algorithme retourne $${ecritureParentheseSiNegatif(a)}^2${ecritureAlgebrique(coeff)}\\times${ecritureParentheseSiNegatif(a)}=${miseEnEvidence(this.reponse)}$.`
    this.canEnonce = `\\hspace*{10mm}\\fbox{\\parbox{0.6\\linewidth}{\\setlength{\\parskip}{.5cm}
    \\texttt{def resultat(a) :}\\\\
    \\hspace*{7mm}\\texttt{return (a**2${ecritureAlgebrique(coeff)}*a)}
     }
    }`
    this.canReponseACompleter = `$\\texttt{resultat(${a})}$ renvoie <br> $\\ldots$`

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
