import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier astucieusement'
export const interactifReady = true

export const uuid = 'd149d'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/
export default class SoustractionDecimaux extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let a: Decimal
    let b: Decimal
    let c: Decimal
    if (this.canOfficielle) {
      a = new Decimal('50')
      b = new Decimal('3.5')
      c = new Decimal('2')
    } else {
      const [aa, cc] = this.quotaChoice('aaCc', [
        [25, 4],
        [50, 2],
        [250, 4],
        [500, 2],
      ])
      a = new Decimal(aa)
      c = new Decimal(cc)
      b = new Decimal(this.quotaRandint('b', 2, 9) * 2 + 1).div(2)
    }
    this.reponse = a.mul(b).mul(c).toFixed(0)
    this.question = `$${texNombre(a, 0)}\\times ${texNombre(b, 1)}\\times ${texNombre(c, 0)}$`

    this.correction = `On  commence par calculer $${texNombre(a, 0)}\\times ${texNombre(c, 0)}=${texNombre(a.mul(c), 0)}$, puis `
    this.correction += `on effectue $${texNombre(a.mul(c), 0)}\\times ${texNombre(b, 1)}= ${miseEnEvidence(texNombre(Number(this.reponse)))}$.`
  }
}
