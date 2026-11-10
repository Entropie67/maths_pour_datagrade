import { choice } from '../../lib/outils/arrayOutils'
import { randint } from '../../modules/outils'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'b7b23'
export const refs = {
  'fr-fr': ['3AutoN09'],
  'fr-ch': ['9R1NO1C-12', '9R2NO1C-12', '9R3NO1C-12', 'PRQNO08A-13'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Connaître la divisibilité par $3$, $9$'
export const dateDePublication = '10/08/2026'

/**
 * DNB Asie juin 2026 - Question 4
 * Divisibilité par 3, 9
 * @author Jean-Claude Lhote
 */
export default class AutoQ4Asiebrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(N: number, P: number, diviseur: number): void {
    this.enonce = `On considère les nombres suivants et on s'intéresse à leur divisibilité par $${diviseur}$ :<br>
    $N=${texNombre(N)}$ et $P=${texNombre(P)}$.`
    const chiffresN = Array.from(String(N), Number)
    const chiffresP = Array.from(String(P), Number)
    const sommeChiffresN = chiffresN.reduce((acc, chiffre) => acc + chiffre, 0)
    const sommeChiffresP = chiffresP.reduce((acc, chiffre) => acc + chiffre, 0)

    this.correction = `Pour savoir si un nombre est divisible par $${diviseur}$, on peut calculer la somme de ses chiffres et vérifier si cette somme est divisible par $${diviseur}$.<br>
    Pour $N=${texNombre(N)}$, la somme de ses chiffres est $${sommeChiffresN}$ et pour $P=${texNombre(P)}$, la somme de ses chiffres est $${sommeChiffresP}$.<br>
    Comme $${sommeChiffresN}$ ${sommeChiffresN % diviseur === 0 ? 'est' : "n'est pas"} divisible par $${diviseur}$ et $${sommeChiffresP}$ ${sommeChiffresP % diviseur === 0 ? 'est' : "n'est pas"} divisible par $${diviseur}$, `
    if (N % diviseur === 0 && P % diviseur === 0) {
      this.reponses = [
        `$N$ et $P$ sont tous les deux divisibles par $${diviseur}$`,
        `Aucun des deux nombres n'est divisible par $${diviseur}$`,
        `$N$ est divisible par $${diviseur}$ mais $P$ ne l'est pas`,
        `$P$ est divisible par $${diviseur}$ mais $N$ ne l'est pas`,
      ]
    } else if (N % diviseur === 0) {
      this.reponses = [
        `$N$ est divisible par $${diviseur}$ mais $P$ ne l'est pas`,
        `$P$ est divisible par $${diviseur}$ mais $N$ ne l'est pas`,
        `$N$ et $P$ sont tous les deux divisibles par $${diviseur}$`,
        `Aucun des deux nombres n'est divisible par $${diviseur}$`,
      ]
    } else if (P % diviseur === 0) {
      this.reponses = [
        `$P$ est divisible par $${diviseur}$ mais $N$ ne l'est pas`,
        `$N$ est divisible par $${diviseur}$ mais $P$ ne l'est pas`,
        `$N$ et $P$ sont tous les deux divisibles par $${diviseur}$`,
        `Aucun des deux nombres n'est divisible par $${diviseur}$`,
      ]
    } else {
      this.reponses = [
        `Aucun des deux nombres n'est divisible par $${diviseur}$`,
        `$N$ et $P$ sont tous les deux divisibles par $${diviseur}$`,
        `$N$ est divisible par $${diviseur}$ mais $P$ ne l'est pas`,
        `$P$ est divisible par $${diviseur}$ mais $N$ ne l'est pas`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2025, 2026, 9)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const N = randint(1000, 9999)
    const P = randint(1000, 9999)
    const diviseur = choice([3, 9])
    this.appliquerLesValeurs(N, P, diviseur)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
