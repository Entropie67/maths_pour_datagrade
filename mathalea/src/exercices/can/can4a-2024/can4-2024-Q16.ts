import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une probabilité'
export const interactifReady = true

export const uuid = '9c540'
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
    const a = this.canOfficielle ? -1 : randint(-10, -1)
    const b = this.canOfficielle ? 2 : randint(2, 4)
    const c = this.canOfficielle ? 3 : randint(2, 5)
    this.reponse = a * b - c
    if (context.isHtml) {
      this.question = 'Nombre de départ <br>'
      this.question += '$\\downarrow$<br>'
      this.question += '$\\begin{array}{|l|}\n'
      this.question += '\\hline\n'
      this.question += `\\\n \\text{Multiplier par } ${b} \\\n`
      this.question += `\\\\\n \\text{Soustraire } ${c}\\\\\n `
      this.question += '\\hline\n'
      this.question += '\\end{array}\n$<br>'
      this.question += `$\\downarrow$<br>
     `
      this.question += 'Résultat'
      this.question += `<br>Quel est le résultat de ce programme de calcul lorsque le nombre de départ est $${a}$ ?`
    } else {
      this.question = '\\texttt{Nombre de départ}'
      this.question += `<br>${sp(10)}$\\downarrow$<br>`
      this.question += `${sp(10)} \\fbox{ \\texttt{Multiplier par } ${b}}`
      this.question += `<br>${sp(10)}$\\downarrow$<br>`
      this.question += `${sp(10)} \\fbox{ \\texttt{Soustraire } ${c}}`
      this.question += `<br>${sp(10)}$\\downarrow$<br>`
      this.question += '\\texttt{Résultat}'
      this.question += '<br>'
      this.question += `Quel est le résultat si le nombre de départ est $${a}$ ?`
    }
    this.correction = `Le résultat est donné par : $(${a}\\times ${b})- ${c}=${miseEnEvidence(this.reponse)}$.`
  }
}
