import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
import { texNombre } from '../../lib/outils/texNombre'
export const dateDePublication = '10/08/2025'
export const uuid = 'c0964'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C03-7'],
  'fr-ch': ['10LCNO4B-6', '10LSNO4B-6', '11LCNO3B-6', '11LSNO3B-6'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Additionner deux puissances identiques'
export default class Auto1AC3g extends ExerciceQcmA {
  private appliquerLesValeurs(k: number): void {
    this.enonce = `Soit $n$ un entier. <br>À quelle expression est égale $${k}^{n}+${k}^n$ ?`

    if (k === 2) {
      this.correction = `Les deux termes $2^n$ sont identiques. Or, pour tout réel $A$, on a $A+A=2\\times A$. Ainsi :<br>
$\\begin{aligned}
2^n+2^n
&=2\\times 2^n\\\\
&=2^1\\times 2^n\\\\
&=${miseEnEvidence('2^{n+1}')}
\\end{aligned}$<br>
En effet, lorsqu'on multiplie deux puissances de même base, on additionne leurs exposants : $2^1\\times 2^n=2^{1+n}=2^{n+1}$.<br><br>
Pour se convaincre que les autres propositions sont fausses, on peut prendre $n=2$.<br>
On obtient :<br>
$2^2+2^2=4+4=8$, tandis que $4^2=16$, $2^{2\\times2}=16$ et $(2^2)^2=16$.<br>
Ces trois égalités constituent des contre-exemples aux propositions incorrectes.`
      this.reponses = [`$2^{n+1}$`, `$4^n$`, `$2^{2n}$`, `$(2^n)^2$`]
    } else {
      this.correction = `Les deux termes $${k}^n$ sont identiques. Or, pour tout réel $A$, on a $A+A=2\\times A$.<br>
       Donc :
$\\begin{aligned}
${k}^n+${k}^n
&=${miseEnEvidence(`2\\times ${k}^n`)}.
\\end{aligned}$<br>
Pour se convaincre que les autres propositions sont fausses, on peut prendre $n=2$.<br>
On obtient :<br>
$${k}^2+${k}^2=${k * k}+${k * k}=${2 * k * k}$, tandis que $${2 * k}^2=${4 * k * k}$, $${k}^{2+1}=${k ** 3}$ et $${k}^{2\\times2}=${texNombre(k ** 4)}$.<br>
Ces trois égalités constituent des contre-exemples aux propositions incorrectes.`
      this.reponses = [
        `$2\\times ${k}^n$`,
        `$${2 * k}^n$`,
        `$${k}^{n+1}$`,
        `$${k}^{2n}$`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2)
  }

  versionAleatoire = () => {
    const k = randint(3, 6)
    this.appliquerLesValeurs(k)
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut donner du sens à l'opération demandée avant d'appliquer une formule.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Observer que les deux termes additionnés sont identiques.</li>
    <li>Remplacer ce terme par une lettre au brouillon pour réfléchir à une addition du type $A+A$.</li>
    <li>Faire le même calcul avec des nombres à la place de $n$ si la variable gêne.</li>
    <li>Ne pas confondre addition de puissances et produit de puissances.</li>
  </ul>`
    this.versionAleatoire()
  }
}
