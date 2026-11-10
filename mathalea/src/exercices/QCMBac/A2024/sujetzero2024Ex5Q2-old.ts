// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 6d32 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '6d32'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Sujet zéro 2024 : dénombrement'
export const dateDePublication = '20/04/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class MetropoleJuin24Exo4Q1Old extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private generateFraction(n: number, factors: number): string {
    let numerator = ''
    let denominator = ''

    for (let i = 0; i < factors; i++) {
      numerator += `${n - i}`
      denominator += `${i + 1}`
      if (i < factors - 1) {
        numerator += '\\times '
        denominator += '\\times '
      }
    }

    return `$\\dfrac{${numerator}}{${denominator}}$`
  }

  private generateProduct(p: number): string {
    let product = ''

    for (let i = 1; i <= p; i++) {
      product += `${i}`
      if (i < p) {
        product += '\\times '
      }
    }

    return `$${product}$`
  }

  private generateProduct2(n: number, p: number): string {
    let product2 = ''

    for (let i = 0; i < p; i++) {
      product2 += `${n - i}`
      if (i < p - 1) {
        product2 += '\\times '
      }
    }

    return `$${product2}$`
  }

  private appliquerLesValeurs(n: number, p: number): void {
    // const factors = 3 // Nombre de facteurs souhaités
    this.reponses = [
      this.generateFraction(n, p), // Réponse correcte
      `$${String(n)} ^ ${String(p)}$`, // Réponse incorrecte
      this.generateProduct(p), // Réponse incorrecte
      this.generateProduct2(n, p), // Réponse incorrecte
    ]
    this.enonce = `Une urne contient $${n}$ boules numérotées de $1$ à $${n}$.<br> On tire successivement $${p}$ boules dans cette urne, ${texteEnCouleurEtGras('sans remise')}. <br>
          On appelle «\u00a0tirage\u00a0» la liste non ordonnée des numéros des $${p}$ boules tirées. <br> Quel est le nombre de tirages possibles, sans tenir compte de l'ordre des numéros${sp()}?`

    this.correction = `Il n'y a pas d'ordre dans le tirage, on cherche donc le nombre de combinaisons de $${p}$ éléments d'un ensemble parmi $${n}$. <br>`
    this.correction += `<br>$\\displaystyle\\binom{${n}}{${p}}=\\dfrac{${n}~!}{(${n}-${p})~!\\times${p}~!}$`
    this.correction +=
      `$=\\dfrac{${n}~!}{${n - p}~!\\times${p}~!}=$` +
      this.generateFraction(n, p)
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(50, 3) // valeurs originales pour f(x) = {a=3}x-{b=2} avec x={c=-4}
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const n = randint(40, 60) // nombre de boules dans l'urne
      const p = randint(3, 5) // nombre de boules tirées dans l'urne
      this.appliquerLesValeurs(n, p)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
