// import { miseEnEvidence } from '../../lib/outils/embellissements'
import { combinations } from '../../lib/mathFonctions/combinatoire'
import { choice } from '../../lib/outils/arrayOutils'
import { rangeMinMax } from '../../lib/outils/nombres'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'
export const uuid = 'ecde7'
export const refs = {
  'fr-fr': ['TSP2-15', 'TCP1-25'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer un seuil avec une loi binomiale (QCM Bac)'
export const dateDePublication = '08/11/2024'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class MetropoleJuin24Exo4Q1 extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(n: number, pourcent: number): void {
    let P = 0
    let k = 0
    const seuil = 0.95
    const p = pourcent / 100
    do {
      const cnk = combinations(n, k)
      const pDeXEgalK = cnk * p ** k * (1 - p) ** (n - k)
      P += pDeXEgalK
      k++
    } while (P < seuil && k < n)
    k--
    const sol1 = rangeMinMax(k, k + 3, [k])
    const sol2 = rangeMinMax(k - 1, k + 2, [k])
    const sol3 = rangeMinMax(k - 2, k + 1, [k])
    const sol4 = rangeMinMax(k - 3, k, [k])
    const sol = choice([sol1, sol2, sol3, sol4]).map(String)

    this.reponses = [`${k}`, ...sol]

    this.enonce = this.sup3
      ? `Une chaîne de fabrication produit des pièces mécaniques.<br>
      On estime que $${pourcent}\\,\\%$ des pièces produites par cette chaîne sont défectueuses.<br>
     On choisit au hasard $${n}$ pièces produites par la chaîne de fabrication. <br>
     Le nombre de pièces produites est suffisamment grand pour que ce choix puisse être assimilé à un tirage avec remise. <br>
     On note $X$ la variable aléatoire égale au nombre de pièces défectueuses tirées.<br>`
      : ''
    this.enonce +=
      'Quel est le plus petit entier naturel $k$ tel que la probabilité de tirer au plus $k$ pièces défectueuses soit supérieure ou égale à $95\\,\\%$ ?'
    this.correction = `${k}`
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(50, 4) // 4% et 50 pièces
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const p = randint(2, 9)
      const nn = randint(3, 7) * 10 + randint(1, 9)

      this.appliquerLesValeurs(nn, p)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
    this.besoinFormulaire3CaseACocher = ["Avec le préambule de l'énoncé", true]
    this.sup3 = true
  }
}
