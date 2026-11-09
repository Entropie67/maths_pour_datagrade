import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texFractionReduite } from '../../../lib/outils/deprecatedFractions'
import { sp } from '../../../lib/outils/outilString'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer le rang d’une médiane'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = '87ceb'

export const refs = {
  'fr-fr': ['can3S1-03', '2S20-flash3'],
  'fr-ch': [],
}
export default class Mediane extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 10, 15)
    const n = this.quotaRandint('n', 1, 4)
    const c = a * 2 * n + 1
    this.question = `Une série statistique de $${c}$ données est rangée dans l’ordre croissant.<br>
   
    Quel est le rang de la médiane ? `
    this.correction = `En notant $x_1$ la plus petite valeur de la série, puis $x_2$ la suivante, $\\ldots$ et $x_{${c}}$ la plus grande valeur, on obtient :<br>
$\\underbrace{x_1 ${sp(2)} ; ${sp(2)} x_2 ${sp(2)} ; ${sp(2)} \\ldots\\ldots ; ${sp(2)}
 x_{${a * n}}}_{${a * n} \\text{ valeurs}} ${sp(2)} ; ${sp(2)} \\underbrace{x_{${a * n + 1}}}_{\\text{Médiane}}
 ${sp(2)} ; ${sp(2)} \\underbrace{x_{${a * n + 2}} ; ${sp(2)} \\ldots\\ldots ; ${sp(2)}  x_{${c}}}_{${a * n} \\text{ valeurs}}$<br>

    
    
    Puisque la série comporte un nombre impair de valeurs, la médiane se situe au rang $\\dfrac{${c}+1}{2}=${miseEnEvidence(texFractionReduite(c + 1, 2))}$.`
    this.reponse = (c + 1) / 2
  }
}
