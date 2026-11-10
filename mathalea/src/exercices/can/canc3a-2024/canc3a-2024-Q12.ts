import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier astucieusement'
export const interactifReady = true

export const uuid = '6d9c8'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/
export default class SoustractionDecimauxCM2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let a: number
    let b: number
    let c: number
    if (this.canOfficielle) {
      a = 20
      b = 4
      c = 5
    } else {
      const [aa, cc] = choice([
        [25, 4],
        [50, 2],
        [250, 4],
        [500, 2],
        [200, 5],
        [2, 5],
      ])
      a = aa
      c = cc
      b = randint(6, 9) * 2 + 1
    }
    this.reponse = (a * b * c).toFixed(0)
    this.question = `$${texNombre(a, 0)}\\times ${texNombre(b, 1)}\\times ${texNombre(c, 0)}$`

    this.correction = `On  commence par calculer $${texNombre(a, 0)}\\times ${texNombre(c, 0)}=${texNombre(a * c, 0)}$, puis `
    this.correction += `on effectue $${texNombre(a * c, 0)}\\times ${texNombre(b, 1)}= ${miseEnEvidence(texNombre(Number(this.reponse)))}$.`
  }
}
