import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import type { CompareFunction } from '../../lib/types'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'c8a2b'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1NO1C-11', '9R2NO1C-11', '9R3NO1C-11', 'PRQNO08A-12'],
}
export const interactifReady = true

export const titre =
  "Déterminer un diviseur à l'aide des critères de divisibilité"
export const dateDePublication = '06/06/2026'

/**
 * DNB Amérique du Nord juin 2026 - Question 8
 * Trois types :
 *   - divisible par 3 (pas 2, 5, 9 ou 10)
 *   - divisible par 2 (pas 3, 4, 5 ou 9)
 *   - divisible par 5 (pas 2, 3 ou 10)
 * Toute réponse qui est un diviseur propre du nombre est acceptée.
 * @author Rémi Angot
 */
export default class AutoQ8ANbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  enonce(n?: number, type?: 3 | 5) {
    if (n == null || type == null) {
      type = choice([3, 5] as (3 | 5)[])
      if (type === 3) {
        // Divisibles par 3, pas par 2, 5, 9 ou 10
        n = choice([123, 159, 213, 219, 291, 339, 411])
      } else {
        // Divisibles par 5, pas par 2, 3 ou 10
        n = choice([125, 145, 155, 175, 185, 215, 245, 265])
      }
    }
    const nombre = n
    const diviseur = type

    this.reponse = diviseur
    this.compare = ((input: string): { isOk: boolean; feedback?: string } => {
      const valeur = Number.parseInt(input.replace(/[^0-9-]/g, ''), 10)
      if (Number.isNaN(valeur)) {
        return { isOk: false, feedback: 'Saisir un nombre entier.' }
      }
      const absValeur = Math.abs(valeur)
      if (absValeur === 1 || absValeur === nombre) {
        return {
          isOk: false,
          feedback: 'Il faut un diviseur autre que $1$ et le nombre lui-même.',
        }
      }
      if (absValeur !== 0 && nombre % absValeur === 0) {
        return { isOk: true }
      }
      return { isOk: false, feedback: `Ce nombre ne divise pas $${nombre}$.` }
    }) as CompareFunction

    this.question = `Donner un diviseur de $${nombre}$ autre que $1$ et lui-même.`
    if (this.interactif) this.question += '<br>'

    if (diviseur === 3) {
      const chiffres = String(nombre).split('').map(Number)
      const somme = chiffres.reduce((s, c) => s + c, 0)
      this.correction = `On calcule la somme des chiffres de $${nombre}$ : $${chiffres.join('+')}=${somme}$.<br>
Comme $${somme}$ est divisible par $3$, le nombre $${nombre}$ est aussi divisible par $3$.<br>
Un diviseur de $${nombre}$ autre que $1$ et lui-même est, par exemple, $${miseEnEvidence('3')}$.`
    }
    // Il n'y a pas de 2 dans les diviseurs possibles, donc on ne fait pas de correction pour 2.
    /* else if (diviseur === 2) { 
      const dernierChiffre = nombre % 10
      this.correction = `Le dernier chiffre de $${nombre}$ est $${dernierChiffre}$, qui est pair.<br>
Donc $${nombre}$ est divisible par $2$.<br>
Un diviseur de $${nombre}$ autre que $1$ et lui-même est, par exemple, $${miseEnEvidence('2')}$.`
    } */
    else {
      this.correction = `Le dernier chiffre de $${nombre}$ est $5$.<br>
Donc $${nombre}$ est divisible par $5$.<br>
Un diviseur de $${nombre}$ autre que $1$ et lui-même est, par exemple, $${miseEnEvidence('5')}$.`
    }
  }

  nouvelleVersion() {
    // 387 : 3 + 8 + 7 = 18, divisible par 3
    if (this.canOfficielle) {
      this.enonce(387, 3)
    } else {
      this.enonce()
    }
  }
}
