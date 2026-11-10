// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid bd806 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'bd806'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer la valeur manquante d'une série dont on connaît la moyenne"
export const dateDePublication = '02/08/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Stéphane Guyon
 *
 */

export default class MoyenneQCMOld extends ExerciceQcmA {
  // Méthode privée pour factoriser le code redondant
  private appliquerLesValeurs(
    valeurs: number[],
    effectif: number,
    moyenne: number,
    x: number,
    distracteur2: number,
    distracteur3: number,
    distracteur4: number,
  ): void {
    const somme = valeurs.reduce((a, b) => a + b, 0)

    // Construction du tableau de réponses avec la bonne réponse en premier
    this.reponses = [
      `$${texNombre(x)}$`, // Bonne réponse
      `$${texNombre(distracteur2)}$`, // Distracteur 1
      `$${texNombre(distracteur3)}$`, // Distracteur 2
      `$${texNombre(distracteur4)}$`, // Distracteur 3
    ]

    // Construction de l'énoncé
    this.enonce = `On donne la série statistique suivante : $${valeurs.join(' ; ')}$.<br>
    Quelle valeur faut-il ajouter à la série pour que sa moyenne soit égale à $${texNombre(moyenne)}$ ?`

    // Construction de la correction
    this.correction = `Appelons $x$ la valeur cherchée.<br>
    On commence par calculer la somme des valeurs de la série de l'énoncé :<br>
    $${valeurs.join(' + ')} = ${somme}$.<br>
    Comme la série de l'énoncé contient $${effectif}$ valeurs, la nouvelle série avec $x$ en contient $${effectif + 1}$.<br>
    On peut calculer sa moyenne avec l'expression : $\\dfrac{${somme} + x}{${effectif + 1}}$<br>
    Comme cette moyenne vaut $${texNombre(moyenne)}$ d'après l'énoncé, il faut alors résoudre l'équation : <br>
    $\\dfrac{${somme} + x}{${effectif + 1}} = ${texNombre(moyenne)}$<br>
    $${somme} + x = ${texNombre(moyenne)} \\times ${effectif + 1}$<br>
    $x = ${texNombre(moyenne)} \\times ${effectif + 1} - ${somme}$<br>
    $x = ${miseEnEvidence(texNombre(x))}$`
  }

  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  versionOriginale: () => void = () => {
    // Version avec données statiques
    const effectif = 4
    const valeurs = [8, 12, 6, 10] // Série fixe
    const somme = valeurs.reduce((a, b) => a + b, 0) // somme = 36
    const moyenne = 9 // Moyenne cible fixe

    // Calcul de la valeur à ajouter : x = moyenne * (effectif + 1) - somme
    const x = moyenne * (effectif + 1) - somme // x = 9 * 5 - 36 = 9

    // Distracteurs fixes
    const distracteur2 = 7 // x - 2
    const distracteur3 = 11 // x + 2
    const distracteur4 = 5 // x - 4

    this.appliquerLesValeurs(
      valeurs,
      effectif,
      moyenne,
      x,
      distracteur2,
      distracteur3,
      distracteur4,
    )
  }

  versionAleatoire = () => {
    const n = 4 // nombre de réponses
    let x: number,
      distracteur2: number,
      distracteur3: number,
      distracteur4: number

    do {
      const effectif = choice([4, 5])
      const valeurs = []

      // Génération des valeurs de la série
      for (let i = 0; i < effectif; i++) {
        valeurs.push(randint(5, 15, 0))
      }

      const somme = valeurs.reduce((a, b) => a + b, 0)
      const moyenne1 = somme / effectif

      // Calcul de la moyenne cible
      let moyenne: number
      if (moyenne1 > 11) {
        moyenne = Math.floor(moyenne1) - 1
      } else {
        moyenne = Math.floor(moyenne1) + 1
      }

      // Calcul de la valeur à ajouter
      x = moyenne * (effectif + 1) - somme

      // Fonction pour mélanger un tableau (Fisher-Yates)
      function shuffleArray<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[array[i], array[j]] = [array[j], array[i]]
        }
      }

      // Génération des distracteurs
      function genererDistracteurs(x: number): {
        distracteur2: number
        distracteur3: number
        distracteur4: number
      } {
        // Génère les valeurs autour de x (±1, ±2, ±3)
        const deltas = [-3, -2, -1, 1, 2, 3]
        const candidates = deltas
          .map((delta) => x + delta)
          .filter((val) => val > 0) // Garde seulement les positifs

        // Mélange les candidats
        shuffleArray(candidates)

        if (candidates.length < 3) {
          throw new Error(
            'Pas assez de valeurs positives autour de x pour générer 3 distracteurs',
          )
        }

        const [distracteur2, distracteur3, distracteur4] = candidates.slice(
          0,
          3,
        )
        return { distracteur2, distracteur3, distracteur4 }
      }

      const distracteurs = genererDistracteurs(x)
      distracteur2 = distracteurs.distracteur2
      distracteur3 = distracteurs.distracteur3
      distracteur4 = distracteurs.distracteur4

      this.appliquerLesValeurs(
        valeurs,
        effectif,
        moyenne,
        x,
        distracteur2,
        distracteur3,
        distracteur4,
      )
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()

    this.versionAleatoire() // Appel de la méthode pour initialiser l'exercice
  }
}
