import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cea01'
export const refs = {
  'fr-fr': ['3AutoS02-5'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = "Déterminer la médiane d'une série courte"
export const dateDePublication = '11/08/2026'

/**
 * DNB Centres étrangers juin 2026 - Question 1
 * @author Jean-Claude Lhote
 */
export default class AutoQ1CentresEtrangersBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: ' °C' }
  }

  enonce(serie?: number[]) {
    if (serie == null) {
      serie = []
      for (let i = 0; i < 5; i++) {
        serie.push(randint(-3, 8, serie))
      }
    }
    const serieOrdonnee = [...serie].sort((a, b) => a - b)
    const mediane = serieOrdonnee[2]
    this.question = `Voici la série des températures minimales relevées à Strasbourg lors des cinq premiers jours de février : ${serie.map((n) => `$${n}$ °C`).join(' ; ')}.<br>
Déterminer la médiane de cette série.`
    this.reponse = texNombre(mediane, 0)
    this.correction = `On range les températures dans l'ordre croissant : ${serieOrdonnee.map((n) => `$${n}$ °C`).join(' ; ')}.<br>
La série comporte $5$ valeurs, la médiane est donc la troisième valeur : $${miseEnEvidence(`${mediane}`)}\\text{ °C}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce([0, -1, 3, 7, 1])
    } else {
      this.enonce()
    }
  }
}
