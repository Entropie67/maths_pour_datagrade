import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Exécuter un script Python'
export const interactifReady = true

export const uuid = 'iwcdv'
/**
 * Question 10 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ10 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    this.reponse = '-15'
    let question = 'Soit le script Python :<br> '
    if (context.isHtml) {
      question += '$\\begin{array}{|l|}\n'
      question += '\\hline\n'
      question += '\\\\\n \\texttt{def mystere(a) :}  \\\\\n '
      question += `\\\\\n ${sp(6)} \\texttt{if a>0 :}\\\\\n `
      question += `\\\\\n ${sp(12)} \\texttt{return 2*a}\\\\\n `
      question += `\\\\\n ${sp(6)} \\texttt{else :}\\\\\n `
      question += `\\\\\n ${sp(12)} \\texttt{return 3*a}\\\\\n `
      question += '\\hline\n'
      question += '\\end{array}\n$'
    } else {
      question += '\\medskip'
      question += '\\fbox{'
      question += '\\parbox{0.7\\linewidth}{'
      question += '\\setlength{\\parskip}{.5cm}'
      question += ' \\texttt{def mystere(a) :}\\newline'
      question += ' \\hspace*{3mm}\\texttt{if a>0 :}\\newline'
      question += ' \\hspace*{8mm}\\texttt{return 2*a}\\newline'
      question += ' \\hspace*{3mm}\\texttt{else :}\\newline'
      question += ' \\hspace*{8mm}\\texttt{return 3*a}\\newline'
      question += '}'
      question += '}\\newline'
      question += '\\medskip'
    }
    this.question = question + '<br><br>Que renvoie $\\texttt{mystere(-5)}$ ? '
    this.correction = `$-5 < 0 $ donc le script renvoie $-5 \\times 3 = ${miseEnEvidence('-15')}$.`
  }
}
