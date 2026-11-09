import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '1f233'
export const refs = {
  'fr-fr': ['1A-C04-2', '2A-N4-2'],
  'fr-ch': ['9R1QCMNO-3', '9R2QCMNO-3', '9R3QCMNO-3', '10CTQCMNO-2', '10LCQCMNO-3', '10LSQCMNO-4'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une somme de fractions décimales'
export const dateDePublication = '02/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC4a extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce = `On considère $A=\\dfrac{1}{100}+\\dfrac{1}{${texNombre(1000)}}$. <br>
    On a : `
    this.correction = `On a : <br>
   $\\begin{aligned}
   A&=\\dfrac{1}{100}+\\dfrac{1}{${texNombre(1000)}}\\\\
   &=0,01+${texNombre(0.001)}\\\\
   &=${miseEnEvidence(0.011)}
   \\end{aligned}$ <br>`

    this.reponses = [
      '$A=0,011$',
      '$A=100,001$',
      `$\\dfrac{2}{${texNombre(100000)}}$`,
      '$A=0,11$',
    ]
  }

  versionAleatoire: () => void = () => {
    const denominateurs = [10, 100, 1000, 10000]
    const num = randint(1, 9)
    const d1 = choice(denominateurs)
    let d2 = choice(denominateurs)
    while (d2 === d1) {
      d2 = choice(denominateurs)
    }

    const somme = num / d1 + num / d2

    // Calcul de la fraction dÃ©cimale Ã©quivalente
    // On trouve le dÃ©nominateur commun (PPCM de d1 et d2)
    const pgcd = (a: number, b: number): number =>
      b === 0 ? a : pgcd(b, a % b)
    const ppcm = (a: number, b: number): number => (a * b) / pgcd(a, b)
    const denominateurCommun = ppcm(d1, d2)
    const numerateurFraction =
      num * (denominateurCommun / d1) + num * (denominateurCommun / d2)

    // Simplification de la fraction si possible
    const pgcdFraction = pgcd(numerateurFraction, denominateurCommun)
    const numSimple = numerateurFraction / pgcdFraction
    const denSimple = denominateurCommun / pgcdFraction

    // Vérifier si la fraction est simplifiable
    const fractionSimplifiable = pgcdFraction > 1

    // Choix alÃ©atoire du format de la bonne rÃ©ponse (30% de chance d'avoir la fraction)
    const formatFraction = choice([true, false, false]) // 1/3 de chance pour la fraction

    this.enonce = `On considère $A=\\dfrac{${num}}{${texNombre(d1)}}+\\dfrac{${num}}{${texNombre(d2)}}$. <br>On a : `

    if (formatFraction) {
      // Si la bonne réponse est la fraction
      if (fractionSimplifiable) {
        // Fraction simplifiable : on montre d'abord la fraction décimale puis la fraction simplifiée
        this.correction = ` On a  : <br>
       $\\begin{aligned}
       A&=\\dfrac{${num}}{${texNombre(d1)}}+\\dfrac{${num}}{${texNombre(d2)}}\\\\
       &=${texNombre(num / d1, 4)}+${texNombre(num / d2, 4)}\\\\
       &=${texNombre(somme, 4)}\\\\
       &=\\dfrac{${numerateurFraction}}{${texNombre(denominateurCommun)}}\\\\
       &=${miseEnEvidence(`\\dfrac{${numSimple}}{${texNombre(denSimple)}}`)}
       \\end{aligned}$ <br>`
      } else {
        // Fraction non simplifiable : on met directement en évidence la fraction décimale
        this.correction = ` On a  : <br>
       $\\begin{aligned}
       A&=\\dfrac{${num}}{${texNombre(d1)}}+\\dfrac{${num}}{${texNombre(d2)}}\\\\
       &=${texNombre(num / d1, 4)}+${texNombre(num / d2, 4)}\\\\
       &=${texNombre(somme, 4)}\\\\
       &=${miseEnEvidence(`\\dfrac{${numSimple}}{${texNombre(denSimple)}}`)}
       \\end{aligned}$ `
      }
    } else {
      // Si la bonne réponse est le nombre décimal
      this.correction = ` On a  : <br>
     $\\begin{aligned}
     A&=\\dfrac{${num}}{${texNombre(d1)}}+\\dfrac{${num}}{${texNombre(d2)}}\\\\
     &=${texNombre(num / d1, 4)}+${texNombre(num / d2, 4)}\\\\
     &=${miseEnEvidence(texNombre(somme, 4))}
     \\end{aligned}$ `
    }

    if (formatFraction) {
      this.reponses = [
        `$A=\\dfrac{${numSimple}}{${texNombre(denSimple)}}$`,
        `$A=${texNombre(somme / 10, 4)}$`,
        `$A=${texNombre(somme * 10, 4)}$`,
        `$A=\\dfrac{${2 * num}}{${texNombre(d1 * d2)}}$`,
      ]
    } else {
      this.reponses = [
        `$A=${texNombre(somme, 4)}$`,
        `$A=\\dfrac{${2 * num}}{${texNombre(d1 * d2)}}$`,
        `$A=${texNombre(somme * 10, 4)}$`,
        `$A=\\dfrac{${numSimple + 1}}{${texNombre(denSimple)}}$`,
      ]
    }
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut convertir une somme de fractions décimales.<br>
    On peut, au choix, convertir en écriture décimale ou en fraction décimale, puis effectuer la somme.<br>
    On peut aussi procéder par élimination pour les propositions clairement fausses.
  </p>
  `
    this.versionAleatoire()
    this.spacing = 1.5
    this.spacingCorr = 1
  }
}
