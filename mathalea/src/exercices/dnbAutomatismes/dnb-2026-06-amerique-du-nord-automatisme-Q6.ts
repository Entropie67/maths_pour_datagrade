import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'a6e9f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const titre = "Déterminer la médiane d'une série statistique"
export const dateDePublication = '06/06/2026'

/**
 * DNB Amérique du Nord juin 2026 - Question 6
 * @author Rémi Angot
 */
export default class AutoQ6ANbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(serie?: number[]) {
    const length = choice([7, 9, 11])
    if (serie == null) {
      serie = shuffle(Array.from({ length }, () => randint(1, 25)))
    }
    const n = serie.length
    const trie = [...serie].sort((a, b) => a - b)
    const indexMediane = (n - 1) / 2 // n impair
    const mediane = trie[indexMediane]

    this.reponse = mediane
    this.question = `Voici une série de nombres : $${serie.join(' \\,;\\, ')}$.<br>
Déterminer la médiane de cette série.`
    if (this.interactif) this.question += '<br>'

    this.correction = `La série comporte $${n}$ valeurs ($${n}$ est impair). On range les valeurs dans l'ordre croissant :<br>
$${trie.join(' \\,;\\, ')}$.<br>
La médiane est la valeur centrale, c'est-à-dire la $${indexMediane + 1}^{\\text{e}}$ valeur : $${miseEnEvidence(`${mediane}`)}$.`
  }

  nouvelleVersion() {
    // 8 ; 19 ; 12 ; 3 ; 12 ; 25 ; 3 ; 11 ; 1 → médiane 11
    if (this.canOfficielle) {
      this.enonce([8, 19, 12, 3, 12, 25, 3, 11, 1])
    } else {
      this.enonce()
    }
  }
}
