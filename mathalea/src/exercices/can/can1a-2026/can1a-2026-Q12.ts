import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer la valeur affichée par un algorithme'
export const interactifReady = true

export const uuid = '00ni3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q28 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(uInit?: number, coeff?: number, nbTours?: number): void {
    if (uInit == null || coeff == null || nbTours == null) {
      nbTours = 2
      coeff = randint(1, 7)
      // On choisit uInit petit pour que le résultat reste raisonnable
      uInit = randint(1, 3)
    }

    // Simulation : for k in range(nbTours): u = u*u - coeff
    let u = uInit
    let detail = `Initialisation : $u=${uInit}$.<br>`
    for (let k = 0; k < nbTours; k++) {
      const ancien = u
      u = u * u - coeff
      detail += `$k=${k}$ : $u=${ancien}\\times ${ecritureParentheseSiNegatif(ancien)}-${coeff}=${ancien * ancien}-${coeff}=${u}$<br>`
    }

    this.reponse = String(u)

    if (context.isHtml) {
      this.question = '$\\begin{array}{|l|}\n'
      this.question += '\\hline\n'
      this.question += '\\\n \\texttt{def mystere(u) :}  \\\n '
      this.question += `\\\\\n${sp(9)}\\texttt{for k in range(${nbTours}) :} \\\n`
      this.question += `\\\\\n${sp(18)}\\texttt{u = u*u - ${coeff}} \\\n`
      this.question += `\\\\\n${sp(9)}\\texttt{return u} \\\\\n`
      this.question += '\\hline\n'
      this.question += '\\end{array}\n$'
      this.question += `<br>Que renvoie $\\texttt{mystere(${uInit})}$ ?`
    } else {
      this.question = '\\medskip'
      this.question += '\\hspace*{10mm}\\fbox{'
      this.question += '\\parbox{0.6\\linewidth}{'
      this.question += '\\setlength{\\parskip}{.5cm}'
      this.question += ' \\texttt{def mystere(u) :}\\newline'
      this.question += ` \\hspace*{7mm}\\texttt{for k in range(${nbTours}) :}\\newline`
      this.question += ` \\hspace*{14mm}\\texttt{u = u*u - ${coeff}}\\newline`
      this.question += ' \\hspace*{7mm}\\texttt{return u}'
      this.question += '}'
      this.question += '}\\newline'
      this.question += '\\medskip'
      this.question += `<br>Que renvoie $\\texttt{mystere(${uInit})}$ ?`
    }

    this.correction = `On exécute la boucle pas à pas :<br>${detail}
    L'algorithme retourne $u=${miseEnEvidence(String(u))}$.`

    this.canEnonce = '\\medskip'
    this.canEnonce += '\\hspace*{10mm}\\colorbox{lightgray}{'
    this.canEnonce += '\\parbox{0.6\\linewidth}{'
    this.canEnonce += ' \\texttt{def mystere(u) :}\\newline'
    this.canEnonce += ` \\hspace*{7mm}\\texttt{for k in range(${nbTours}) :}\\newline`
    this.canEnonce += ` \\hspace*{14mm}\\texttt{u = u*u - ${coeff}}\\newline`
    this.canEnonce += ' \\hspace*{7mm}\\texttt{return u}'
    this.canEnonce += '}}'
    this.canEnonce += `\\newline Que renvoie $\\texttt{mystere(${uInit})}$ ?`

    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(2, 5, 2)
    else this.enonce()
  }
}
