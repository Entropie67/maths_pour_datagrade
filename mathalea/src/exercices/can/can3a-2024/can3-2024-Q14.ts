import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec un programme de calcul'
export const interactifReady = true

export const uuid = 'f9727'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 9
      if (context.isHtml) {
        this.question = 'Nombre de départ <br>'
        this.question += `${sp(15)}$\\downarrow$<br>`
        this.question += '$\\begin{array}{|l|}\n'
        this.question += '\\hline\n'
        this.question += '\\\n \\text{Soustraire } 5 \\\n'
        this.question += '\\\\\n \\text{Prendre son carré } \\\\\n '
        this.question += '\\hline\n'
        this.question += '\\end{array}\n$<br>'
        this.question += `${sp(15)}$\\downarrow$<br>
       `
        this.question += `${sp(7)}Résultat<br>`
      } else {
        this.question = `${sp(2)}\\texttt{Nombre de départ}`
        this.question += `<br>${sp(8)}$\\downarrow$<br>`
        this.question += `${sp(8)} \\fbox{ \\texttt{Soustraire } 5}`
        this.question += `<br>${sp(8)}$\\downarrow$<br>`
        this.question += `${sp(8)} \\fbox{ \\texttt{Prendre son carré } }`
        this.question += `<br>${sp(8)}$\\downarrow$<br>`
        this.question += `${sp(4)}\\texttt{Résultat}`
        this.question += '<br>'
      }
      this.question += 'Quel est le résultat  si le nombre de départ est $2$ ?'
      this.correction = `On soustrait $5$, on obtient : $2-5=-3$.<br>
      En prenant le carré, on obtient  : $(-3)^2=${miseEnEvidence(this.reponse)}$.`
    } else {
      if (choice([true, false])) {
        const a = randint(6, 10)
        const choix = randint(1, a - 1)
        this.reponse = (choix - a) ** 2
        if (context.isHtml) {
          this.question = 'Nombre de départ <br>'
          this.question += `${sp(15)}$\\downarrow$<br>`
          this.question += '$\\begin{array}{|l|}\n'
          this.question += '\\hline\n'
          this.question += `\\\n \\text{Soustraire } ${a} \\\n`
          this.question += '\\\\\n \\text{Prendre son carré } \\\\\n '
          this.question += '\\hline\n'
          this.question += '\\end{array}\n$<br>'
          this.question += `${sp(15)}$\\downarrow$<br>
         `
          this.question += `${sp(7)}Résultat<br>`
        } else {
          this.question = `${sp(2)}\\texttt{Nombre de départ}`
          this.question += `<br>${sp(8)}$\\downarrow$<br>`
          this.question += `${sp(8)} \\fbox{ \\texttt{Soustraire } ${a}}`
          this.question += `<br>${sp(8)}$\\downarrow$<br>`
          this.question += `${sp(8)} \\fbox{ \\texttt{Prendre son carré } }`
          this.question += `<br>${sp(8)}$\\downarrow$<br>`
          this.question += `${sp(4)}\\texttt{Résultat}`
          this.question += '<br>'
        }
        this.question += `Quel est le résultat  si le nombre de départ est $${choix}$ ?`
        this.correction = `On soustrait $${a}$, on obtient : $${choix}-${a}=${choix - a}$.<br>
         En prenant le carré, on obtient  : $${ecritureParentheseSiNegatif(choix - a)}^2=${miseEnEvidence(this.reponse)}$.
        `
      } else {
        const a = randint(1, 10)
        const choix = randint(-10, -1)
        this.reponse = (choix + a) ** 2
        if (context.isHtml) {
          this.question = 'Nombre de départ <br>'
          this.question += `${sp(15)}$\\downarrow$<br>`
          this.question += '$\\begin{array}{|l|}\n'
          this.question += '\\hline\n'
          this.question += `\\\n \\text{Ajouter } ${a} \\\n`
          this.question += '\\\\\n \\text{Prendre son carré } \\\\\n '
          this.question += '\\hline\n'
          this.question += '\\end{array}\n$<br>'
          this.question += `${sp(15)}$\\downarrow$<br>
         `
          this.question += `${sp(8)}Résultat`
          this.question += '<br>'
        } else {
          this.question = `${sp(2)}\\texttt{Nombre de départ}`
          this.question += `<br>${sp(8)}$\\downarrow$<br>`
          this.question += `${sp(8)} \\fbox{ \\texttt{Ajouter } ${a}}`
          this.question += `<br>${sp(8)}$\\downarrow$<br>`
          this.question += `${sp(8)} \\fbox{ \\texttt{Prendre son carré } }`
          this.question += `<br>${sp(8)}$\\downarrow$<br>`
          this.question += `${sp(4)}\\texttt{Résultat}`
          this.question += '<br>'
        }
        this.question += `Quel est le résultat  si le nombre de départ est $${choix}$ ?`
        this.correction = `On ajoute  $${a}$, on obtient : $${choix}+${a}=${choix + a}$.<br>
       En prenant le carré, on obtient  : $${ecritureParentheseSiNegatif(choix + a)}^2=${miseEnEvidence(this.reponse)}$.
      `
      }
    }
  }
}
