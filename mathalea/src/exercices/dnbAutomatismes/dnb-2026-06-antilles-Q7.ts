import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = '85acc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const titre = "Calculer la moyenne d'une série statistique"
export const dateDePublication = '06/06/2026'

/**
 * DNB Antilles juin 2026 - Question 7
 * La 4e valeur est ajustée pour que la somme soit un multiple de 4 (moyenne entière).
 * @author Rémi Angot
 */
export default class AutoQ7Antillesbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(serie?: number[]) {
    if (serie == null) {
      const a = randint(1, 25)
      const b = randint(1, 25)
      const c = randint(1, 25)
      let d = randint(1, 21)
      const reste = (a + b + c + d) % 4
      if (reste !== 0) d += 4 - reste
      serie = [a, b, c, d]
    }
    const n = serie.length
    const somme = serie.reduce((s, v) => s + v, 0)
    const moyenne = somme / n

    this.reponse = moyenne
    this.question = `Voici une série de nombres : $${serie.join(' \\,;\\, ')}$.<br>
Calculer la moyenne de cette série.`
    if (this.interactif) this.question += '<br>'

    this.correction = `La moyenne de cette série est $\\dfrac{${serie.join('+')}}{${n}}=\\dfrac{${somme}}{${n}}=${miseEnEvidence(`${texNombre(moyenne)}`)}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.enonce([10, 10, 12, 16])
    } else {
      this.enonce()
    }
  }
}
