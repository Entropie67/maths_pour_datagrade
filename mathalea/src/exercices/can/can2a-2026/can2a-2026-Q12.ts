import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calcul retourné par un algorithme'
export const interactifReady = true

export const uuid = '697jm'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q12 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(a?: number, coeff?: number): void {
    if (a == null || coeff == null) {
      a = randint(5, 9)
      coeff = randint(2, 5)
    }

    // b = a*a - coeff, return 2*b
    const resultat = 2 * (a * a - coeff)

    this.reponse = resultat.toString()

    if (context.isHtml) {
      this.question = `$\\begin{array}{|l|}
\\hline
\\texttt{def mystere(a) :}\\\\
\\quad\\texttt{b=a*a-${coeff}}\\\\
\\quad\\texttt{return 2*b}\\\\
\\hline
\\end{array}$`
      this.question += `<br>Que renvoie $\\texttt{mystere(${a})}$ ?`
    } else {
      this.question = '\\medskip'
      this.question += '\\hspace*{10mm}\\fbox{'
      this.question += '\\parbox{0.5\\linewidth}{'
      this.question += '\\setlength{\\parskip}{.5cm}'
      this.question += ' \\texttt{def mystere(a) :}\\newline'
      this.question += ` \\hspace*{7mm}\\texttt{b=a*a-${coeff}}\\newline`
      this.question += ' \\hspace*{7mm}\\texttt{return 2*b}'
      this.question += '}'
      this.question += '}\\newline'
      this.question += '\\medskip'
      this.question += `<br>Que renvoie $\\texttt{mystere(${a})}$ ?`
    }

    this.correction = `L'algorithme retourne $2\\times (${a}\\times ${a}-${coeff})=2\\times ${a * a - coeff}=${miseEnEvidence(resultat)}$.`

    this.canEnonce = '\\medskip'
    this.canEnonce += '\\hspace*{10mm}\\fbox{'
    this.canEnonce += '\\parbox{0.5\\linewidth}{'
    this.canEnonce += '\\setlength{\\parskip}{.5cm}'
    this.canEnonce += ' \\texttt{def mystere(a) :}\\newline'
    this.canEnonce += ` \\hspace*{7mm}\\texttt{b=a*a-${coeff}}\\newline`
    this.canEnonce += ' \\hspace*{7mm}\\texttt{return 2*b}'
    this.canEnonce += '}'
    this.canEnonce += '}'
    this.canEnonce += `<br>Que renvoie $\\texttt{mystere(${a})}$ ?`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(8, 3)
    else this.enonce()
  }
}
