import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Donner la valeur d'une variable après exécution d'un script"
export const interactifReady = true

export const uuid = '31vj3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ11 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(a?: number, nInit?: number, k?: number): void {
    if (a == null || nInit == null || k == null) {
      k = choice([2, 3])
      nInit = randint(2, 3)
      // On choisit a pour que la boucle fasse 2 à 4 tours
      const nbTours = randint(2, 3)
      const nFinal = nInit * k ** nbTours
      a = randint(Math.floor(nFinal / k), nFinal - 1)
    }

    // Simulation
    let n = nInit
    let detail = `Initialisation : $n=${nInit}$.<br>`
    let tour = 0
    while (n <= a) {
      n = n * k
      tour++
      detail += `Tour $${tour}$ : $n=${n}$ ${n <= a ? `($${n}\\leqslant ${a}$ : on continue)` : `($${n}> ${a}$ : on sort)`}<br>`
    }

    this.reponse = String(n)

    if (context.isHtml) {
      this.question = 'On considère le script Python :<br>'
      this.question += `$\\begin{array}{|l|}
\\hline\\\\
\\texttt{a = ${a}}\\\\
\\texttt{n = ${nInit}}\\\\
\\texttt{while n <= a:}\\\\
${sp(9)}\\texttt{n = n * ${k}} \\\\
\\hline
\\end{array}$<br>`
      this.question += `Valeur de $n$ après exécution du script :<br>`
    } else {
      this.question = 'On considère le script Python :<br>'
      this.question += `$\\begin{array}{|l|}
\\hline\\\\
 \\texttt{a = ${a}}\\\\
\\texttt{n = ${nInit}}\\\\
\\texttt{while n <= a:}\\\\
 ${sp(9)}\\texttt{n = n * ${k}} \\\\
\\hline
\\end{array}$<br>`
      this.question += `Valeur de $n$ après exécution du script :<br>`
    }

    if (!this.interactif) {
      this.question += '$n=\\ldots$'
    } else {
      this.question += '$n=$'
    }

    this.correction = `On exécute la boucle tant que $n\\leqslant ${a}$ :<br>${detail}
    La valeur de $n$ après exécution est $n=${miseEnEvidence(String(n))}$.`

    this.canEnonce = 'On considère le script Python :\\newline'
    this.canEnonce += '\\medskip\\newline'
    this.canEnonce += '\\hspace*{5mm}\\colorbox{lightgray}{'
    this.canEnonce += '\\parbox{0.5\\linewidth}{'
    this.canEnonce += `\\texttt{a = ${a}}\\newline`
    this.canEnonce += `\\texttt{n = ${nInit}}\\newline`
    this.canEnonce += `\\texttt{\\textbf{while} n <= a:}\\newline`
    this.canEnonce += `\\hspace*{7mm}\\texttt{n = n * ${k}}`
    this.canEnonce += '}}'
    this.canReponseACompleter = `Valeur de $n$ après exécution du script :\\newline $n=\\ldots$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(13, 2, 3)
    else this.enonce()
  }
}
