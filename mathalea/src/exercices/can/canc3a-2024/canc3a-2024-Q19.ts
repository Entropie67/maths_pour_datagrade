import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Soustraire un décimal à un entier'
export const interactifReady = true

export const uuid = 'c69f0'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author  Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/
export default class SoustractionPasFacileCM2 extends ExerciceSimple {
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
      partieEntiere = 8
      partieDec = new Decimal('0.5')
      b = new Decimal(partieEntiere).add(partieDec)
    } else {
      a = new Decimal(randint(1, 5) * 10)
      partieDec = new Decimal('0.5')
      b = new Decimal(randint(1, 8)).add(partieDec)
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
