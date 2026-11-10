// import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '79c98'
export const refs = {
  'fr-fr': ['TSP2-14', 'TCP1-24'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Exprimer une probabilité à l'aide de la fonction de répartition d'une loi binomiale (QCM Bac)"
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
  private appliquerLesValeurs(
    nn: number,
    p: number,
    a: number,
    b: number,
  ): void {
    this.reponses = [
      `$p(X \\leqslant ${b}) - p(X \\leqslant ${a})$`,
      `$p(X \\leqslant ${b}) - p(X > ${a})$`,
      `$p(X < ${b}) - p(X > ${a})$`,
      `$p(X < ${b}) - p(X \\geqslant ${a})$`,
    ]

    this.enonce = this.sup3
      ? `Une chaîne de fabrication produit des pièces mécaniques.<br>
      On estime que $${p}\\,\\%$ des pièces produites par cette chaîne sont défectueuses.<br>
     On choisit au hasard $${nn}$ pièces produites par la chaîne de fabrication. <br>
     Le nombre de pièces produites est suffisamment grand pour que ce choix puisse être assimilé à un tirage avec remise. <br>
     On note $X$ la variable aléatoire égale au nombre de pièces défectueuses tirées.<br>`
      : ''
    this.enonce += `La probabilité $p(${a} < X \\leqslant ${b})$ est égale à${sp()}:`
    this.correction = `$p\\left(X\\leqslant ${b}\\right)$ calcule la probabilité que $X\\leqslant ${b}$.<br>
    On veut en même temps $X>${a}$, il faut donc enlever les premières valeurs de $X$, quand $X\\leqslant ${a}$.<br>
     La réponse est donc $p(X \\leqslant ${b})$ à qui on ôte $p(X \\leqslant ${a})$.<br>
    Soit $p(X \\leqslant ${b}) - p(X \\leqslant ${a})$`
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 50, 3, 7) // valeurs originales pour f(x) = {a=3}x-{b=2} avec x={c=-4}
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const p = randint(2, 9)
      const nn = randint(3, 7) * 10 + randint(1, 9)
      const step = randint(2, 6)
      const step1 = randint(3, 6)
      const step2 = randint(3, 6)
      const step3 = randint(2, 5)
      const a = randint(step, step + step1)
      const b = randint(step + step1 + step2, step + step1 + step2 + step3)
      this.appliquerLesValeurs(nn, p, a, b)
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
