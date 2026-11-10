import { aLeBonNombreDePropsDifferentes } from '../../../lib/interactif/qcm'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceQcmA from '../../ExerciceQcmA'
export const dateDePublication = '10/08/2025'
export const dateDeModifImportante = '31/10/2026'
export const uuid = '41fa7'
/** @author Stéphane Guyon */
export const refs = {
  'fr-fr': ['canTEC1-04','TEC1-15'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer les puissances de $i$'
export default class Complexes1 extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce = '$\\mathrm{i}^{4}$ est égal à : '
    this.correction = `On sait que $\\mathrm{i}^{2}=-1$ donc $\\mathrm{i}^{4}=\\left(-1\\right)^{2}=${miseEnEvidence('1')}.$`
    this.reponses = ['$1 $', '$-1$ ', '$\\mathrm{i} $', '$-\\mathrm{i}$ ']
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const k = randint(3, 10) //

      const moins = randint(1, 2) // pour jouer sur présence ou non d'un signe -
      switch (moins) {
        case 1:
          this.enonce = `$\\mathrm{i}^{${k}}$ est égal à `
          this.correction = `Par définition, on sait que $\\mathrm{i}^{2}=-1$. `

          if (k % 4 === 0) {
            // On prend les cas où l'exposant est multiple de 4
            if (k === 4) {
              this.correction += ` donc $\\mathrm{i}^{4}=${miseEnEvidence('1')}$ .`
            } else {
              this.correction += `donc $\\mathrm{i}^{4}=1$.<br>
        $ \\begin{aligned}\\mathrm{i}^{${k}}&=\\left(\\mathrm{i}^{4}\\right)^{${k / 4}}\\\\
        &=${miseEnEvidence('1')}
        \\end{aligned}$`
            }
            this.reponses = ['$1$', '$-1$ ', '$\\mathrm{i}$', '$-\\mathrm{i}$ ']
          } else if (k === 7) {
            // Cas particulier de l'exposant =7
            this.correction += `donc $\\mathrm{i}^{4}=1$. <br>
         $\\begin{aligned}
         \\mathrm{i}^{7}&=\\mathrm{i}^{4}\\times \\mathrm{i}^{3}\\\\
          &=\\mathrm{i}^{3}\\\\
         &=\\mathrm{i}^{2}\\times \\mathrm{i}\\\\
          &=${miseEnEvidence('-\\mathrm{i}')}
         \\end{aligned}$`
            this.reponses = [
              '$-\\mathrm{i} $',
              '$1 $',
              '$-1$ ',
              '$\\mathrm{i}$ ',
            ]
          } else if (k === 3) {
            //
            this.correction += `  <br>
         $\\begin{aligned}
         \\mathrm{i}^{3}&=\\mathrm{i}^{2}\\times \\mathrm{i}\\\\
         &=${miseEnEvidence('-\\mathrm{i}')}
         \\end{aligned}$`
            this.reponses = [
              '$-\\mathrm{i} $',
              '$1 $',
              '$-1$ ',
              '$\\mathrm{i}$ ',
            ]
          } else if (k % 4 === 2) {
            // Cas où l'exposant est multiple de 2 mais pas de 4
            this.correction += `donc $\\mathrm{i}^{4}=1$. <br>
         $\\begin{aligned}
         \\mathrm{i}^{${k}}&=\\mathrm{i}^{${k - 2}}\\times \\mathrm{i}^{2}\\\\
         &=\\left(\\mathrm{i}^{4}\\right)^{${(k - 2) / 4}}\\times \\mathrm{i}^{2}\\\\
         &=${miseEnEvidence('-1')}
         \\end{aligned}$`
            this.reponses = [
              '$-1$ ',
              '$-\\mathrm{i}$ ',
              '$1 $',
              '$\\mathrm{i}$ ',
            ]
          } else if (k % 4 === 1) {
            // Cas où l'exposant donne un reste 1 à la division par 4
            this.correction += `donc $\\mathrm{i}^{4}=1$. <br>
         $\\begin{aligned}
          \\mathrm{i}^{${k}}&=\\mathrm{i}^{${k - 1}}\\times \\mathrm{i}\\\\
         &=\\left(\\mathrm{i}^{4}\\right)^{${(k - 1) / 4}}\\times \\mathrm{i}\\\\
         &=${miseEnEvidence('\\mathrm{i}')}
         \\end{aligned}$`
            this.reponses = [
              '$\\mathrm{i}$ ',
              '$1 $',
              '$-1$ ',
              '$-\\mathrm{i}$ ',
            ]
          }
          break
        case 2:
          this.enonce = `$\\left(-\\mathrm{i}\\right)^{${k}}$ est égal à `
          this.correction = `On sait que $\\left(-\\mathrm{i}\\right)^{${k}}=\\left(-1\\right)^{${k}}\\times \\mathrm{i}^{${k}}$. <br>`
          this.correction += 'Par définition, on a $\\mathrm{i}^{2}=-1$ '

          if (k % 4 === 0) {
            if (k === 4) {
              this.correction += ` donc $\\mathrm{i}^{4}=1$ et finalement $\\left(-\\mathrm{i}\\right)^{4}=${miseEnEvidence('1')}$.`
            } else {
              this.correction += ` donc $\\mathrm{i}^{4}=1$.<br>
        $\\begin{aligned}\\left(-\\mathrm{i}\\right)^{${k}}
        &=\\mathrm{i}^{${k}}\\\\
        &=\\left(\\mathrm{i}^{4}\\right)^{${k / 4}}\\\\
        &=${miseEnEvidence('1')}
        \\end{aligned}$`
            }
            this.reponses = [
              '$1 $',
              '$-1$ ',
              '$\\mathrm{i} $',
              '$-\\mathrm{i}$ ',
            ]
          } else if (k === 7) {
            this.correction += `donc $\\mathrm{i}^{4}=1$.<br>
         $\\begin{aligned}
         \\left(-\\mathrm{i}\\right)^{7}&=\\left(-1\\right)^{7}\\times \\mathrm{i}^{7}\\\\
         &=-\\mathrm{i}^{4}\\times \\mathrm{i}^{3}\\\\
         &=-\\mathrm{i}^{3}\\\\
         &=-\\mathrm{i}^{2}\\times \\mathrm{i}\\\\
          &=${miseEnEvidence('\\mathrm{i}')}
         \\end{aligned}$`
            this.reponses = ['$\\mathrm{i} $', '$1 $', '$-1$ ', '$-\\mathrm{i}$ ']
          } else if (k === 3) {
            this.correction += `   <br> 
         $\\begin{aligned}
         \\left(-\\mathrm{i}\\right)^{3}&= -\\mathrm{i}^{3}\\\\
         &=-\\mathrm{i}^{2}\\times \\mathrm{i}\\\\
         &=${miseEnEvidence('\\mathrm{i}')}
         \\end{aligned}$`
            this.reponses = [
              '$\\mathrm{i} $',
              '$1 $',
              '$-1$ ',
              '$-\\mathrm{i}$ ',
            ]
          } else if (k % 4 === 2) {
            this.correction += `donc $\\mathrm{i}^{4}=1$, <br> 
         $\\begin{aligned}
         \\left(-\\mathrm{i}\\right)^{${k}}&=\\left(-1\\right)^{${k}}\\times \\mathrm{i}^{${k - 2}}\\times \\mathrm{i}^{2}\\\\
         &=\\mathrm{i}^{${k - 2}}\\times \\mathrm{i}^{2}\\\\
         &=\\left(\\mathrm{i}^{4}\\right)^{${(k - 2) / 4}}\\times \\mathrm{i}^{2}\\\\
         &=${miseEnEvidence('-1.')}
         \\end{aligned}$`
            this.reponses = [
              '$-1$ ',
              '$-\\mathrm{i}$ ',
              '$1 $',
              '$\\mathrm{i} $',
            ]
          } else if (k % 4 === 1) {
            this.correction += `donc $\\mathrm{i}^{4}=1$, <br>  
         $\\begin{aligned}
         \\left(-\\mathrm{i}\\right)^{${k}}&=(-1)^{${k}}\\times \\mathrm{i}^{${k - 1}}\\times \\mathrm{i}\\\\
         &=-\\mathrm{i}^{${k - 1}}\\times \\mathrm{i}\\\\
         &=${miseEnEvidence('-\\mathrm{i}.')}
         \\end{aligned}$`
            this.reponses = [
              '$-\\mathrm{i}$ ',
              '$1 $',
              '$-1$ ',
              '$\\mathrm{i} $',
            ]
          }
          break
      }
    } while (
      compteur++ < 100 &&
      aLeBonNombreDePropsDifferentes(this.reponses, 4, true)
    )
  }

  constructor() {
    super()
    this.optionsDeComparaison = { expressionNumerique: true }
    this.versionAleatoire()
  }
}
