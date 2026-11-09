// import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '0ba80'
export const refs = {
  'fr-fr': ['TSP2-11', 'TCP1-21'],
  'fr-ch': ['3mQCM-5'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une probabilité avec la loi binomiale (QCM Bac)'
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
  private appliquerLesValeurs(p: number, nn: number): void {
    this.reponses = [
      `$${texNombre(1 - (1 - p / 100) ** nn, 3)}$`,
      `$${texNombre(1 - (1 - p / 100) ** nn - (((1 - p / 100) ** (nn - 1) * p) / 100) * nn, 3)}$`,
      '$1$',
      `$${texNombre(1 - (1 - p / 100) ** nn - (((1 - p / 100) ** (nn - 1) * p) / 100) * nn - 0.001, 3)}$`,
    ]
    this.enonce = this.sup3
      ? `Une chaîne de fabrication produit des pièces mécaniques.<br>
     On estime que $${p}\\,\\%$ des pièces produites par cette chaîne sont défectueuses.<br>
    On choisit au hasard $${nn}$ pièces produites par la chaîne de fabrication. <br>
    Le nombre de pièces produites est suffisamment grand pour que ce choix puisse être assimilé à un tirage avec remise. <br>
    On note $X$ la variable aléatoire égale au nombre de pièces défectueuses tirées.<br>`
      : ''
    this.enonce +=
      'Quelle est la probabilité, arrondie au millième, de tirer au moins une pièce défectueuse ?'
    this.correction = `$X$ suit une loi binomiale de paramètres $(${nn}\\,;\\,${texNombre(p / 100, 2)})$. <br>
    On cherche : $P\\left(X\\geqslant 1\\right)=1-P\\left(X=0\\right)$.<br>
    $P\\left(X=0\\right)=${texNombre(1 - p / 100, 2)}^{${nn}}\\approx${texNombre((1 - p / 100) ** nn, 3)}$<br>
    $P\\left(X\\geqslant 1\\right)\\approx${texNombre(1 - (1 - p / 100) ** nn, 3)}$`
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 50) // valeurs originales pour f(x) = {a=3}x-{b=2} avec x={c=-4}
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const p = randint(2, 6)
      const nn = randint(2, 7) * 10
      this.appliquerLesValeurs(p, nn)
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
