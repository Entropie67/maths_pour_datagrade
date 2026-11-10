import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cf999'
export const refs = {
  'fr-fr': ['3AutoP01-3'],
  'fr-ch': ['11CTFA1A-9', '11LCFA1A-9', '11LSFA1A-9', 'PRQPF03C-8'],
}
export const interactifReady = true
export const titre =
  'Calculer une vitesse moyenne (conversion grandeur quotient)'
export const dateDePublication = '11/08/2026'

/**
 * DNB Asie juin 2026 - Question 5
 * @author Jean-Claude Lhote
 */
export default class AutoQ5Asiebrevet2026 extends ExerciceCan {
  constructor() {
    super()
  }

  enonce(distanceKm?: number, dureeMin?: number) {
    let den: number, num: number
    if (distanceKm == null || dureeMin == null) {
      do {
        dureeMin = choice([12, 24, 36, 10, 50, 20, 40, 15, 45, 30])
        den = [12, 24, 36].includes(dureeMin)
          ? 5
          : [10, 50].includes(dureeMin)
            ? 6
            : [20, 40].includes(dureeMin)
              ? 3
              : [15, 45].includes(dureeMin)
                ? 4
                : 2

        num = (dureeMin * den) / 60
        distanceKm = (randint(8, 20) * num) / den
      } while (!Number.isInteger(distanceKm))
    } else {
      den = 4
      num = 3
    }
    this.question = `Une personne a couru $${distanceKm}$ km en $${dureeMin}$ min.<br>
    Quelle est sa vitesse moyenne en km/h ?`
    this.optionsChampTexte = { texteApres: ' km/h', texteAvant: ' ' }
    this.reponse = texNombre((distanceKm / dureeMin) * 60, 0)
    this.correction = `On remarque que $${dureeMin}$ min = $\\dfrac{${num}}{${den}}$ h.<br>
Donc, pour calculer la vitesse moyenne, le calcul est le suivant :<br> 
$\\text{Vitesse moyenne} = \\dfrac{${distanceKm}}{\\dfrac{${num}}{${den}}} = ${distanceKm} \\times \\dfrac{${den}}{${num}} =\\dfrac{${distanceKm * den}}{${num}} =${miseEnEvidence(texNombre((distanceKm / dureeMin) * 60, 0))}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(9, 45)
    } else {
      this.enonce()
    }
  }
}
