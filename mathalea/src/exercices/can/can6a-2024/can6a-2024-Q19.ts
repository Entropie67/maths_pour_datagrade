import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Soustraire un décimal à un entier'
export const interactifReady = true

export const uuid = 'dcd81'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author  Gilles Mora

*/
export default class SoustractionPasFacile extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.canOfficielle = false
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    let a: Decimal
    let b: Decimal
    let partieEntiere: number
    let partieDec: Decimal
    if (this.canOfficielle) {
      a = new Decimal('10')
      partieEntiere = 7
      partieDec = new Decimal('0.6')
      b = new Decimal(partieEntiere).add(partieDec)
    } else {
      a = new Decimal(randint(1, 5) * 10)
      partieEntiere = randint(11, 89, [20, 30, 40, 50, 60, 70, 80])
      partieDec = new Decimal(randint(1, 9)).div(10)
      b = new Decimal(randint(11, 89, [20, 30, 40, 50, 60, 70, 80])).div(10)
    }
    this.reponse = a.sub(b).toFixed(1)
    this.question = `$${texNombre(a, 0)}- ${texNombre(b, 1)}$`

    this.correction = `On décompose pour calculer plus simplement : <br>
    $\\begin{aligned}
     ${texNombre(a, 0)}- ${texNombre(b, 1)}&= ${texNombre(a, 0)}- ${b.floor()}-${texNombre(b.sub(b.floor()), 1)}\\\\
     &=${texNombre(a.sub(b.floor()), 0)}-${texNombre(b.sub(b.floor()), 1)}\\\\
     &=${miseEnEvidence(texNombre(a.sub(b), 1))}
     \\end{aligned}$`
  }
}
