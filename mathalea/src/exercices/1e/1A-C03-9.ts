import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '10/08/2025'
export const uuid = '6eba7'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C03-9'],
  'fr-ch': ['11LCQCMNO-9', '11LSQCMNO-9'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer l’inverse d’une puissance de $-1$'
export default class Auto1AC3i extends ExerciceQcmA {
  private appliquerLesValeurs(k: number): void {
    this.enonce = `Soit $n$ un entier.<br> À quelle expression est égale $\\dfrac{1}{\\left(-1\\right)^{n+${k}}}$ ?`

    if (k % 2 === 0) {
      // k est pair
      this.correction = `Soit $n\\in \\mathbb{N}.$<br> $\\begin{aligned}\\left(-1\\right)^{n+${k}}&=\\left(-1\\right)^{n}\\times \\left(-1\\right)^${k}\\\\
      &=\\left(-1\\right)^{n}
    \\end{aligned}$<br>
   $\\begin{aligned}\\text{or, }\\dfrac{1}{\\left(-1\\right)^{n}}&=\\dfrac{1^n}{\\left(-1\\right)^{n}}\\\\
      &=\\left(\\dfrac{1}{-1}\\right)^{n}\\\\
      &=\\left(-1\\right)^{n}.\\\\
    \\end{aligned}$<br>
    En conséquence, pour tout entier $n$, on a $\\dfrac{1}{\\left(-1\\right)^{n+${k}}}=${miseEnEvidence('\\left(-1\\right)^{n}')}$.`

      this.reponses = [
        '$\\left(-1\\right)^{n} $',
        '$\\left(-1\\right)^{n+1}$ ',
        '$-\\left(-1\\right)^{n} $',
        '$\\left(-1\\right)^{n-1}$ ',
      ]
    } else {
      // k est impair
      this.correction = `Soit $n\\in \\mathbb{N}.$<br>$\\begin{aligned}\\left(-1\\right)^{n+${k}}&=\\left(-1\\right)^${k}\\times \\left(-1\\right)^{n} \\\\
      &=-\\left(-1\\right)^{n}
    \\end{aligned}$<br>
   $\\begin{aligned}\\text{or, }\\dfrac{1}{\\left(-1\\right)^{n}}&=\\dfrac{1^n}{\\left(-1\\right)^{n}}\\\\
      &=\\left(\\dfrac{1}{-1}\\right)^{n}\\\\
      &=\\left(-1\\right)^{n}.\\\\
    \\end{aligned}$<br>
     En conséquence, pour tout entier $n$, on a $\\dfrac{1}{\\left(-1\\right)^{n+${k}}}=${miseEnEvidence('-\\left(-1\\right)^{n}')}.$`

      this.reponses = [
        '$-\\left(-1\\right)^{n}$ ',
        '$\\left(-1\\right)^{n} $',
        '$\\left(-1\\right)^{n+2} $',
        '$-\\left(-1\\right)^{n+1} $',
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
    Il faut utiliser le comportement des puissances de $-1$ et de leur inverse.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Tester le résultat de $(-1)^n$ pour différentes valeurs de $n$.</li>
    <li>En déduire une propriété liée à la parité de l'exposant.</li>
    <li>Se demander quel est l'inverse de $1$ et quel est l'inverse de $-1$.</li>
    <li>Tester les propositions une par une en cas d'hésitation.</li>
  </ul>`
    this.versionAleatoire()
  }
}
