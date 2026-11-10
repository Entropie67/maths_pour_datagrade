import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '10/08/2025'
export const uuid = '7fe71'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C03-8'],
  'fr-ch': ['11LCQCMNO-8', '11LSQCMNO-8'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer avec des puissances de $-1$'
export default class Auto1AC3h extends ExerciceQcmA {
  private appliquerLesValeurs(k: number): void {
    this.enonce = `Soit $n$ un entier.<br> À quelle expression est égale $\\left(-1\\right)^{n+${k}}$ ?`

    if (k % 2 === 0) {
      // k est pair
      this.correction = `$\\begin{aligned} \\left(-1\\right)^{n+${k}}&=\\left(-1\\right)^{${k}} \\times \\left(-1\\right)^{n} \\\\  
      &=1\\times \\left(-1\\right)^{n} \\\\    
      &=${miseEnEvidence('\\left(-1\\right)^{n}')}      
      \\end{aligned}$<br>`

      this.reponses = [
        '$\\left(-1\\right)^{n} $',
        '$\\left(-1\\right)^{n+1}$ ',
        '$-\\left(-1\\right)^{n} $',
        '$\\left(-1\\right)^{n-1}$ ',
      ]
    } else {
      // k est impair
      this.correction = `$\\begin{aligned} \\left(-1\\right)^{n+${k}}&=\\left(-1\\right)^{${k - 1}}\\times \\left(-1\\right)^{n+1} \\\\    
      &=1\\times \\left(-1\\right)^{n+1} \\\\    
      &=${miseEnEvidence('\\left(-1\\right)^{n+1}')}   
      \\end{aligned}$<br>`

      this.reponses = [
        '$\\left(-1\\right)^{n+1} $',
        '$\\left(-1\\right)^{n+2} $',
        '$-\\left(-1\\right)^{n+1} $',
        '$\\left(-1\\right)^{n}$ ',
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2)
  }

  versionAleatoire = () => {
    const k = randint(3, 10)
    this.appliquerLesValeurs(k)
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut utiliser le comportement des puissances de $-1$.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Tester le résultat de $(-1)^n$ pour différentes valeurs de $n$.</li>
    <li>En déduire une propriété liée à la parité de l'exposant.</li>
    <li>Repérer si le nombre ajouté à $n$ change ou non cette parité.</li>
    <li>Tester les propositions une par une en cas d'hésitation.</li>
  </ul>`
    this.nbQuestions = 1
    const originalQJP = this.questionJamaisPosee.bind(this)
    this.questionJamaisPosee = (i, ...args) =>
      originalQJP(i, this.enonce, ...args)
    this.versionAleatoire()
  }
}
