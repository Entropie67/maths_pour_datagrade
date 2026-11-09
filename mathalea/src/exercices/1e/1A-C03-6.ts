import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '10/08/2025'
export const uuid = '3f994'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C03-6'],
  'fr-ch': ['10LCNO4B-5', '10LSNO4B-5', '11LCNO3B-5', '11LSNO3B-5'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Combiner produit et puissance de puissance'
export default class Auto1AC3f extends ExerciceQcmA {
  private appliquerLesValeurs(k: number, p: number): void {
    this.enonce = `Soit $a$ un nombre réel non nul et $n$ un entier non nul. <br>À quelle expression est égale $a^{${k}n}(a^n)^${p}$ ?`

    this.correction = `On applique la propriété du produit des puissances d'un réel.<br>
   Soient $n$ et $p$ deux entiers et $a$ un réel :  $a^n\\times a^p=a^{n+p}$<br>
    et la propriété des puissances de puissances : <br>
     Pour tous entiers $n$ et $p$ et $a$ réel, on a :  $\\left(a^{n}\\right)^p=a^{np}$<br>
    $\\begin{aligned} a^{${k}n}(a^n)^${p}&=a^{${k}n}\\times a^{${p}n}\\\\
   &=${miseEnEvidence(`a^{${k + p}n}`)}
    \\end{aligned}$<br>`

    this.reponses = [
      `$a^{${k + p}n}$`,
      `$a^{${k * p}n}$`,
      `$a^{${k + p}n^2}$`,
      `$a^{${k * p}n^2}$`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 2)
  }

  versionAleatoire = () => {
    const k = randint(2, 5)
    const p = randint(2, 5, k)
    this.appliquerLesValeurs(k, p)
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    L'expression mélange deux règles sur les puissances : le produit et la puissance de puissance. <br>
    Il est donc essentiel d'identifier les priorités opératoires.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Commencer par traiter la puissance placée entre parenthèses.</li>
    <li>Observer ensuite que les deux facteurs ont la même base (le nombre élevé à une puissance).</li>
    <li>Utiliser la propriété du produit de puissances de même base.</li>
    <li>Faire le même calcul avec des nombres à la place de $n$ si la variable gêne.</li>
  </ul>
`
    this.versionAleatoire()
  }
}
