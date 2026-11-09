import { miseEnEvidence } from '../../lib/outils/embellissements'

import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '2137a'
export const refs = {
  'fr-fr': ['1A-C03-12', '2A-N3-7'],
  'fr-ch': ['11LCQCMNO-10', '11LSQCMNO-10'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Trouver l'égalité correcte (puissances)"
export const dateDePublication = '23/07/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class TrouverEgalite extends ExerciceQcmA {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.correction = `La seule égalité vraie est : $${miseEnEvidence('\\dfrac{10^{-5}}{10^8}=10^{-13}')}$.<br>
    En effet, <br>  
      $\\begin{aligned}
     \\dfrac{10^{-5}}{10^8}&=10^{-5-8}\\\\
      &=10^{-13}
      \\end{aligned}$<br>
      Les égalités corrigées (et donc correctes) pour les autres égalités, sont : <br>
      $40\\times \\dfrac{1}{40^3}=40^{-2}$<br>
       $\\left(2^{-4}\\right)^3=2^{-12}$<br>
       $5^{-6}\\times 11^{-6}=55^{-6}$`
    this.reponses = [
      '$\\dfrac{10^{-5}}{10^8}=10^{-13}$',
      '$40\\times \\dfrac{1}{40^3}=40^2$',
      '$\\left(2^{-4}\\right)^3=2^{-1}$',
      '$5^{-6}\\times 11^{-6}=55^{-12}$',
    ]
  }

  versionAleatoire: () => void = () => {
    const a = randint(3, 15)
    const n = randint(-10, -3)
    const p = -n + randint(4, 8)
    const a1 = randint(2, 6) * 10
    const n1 = randint(3, 6)
    const a2 = randint(2, 6) * 10
    const n2 = randint(-8, -3)
    const p2 = randint(3, 6)
    const a3 = randint(3, 7)
    const b3 = randint(3, 7, a3)
    const n3 = randint(-6, -2)
    const calc1 = `\\dfrac{${a}^{${n}}}{${a}^{${p}}}=${a}^{${n - p}}` // a^n/a^p=a^(n-p)
    const calc2 = `${a1}\\times \\dfrac{1}{${a1}^{${n1}}}=${a1}^{${1 - n1}}` // a*1/a^n=a^(1-n)
    const calc3 = `\\left(${a2}^{${n2}}\\right)^${p2}=${a2}^{${n2 * p2}}` // (a^n)^p=a^(n*p)
    const calc4 = `${a3}^{${n3}}\\times ${b3}^{${n3}}=${a3 * b3}^{${n3}}` // a^n*b^n=(a*b)^n

    const calc1F = `\\dfrac{${a}^{${n}}}{${a}^{${p}}}=${a}^{${n + p}}` // a^n/a^p=a^(n-p)
    const calc2F = `${a1}\\times \\dfrac{1}{${a1}^{${n1}}}=${a1}^{${n1 - 1}}` // a*1/a^n=a^(1-n) réponse fausse
    const calc3F = `\\left(${a2}^{${n2}}\\right)^${p2}=${a2}^{${n2 + p2}}` // (a^n)^p=a^(n*p) réponse fausse
    const calc4F = `${a3}^{${n3}}\\times ${b3}^{${n3}}=${a3 * b3}^{${2 * n3}}` // a^n*b^n=(a*b)^n
    this.enonce = 'Parmi ces égalités, la seule égalité vraie est :'
    switch (
      randint(1, 4) //
    ) {
      case 1: //  a^n/a^p=a^n-p
        this.correction = `La seule égalité vraie est : $${miseEnEvidence(`${calc1}`)}$.<br>
    En effet, <br>  
      $\\begin{aligned}
    \\dfrac{${a}^{${n}}}{${a}^{${p}}}&=${a}^{${n}-${p}}\\\\
      &=${a}^{${n - p}}
      \\end{aligned}$<br>
    Concernant les autres propositions : <br>
     $${calc2}\\neq ${a1}^{${n1 - 1}}$<br>
  $${calc3}\\neq ${a2}^{${n2 + p2}}$<br>
       $${calc4}\\neq ${a3 * b3}^{${2 * n3}}$`
        this.reponses = [
          `$${calc1}$`,
          `$${calc2F}$`,
          `$${calc3F}$`,
          `$${calc4F}$`,
        ]
        break

      case 2: // égalité vraie est la a*1/a^n
        this.correction = `La seule égalité vraie est : $${miseEnEvidence(`${calc2}`)}$.<br>
    En effet, <br>  
      $\\begin{aligned}
    ${a1}\\times \\dfrac{1}{${a1}^{${n1}}}&=\\dfrac{${a1}^1}{${a1}^{${n1}}}\\\\
    &=${a1}^{1-${n1}}\\\\
      &=${a1}^{${1 - n1}}
      \\end{aligned}$<br>
     Concernant les autres propositions : <br>
    $${calc1}\\neq ${a}^{${n + p}}$<br>
  $${calc3}\\neq ${a2}^{${n2 + p2}}$<br>
       $${calc4}\\neq ${a3 * b3}^{${2 * n3}}$`
        this.reponses = [
          `$${calc2}$`,
          `$${calc1F}$`,
          `$${calc3F}$`,
          `$${calc4F}$`,
        ]
        break

      case 3: // égalité vraie est la (a^n)^p
        this.correction = `La seule égalité vraie est : $${miseEnEvidence(`${calc3}`)}$.<br>
    En effet, <br>  
      $\\begin{aligned}
    \\left(${a2}^{${n2}}\\right)^${p2}&=${a2}^{${n2} \\times ${p2}}\\\\
    &=${a2}^{${n2 * p2}}
      \\end{aligned}$<br>
     Concernant les autres propositions : <br>
     $${calc1}\\neq ${a}^{${n + p}}$<br>
  $${calc2}\\neq ${a1}^{${n1 - 1}}$<br>
       $${calc4}\\neq ${a3 * b3}^{${2 * n3}}$`
        this.reponses = [
          `$${calc3}$`,
          `$${calc2F}$`,
          `$${calc1F}$`,
          `$${calc4F}$`,
        ]
        break

      case 4: // égalité vraie est a^n*b^n=(a*b)*n
      default:
        this.correction = `La seule égalité vraie est : $${miseEnEvidence(`${calc4}`)}$.<br>
    En effet, <br>  
      $\\begin{aligned}
      ${a3}^{${n3}}\\times ${b3}^{${n3}}&=(${a3}\\times ${b3})^{${n3}}\\\\
    &=${a3 * b3}^{${n3}}
      \\end{aligned}$<br>
     Concernant les autres propositions : <br>
    $${calc1}\\neq ${a}^{${n + p}}$<br>
  $${calc2}\\neq ${a1}^{${n1 - 1}}$<br>
       $${calc3}\\neq ${a2}^{${n2 + p2}}$`
        this.reponses = [
          `$${calc4}$`,
          `$${calc1F}$`,
          `$${calc3F}$`,
          `$${calc2F}$`,
        ]
        break
    }
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut vérifier plusieurs égalités avec des puissances.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Traiter les propositions une par une.</li>
    <li>Identifier la propriété utilisée dans chaque proposition.</li>
    <li>Vérifier si cette propriété est appliquée correctement.</li>
    <li>Procéder par élimination : une seule égalité est vraie dans ce QCM.</li>
  </ul>`

    this.versionAleatoire()
  }
}
