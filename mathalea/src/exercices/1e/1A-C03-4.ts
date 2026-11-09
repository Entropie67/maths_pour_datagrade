import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '10/08/2025'
export const uuid = 'b37ab'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C03-4', '2A-N3-4'],
  'fr-ch': ['10LCNO4B-3', '10LSNO4B-3', '11LCNO3B-3', '11LSNO3B-3'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Appliquer la propriété des produits avec des puissances'
export default class Auto1AC3d extends ExerciceQcmA {
  private appliquerLesValeurs(n: number, k: number): void {
    this.enonce = `Soient $a$ et $b$ deux nombres réels non nuls. <br>À quelle expression est égale $a^${n}\\times b^${k}$ ?`

    if (n === k) {
      const difference = k - n
      // Cas où les exposants sont égaux
      this.correction = `Les deux exposants sont égaux, ainsi : <br>$\\begin{aligned}
        a^${n}\\times b^${k}&=${miseEnEvidence(`\\left(ab\\right)^${n}`)}\\end{aligned}$<br>`

      this.reponses = [
        `$\\left(ab\\right)^${n}$`,
        `$\\left(ab\\right)^{${n + k}}$`,
        `$\\left(ab\\right)^${n - 1}\\times b^{${rienSi1(difference + 1)}}$`,
        'Aucune de ces propositions.',
      ]
    } else {
      // Cas où k > n
      const difference = k - n

      this.correction = `$\\begin{aligned}
        a^${n}\\times b^${k}&= a^${n}\\times b^${n}\\times b^{${difference}}\\\\
      &=${difference === 1 ? miseEnEvidence(`\\left(ab\\right)^${n}\\times b`) : miseEnEvidence(`\\left(ab\\right)^${n}\\times b^{${difference}}`)}
        \\end{aligned}$<br>`

      this.reponses = [
        difference === 1
          ? `$\\left(ab\\right)^${n}\\times b$`
          : `$\\left(ab\\right)^${n}\\times b^{${difference}}$`,
        `$\\left(ab\\right)^{${n + k}}$`,
        `$\\left(ab\\right)^{${n * k}} $`,
        'Aucune de ces propositions.',
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 3)
  }

  versionAleatoire = () => {
    const n = randint(3, 8)
    const casChoisi = randint(1, 2)

    if (casChoisi === 1) {
      // Cas 1 : exposants égaux (a^n × b^n)
      this.appliquerLesValeurs(n, n)
    } else {
      // Cas 2 : exposants différents (a^n × b^k avec k > n)
      const k = randint(n + 1, 6)
      this.appliquerLesValeurs(n, k)
    }
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut transformer un produit de puissances.<br>
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Regarder d'abord si les deux exposants sont égaux.</li>
    <li>Regrouper les bases si les deux puissances ont le même exposant.</li>
    <li>Décomposer le calcul si les exposants sont différents, pour faire apparaître un produit de deux puissances de même exposant.</li>
  </ul>
`
    this.versionAleatoire()
  }
}
