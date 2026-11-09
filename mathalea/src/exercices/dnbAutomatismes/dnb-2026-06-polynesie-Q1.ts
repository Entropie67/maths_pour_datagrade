import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'dea01'
export const refs = {
  'fr-fr': ['3AutoS02'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = "Déterminer la médiane d'une série courte"
export const dateDePublication = '11/08/2026'

/**
 * DNB Polynésies juin 2026 - Question 1
 * @author Jean-Claude Lhote
 */
export default class AutoQ1CPolynesieBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(serie?: number[]) {
    if (serie == null) {
      serie = []
      for (let i = 0; i < 7; i++) {
        serie.push(randint(5, 25, serie))
      }
      serie = serie.sort((a, b) => a - b)
      serie[1] = serie[0]
      serie[3] = serie[2]
      serie = shuffle(serie)
    }
    const serieOrdonnee = [...serie].sort((a, b) => a - b)
    const mediane = serieOrdonnee[3]
    this.question = `Déterminer la médiane de cette série : ${serie.map((n) => `$${n}$`).join(' ; ')}.`
    this.reponse = texNombre(mediane, 0)
    this.correction = `On range les nombres dans l'ordre croissant : ${serieOrdonnee.map((n) => `$${n}$`).join(' ; ')}.<br>
La série comporte $7$ valeurs, la médiane est donc la quatrième valeur : $${miseEnEvidence(`${mediane}`)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce([12, 9, 7, 23, 9, 25, 7])
    } else {
      this.enonce()
    }
  }
}
