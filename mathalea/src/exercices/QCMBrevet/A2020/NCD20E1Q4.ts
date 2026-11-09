import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = 'e797c'
export const refs = {
  'fr-fr': ['3S1QCM-4'],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Moyenne d'une série (12/2020 Nouvelle Calédonie)"
export const dateDePublication = '1/11/2024'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Matthieu DEVILLERS
 * matthieu.devillers@ac-rennes.fr
 */
export default class NouvelleCaledonieDec20Exo1Q4 extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(
    valeur: Array<number>,
    mediane: number,
    effectif: number,
  ): void {
    const average = valeur.reduce((acc, curr) => acc + curr, 0) / valeur.length
    this.reponses = [
      `$${String(average)}$`, // Réponse correcte.
      `$${String(valeur[(effectif - 1) / 2])}$`, // Valeur placée au bon rang mais dans la série non ordonnée.
      `$${String(mediane)}$`, // médiane de la série.
    ]

    this.enonce = 'La moyenne de la série ci-dessous est :<br>'
    this.enonce += `$${valeur.map((v) => String(v)).join('~;~')}$`
    let sommeLatex = ''
    for (let i = 0; i < effectif; i++) {
      sommeLatex += i === 0 ? `${String(valeur[i])}` : ` + ${String(valeur[i])}`
    }
    this.correction = `$\\begin{aligned}
    \\text{Moyenne} &= \\dfrac{${sommeLatex}}{${String(effectif)}} \\\\
    &= \\dfrac{${String(average * effectif)}}{${String(effectif)}} \\\\
    &= ${miseEnEvidence(`${String(average)}`)}
    \\end{aligned}$`
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs([3, 2, 4, 3, 7, 9, 7], 4, 7) // valeurs du sujet original
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 3 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const effectif = 2 * randint(0, 4) + 5 // effectif impair compris entre 5 et 13
      const mediane = randint(0, 12) + 8 // médiane entière comprise entre 8 et 20
      const valeur = []
      for (let i = 0; i < (effectif - 1) / 2; i++) {
        valeur[i] = randint(0, mediane - 2) + 1 // moitié des valeurs, entières et strictement comprises entre 0 et la médiane
        valeur[effectif - i - 1] = randint(1, 5 + effectif) + mediane // moitié des valeurs strictement supérieure à la médiane.
      }
      valeur[(effectif - 1) / 2] = mediane
      const somme = valeur.reduce((acc, curr) => acc + curr, 0)
      valeur[effectif - 1] += effectif - (somme % effectif)
      const valeurMelange = shuffle(valeur)
      this.appliquerLesValeurs(valeurMelange, mediane, effectif)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.versionAleatoire()
  }
}
