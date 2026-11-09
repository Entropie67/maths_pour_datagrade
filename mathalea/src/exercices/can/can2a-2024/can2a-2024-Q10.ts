/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Trouver le résultat d'un programme Python"
export const interactifReady = true

export const uuid = 'eb3e8'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.question = 'Soit le script Python : <br>'
      this.question += '$\\begin{array}{|l|}\n'
      this.question += '\\hline\n'
      this.question += '\\\n \\texttt{def mystere(a) :}  \\\n '
      this.question += `\\\\\n${sp(9)}\\texttt{b=3*a} \\\n`
      this.question += `\\\\\n${sp(9)} \\texttt{return b} \\\\\n`
      this.question += '\\hline\n'
      this.question += '\\end{array}\n$'
      this.question += '<br>Que renvoie  $\\texttt{mystere(12)}$ ?'
      this.reponse = 36
      this.correction = `L'algorithme retourne $3\\times12=${miseEnEvidence('36')}$. `
      this.canEnonce = 'Soit le script Python :<br>'
      this.canEnonce += '\\medskip'
      this.canEnonce += '\\hspace*{10mm}\\fbox{'
      this.canEnonce += '\\parbox{0.4\\linewidth}{'
      this.canEnonce += '\\setlength{\\parskip}{.5cm}'
      this.canEnonce += ' \\texttt{def mystere(a) :}\\newline'
      this.canEnonce += ' \\hspace*{7mm}\\texttt{b=3*a}\\newline'
      this.canEnonce += ' \\hspace*{7mm}\\texttt{return b}'
      this.canEnonce += '}'
      this.canEnonce += '}\\newline'
      this.canEnonce += '\\medskip'

      this.canReponseACompleter =
        'Que renvoie  $\\texttt{mystere(12)}$ ? <br> $\\ldots$'
    } else {
      const a = randint(2, 9) * choice([-1, 1])
      const choix = choice([true, false])
      const coeff = randint(2, 6) * choice([-1, 1])

      if (context.isHtml) {
        this.question = 'Soit le script Python : <br><br>'
        this.question += '$\\begin{array}{|l|}\n'
        this.question += '\\hline\n'
        this.question += '\\\n \\texttt{def mystere(a) :}  \\\n '
        this.question += `\\\\\n${sp(9)} ${choix ? `\\texttt{b=${coeff}*a}` : `\\texttt{b=${coeff}+a}`} \\\n`
        this.question += `\\\\\n${sp(9)} \\texttt{return b} \\\\\n`
        this.question += '\\hline\n'
        this.question += '\\end{array}\n$'
        this.question += `<br>Que renvoie  $\\texttt{mystere(${a})}$ ?`
      } else {
        this.question = 'Soit le script Python : <br><br>'
        this.question += '\\medskip'
        this.question += '\\hspace*{10mm}\\fbox{'
        this.question += '\\parbox{0.5\\linewidth}{'
        this.question += '\\setlength{\\parskip}{.5cm}'
        this.question += ' \\texttt{def mystere(a) :}\\newline'
        this.question += ` \\hspace*{7mm}${choix ? `\\texttt{b=${coeff}*a}` : `\\texttt{b=${coeff}+a}`}\\newline`
        this.question += ' \\hspace*{7mm}\\texttt{return b}'
        this.question += '}'
        this.question += '}\\newline'
        this.question += '\\medskip'
        this.question += `<br>Que renvoie  $\\texttt{mystere(${a})}$ ?`
      }
      this.reponse = choix ? `${coeff * a}` : `${coeff + a}`
      this.correction = ` L'algorithme retourne ${choix ? `$${coeff}\\times${ecritureParentheseSiNegatif(a)}=${miseEnEvidence(this.reponse)}$.` : `$${coeff}+${ecritureParentheseSiNegatif(a)}=${miseEnEvidence(this.reponse)}$.`} `
      this.canEnonce = 'Soit le script Python : <br><br>'
      this.canEnonce += '\\medskip'
      this.canEnonce += '\\hspace*{10mm}\\fbox{'
      this.canEnonce += '\\parbox{0.5\\linewidth}{'
      this.canEnonce += '\\setlength{\\parskip}{.5cm}'
      this.canEnonce += ' \\texttt{def mystere(a) :}\\newline'
      this.canEnonce += ` \\hspace*{7mm}${choix ? `\\texttt{b=${coeff}*a}` : `\\texttt{b=${coeff}+a}`}\\newline`
      this.canEnonce += ' \\hspace*{7mm}\\texttt{return b}'
      this.canEnonce += '}'
      this.canEnonce += '}\\newline'
      this.canEnonce += '\\medskip'
      this.canReponseACompleter = `Que renvoie  $\\texttt{mystere(${a})}$ ?<br> $\\ldots$`
    }
  }
}
