import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'acf05'
export const refs = {
  'fr-fr': ['3AutoN02'],
  'fr-ch': ['9R2NO3C-10', '9R3NO3C-10', '10CTNO2A-10', 'PRQNO06B-15'],
}
export const interactifReady = true
export const titre =
  'Calculer la somme de deux nombres décimaux de signes contraires'
export const dateDePublication = '12/08/2026'

/**
 * DNB Métropole juin 2026 - Question 2
 * @author Jean-Claude Lhote
 */
export default class AutoQ2MetropoleBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      const partieDecimaleB = randint(2, 5)
      const partieEntiereB = randint(2, 5)
      const partieDecimaleA = randint(partieDecimaleB, 9)
      const partieEntiereA = randint(partieEntiereB, 9)
      a = parseFloat(`${partieEntiereA}.${partieDecimaleA}`) * -1
      b = parseFloat(`${partieEntiereB}.${partieDecimaleB}`)
    }

    this.question = `Calculer la somme : $${texNombre(a, 1)} + ${texNombre(b, 1)}$.`
    this.reponse = texNombre(a + b, 1)
    this.correction = `La somme de deux nombres décimaux de signes contraires est égale à la différence de leurs valeurs absolues, avec le signe du nombre ayant la plus grande valeur absolue.<br>
    Ici, la valeur absolue de $${texNombre(a, 1)}$ est plus grande que celle de $${texNombre(b, 1)}$, donc le résultat sera négatif et égal à la différence de leurs valeurs absolues :<br>
   $${texNombre(a, 1)} + ${texNombre(b, 1)} = -(${texNombre(-a, 1)} - ${texNombre(b, 1)}) = ${miseEnEvidence(texNombre(a + b, 1))}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(-4.7, 3.5)
    } else {
      this.enonce()
    }
  }
}
