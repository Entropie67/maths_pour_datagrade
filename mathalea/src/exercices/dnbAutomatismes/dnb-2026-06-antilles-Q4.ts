import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteItalique } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'b2b79'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une fréquence'
export const dateDePublication = '06/06/2026'

/**
 * DNB Antilles juin 2026 - Question 4
 * Le nombre de lancers est choisi parmi 6, 8, 10, 12, et le nombre de résultats
 * du côté demandé (pile ou face, en alternance) est premier avec ce nombre de
 * lancers afin que la fréquence proposée soit toujours une fraction irréductible.
 * @author Rémi Angot
 */
export default class AutoQ4Antillesbrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(
    sequence: ('pile' | 'face')[],
    cote: 'pile' | 'face' = 'pile',
  ): void {
    const n = sequence.length
    const autre = cote === 'pile' ? 'face' : 'pile'
    const nbCote = sequence.filter((r) => r === cote).length
    const nbAutre = n - nbCote

    this.enonce = `On lance $${n}$ fois une pièce de monnaie.<br>
Les résultats obtenus sont les suivants : ${texteItalique(sequence.join(', '))}.<br>
Quelle est la fréquence d'apparition de «\u00a0${texteItalique(cote)}\u00a0» ?`

    this.reponses = [
      `$\\dfrac{${nbCote}}{${n}}$`,
      `$\\dfrac{${nbAutre}}{${n}}$`,
      `$\\dfrac{1}{2}$`,
      `$\\dfrac{${nbCote}}{${nbAutre}}$`,
    ]

    this.correction = `Sur $${n}$ lancers, on a obtenu $${nbCote}$ fois «\u00a0${texteItalique(cote)}\u00a0».<br>
La fréquence d'apparition de «\u00a0${texteItalique(cote)}\u00a0» est : $\\dfrac{\\text{Nombre de «\u00a0${cote}\u00a0»}}{\\text{Nombre de lancers}}=${miseEnEvidence(`\\dfrac{${nbCote}}{${n}}`)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs([
      'pile',
      'pile',
      'face',
      'pile',
      'face',
      'face',
      'face',
      'face',
      'pile',
      'face',
    ])
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const n = choice([6, 8, 10, 12])
    const candidats: number[] = []
    for (let k = 1; k < n; k++) {
      if (pgcd(k, n) === 1) candidats.push(k)
    }
    const nbCote = choice(candidats)
    const cote = choice(['pile', 'face'] as const)
    const autre = cote === 'pile' ? 'face' : 'pile'
    const sequence = shuffle([
      ...Array(nbCote).fill(cote),
      ...Array(n - nbCote).fill(autre),
    ]) as ('pile' | 'face')[]
    this.appliquerLesValeurs(sequence, cote)
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options = { vertical: true, radio: true }
  }
}
