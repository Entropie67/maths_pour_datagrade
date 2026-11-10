import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier par les multiples de $101$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 * Olivier Mimeau : correction et alea actualisés
 */
export const uuid = '1a593'

export const refs = {
  'fr-fr': ['can5C2-01', '5N1H-flash2'],
  'fr-ch': ['NR'],
}
export default class MutliplierParN0N extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 4)
    const b = this.quotaChoice('b', [6, 7, 8, 9, 11, 15])
    this.reponse = 101 * a * b
    this.question = `Calculer $${b}\\times ${texNombre(a * 101)}$.`
    this.correction = ''
    this.correction += `$${b}\\times ${a * 101}= ${miseEnEvidence(texNombre(101 * a * b))}$<br><br>`
    this.correction +=
      `$\\begin{aligned}${b}\\times ${a * 101} &=${b}\\times ${a} \\times  101 \\\\ &= ${a * b} \\times (100+1) \\\\ &= ${a * b} \\times 100 + ${a * b} \\times 101 \\\\ &= ` +
      texNombre(a * b * 100) +
      `+ ${a * b} \\\\ &=` +
      texNombre(a * b * 101) +
      `\\end{aligned}$`
  }
}
