import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver $a+1$ ou $a-1$ connaissant $2a$'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = 'cc70a'

export const refs = {
  'fr-fr': ['can5L-01', '5N5B-flash1'],
  'fr-ch': [],
}
export default class MoitiePlusOuMoinsUn extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = new Decimal(this.quotaRandint('a', 21, 35, [30])).div(10)
    const moitie = a.div(2)
    if (this.quotaChoice('plusOuMoinsUn', [true, false])) {
      this.reponse = moitie.plus(1)
      this.question = `On a  $2\\times a=${texNombre(a)}$, combien vaut $a+1$ ?`
      this.correction = `$2\\times a=${texNombre(a)}$, donc le nombre $a$ est égal à $\\dfrac{${texNombre(a)}}{2}=${texNombre(moitie)}$.<br>Donc $a+1=${texNombre(moitie)}+1=${miseEnEvidence(texNombre(this.reponse))}$.`
    } else {
      this.reponse = moitie.minus(1)
      this.question = `On a  $2\\times a=${texNombre(a)}$, combien vaut $a-1$ ?`
      this.correction = `$2\\times a=${texNombre(a)}$, donc le nombre $a$ est égal à $\\dfrac{${texNombre(a)}}{2}=${texNombre(moitie)}$.<br>Donc $a-1=${texNombre(moitie)}-1=${miseEnEvidence(texNombre(this.reponse))}$.`
    }
  }
}
