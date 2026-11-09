import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer la somme de nombres décimaux'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = 'f8f99'

export const refs = {
  'fr-fr': ['can5C3-06', '5N2autoA-12'],
  'fr-ch': ['NR'],
}
export default class SommeDecimale5e extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 9)
    const b = randint(1, 9, a)
    const c = randint(1, 9, [a, b])
    const d = randint(1, 9, [a, b, c])
    this.reponse = arrondi(10 + (b + d) * 0.1 + c * 0.01)
    this.question = `Calculer $${texNombre(a + b * 0.1 + c * 0.01)}+${texNombre(10 - a + d * 0.1)}$.`
    this.correction = `$${texNombre(a + b * 0.1 + c * 0.01)}+${texNombre(10 - a + d * 0.1)}=${miseEnEvidence(texNombre(10 + (b + d) * 0.1 + c * 0.01))}$<br>`
    this.correction += texteEnCouleur(` Mentalement : <br>
    On fait la somme des parties entières des deux nombres : $${a}+${10 - a}=${10}$, puis on ajoute les parties décimales. <br>
    On obtient :<br>
$${texNombre(b * 0.1 + c * 0.01)}+${texNombre(d * 0.1)}=${texNombre(b * 0.1 + c * 0.01 + d * 0.1)}$.<br>
Ainsi, $${texNombre(a + b * 0.1 + c * 0.01)}+${texNombre(10 - a + d * 0.1)}=${texNombre(10 + (b + d) * 0.1 + c * 0.01)}$.`)
  }
}
