import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '15/10/2025'
export const uuid = '5c321'
// @Author Gilles Mora
export const refs = {
  'fr-fr': ['1A-C05-3', '2A-N5-3'],
  'fr-ch': ['10CTQCMNO-6', '10LCQCMNO-7', '10LSQCMNO-8'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer un ordre de grandeur'
export default class auto1AC5b extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    b: number,
    arrondiA: number,
    arrondiB: number,
    resultat: number,
  ): void {
    this.enonce = `Un ordre de grandeur de $${texNombre(a)} \\times ${texNombre(b)}$ est :`
    this.correction = `On arrondit $${texNombre(a)}$ à $${texNombre(arrondiA)}$ et $${texNombre(b)}$ à $${texNombre(arrondiB)}$.<br>
     On obtient : $${texNombre(arrondiA)} \\times ${texNombre(arrondiB)} = ${texNombre(arrondiA * arrondiB)}$.<br>
     Un ordre de grandeur de $${texNombre(a)} \\times ${texNombre(b)}$ est donc $${miseEnEvidence(texNombre(resultat))}$.`
    this.reponses = [
      `$${texNombre(resultat)}$`,
      `$${texNombre(resultat * 10)}$`,
      `$${texNombre(resultat / 10)}$`,
      `$${texNombre(resultat / 100)}$`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(101, 99, 100, 100, 10000)
  }

  versionAleatoire: () => void = () => {
    const casChoisi = randint(1, 4)

    if (casChoisi === 1) {
      // Cas 1 : 2 chiffres × 3 chiffres (10-99 × 100-999)
      const dizaine = randint(2, 9)
      const centaine = randint(2, 9)
      const ecart1 = randint(-4, 4, 0)
      const ecart2 = randint(-29, 29, 0)
      const a = dizaine * 10 + ecart1
      const b = centaine * 100 + ecart2
      const arrondiA = dizaine * 10
      const arrondiB = centaine * 100
      const resultat = arrondiA * arrondiB
      this.appliquerLesValeurs(a, b, arrondiA, arrondiB, resultat)
    } else if (casChoisi === 2) {
      // Cas 2 : 3 chiffres × 3 chiffres (100-999 × 100-999)
      const centaine1 = randint(2, 9)
      const centaine2 = randint(2, 9)
      const ecart1 = randint(-29, 29, 0)
      const ecart2 = randint(-29, 29, 0)
      const a = centaine1 * 100 + ecart1
      const b = centaine2 * 100 + ecart2
      const arrondiA = centaine1 * 100
      const arrondiB = centaine2 * 100
      const resultat = arrondiA * arrondiB
      this.appliquerLesValeurs(a, b, arrondiA, arrondiB, resultat)
    } else if (casChoisi === 3) {
      // Cas 3 : 2 chiffres × 4 chiffres (10-99 × 1000-9999)
      const dizaine = randint(2, 9)
      const millier = randint(2, 9)
      const ecart1 = randint(-4, 4, 0)
      const ecart2 = randint(-199, 199, 0)
      const a = dizaine * 10 + ecart1
      const b = millier * 1000 + ecart2
      const arrondiA = dizaine * 10
      const arrondiB = millier * 1000
      const resultat = arrondiA * arrondiB
      this.appliquerLesValeurs(a, b, arrondiA, arrondiB, resultat)
    } else {
      // Cas 4 : 3 chiffres × 4 chiffres (100-999 × 1000-9999)
      const centaine = randint(2, 9)
      const millier = randint(2, 9)
      const ecart1 = randint(-29, 29, 0)
      const ecart2 = randint(-199, 199, 0)
      const a = centaine * 100 + ecart1
      const b = millier * 1000 + ecart2
      const arrondiA = centaine * 100
      const arrondiB = millier * 1000
      const resultat = arrondiA * arrondiB
      this.appliquerLesValeurs(a, b, arrondiA, arrondiB, resultat)
    }
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
