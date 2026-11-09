// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid b66e5 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'b66e5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Polynésie 06/2024 : combinatoire'
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
  private generateProduct(n: number, p: number): string {
    let product = ''

    for (let i = 0; i < p; i++) {
      product += `${n - i}`
      if (i < p - 1) {
        product += '\\times '
      }
    }

    return `$${product}$`
  }

  private generateSum(n: number, p: number): string {
    let sum = ''

    for (let i = 0; i < p; i++) {
      sum += `${n - i}`
      if (i < p - 1) {
        sum += ' + '
      }
    }

    return `$${sum}$`
  }

  private appliquerLesValeurs(nn: number, p: number): void {
    this.reponses = [
      `$\\dbinom{${nn}}{${p}}$`,
      this.generateProduct(nn, p),
      this.generateSum(nn, p),
      `$${String(nn)} ^ ${String(p)}$`,
    ]

    this.enonce = `Une professeure enseigne la spécialité mathématiques dans une classe de $${nn}$ élèves de terminale.<br>
Elle veut former un groupe de $${p}$ élèves.<br> De combien de façons différentes peut-elle former
un tel groupe de $${p}$ élèves${sp()}?`
    this.correction = `La selection des élèves se fait sans ordre. <br>On cherche donc la façon de créer des combinaisons de $${p}$ élèves parmi $${nn}$.<br>Le nombre de groupes de $${p}$ élèves parmi les $${nn}$ est $${miseEnEvidence(`\\dbinom{${nn}}{${p}}`)}$.`
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(31, 5) // valeurs originales pour f(x) = {a=3}x-{b=2} avec x={c=-4}
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const p = randint(4, 7) // nombre d'élèves à choisir (entre 4 et 7)
      const nn = randint(25, 35)
      this.appliquerLesValeurs(nn, p)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()

    this.sup3 = true
  }
}
