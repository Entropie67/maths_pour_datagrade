import { miseEnEvidence } from '../../../lib/outils/embellissements'
import Decimal from 'decimal.js'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer le chiffre des ...'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Gilles Mora & Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '22f41'

export const refs = {
  'fr-fr': ['can6N1-04', '6N1A-flash4'],
  'fr-ch': ['NR'],
}
export default class ChiffreDes extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 3)
    const b = randint(1, 9, a)
    const c = randint(1, 9, [a, b])
    const d = randint(1, 9, [a, b, c])
    const e = randint(1, 9, [a, b, c, d])
    const f = randint(1, 9, [a, b, c, d, e])
    const chiffres = new Decimal(
      a * 100000 + b * 10000 + c * 1000 + d * 100 + e * 10 + f,
    )
    const n = chiffres.div(1000)
    const m = this.quotaChoice('m', [
      'centaines',
      'dizaines',
      'dixièmes',
      'centièmes',
      'millièmes',
      'unités',
    ])
    this.question = `Quel est le chiffre des ${m} dans $${texNombre(n)}$ ? `
    switch (m) {
      case 'unités':
        this.reponse = c
        break
      case 'centaines':
        this.reponse = a
        break
      case 'dizaines':
        this.reponse = b
        break
      case 'dixièmes':
        this.reponse = d
        break
      case 'centièmes':
        this.reponse = e
        break
      case 'millièmes':
        this.reponse = f
        break
    }
    this.correction = `Le chiffre des ${m} est $${miseEnEvidence(String(this.reponse))}$.<br><br>$\\begin{array}{|c|c|c|c|c|c|c|}\n`
    this.correction += '\\hline\n'
    this.correction +=
      '\\text{Centaine} & \\text{Dizaine} & \\text{Unité} & \\Large{\\textbf,}& \\text{Dixième} & \\text{Centième} & \\text{Millième} \\\\ \n'
    this.correction += '\\hline\n'
    this.correction += `${a}&${b}&${c} & \\Large{\\textbf,}& ${d}&${e}& ${f}\\\\ \n`
    this.correction += '\\hline\n'
    this.correction += '\\end{array}\n$'
  }
}
