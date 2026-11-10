import { shuffle } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '0c97a'
export const refs = {
  'fr-fr': ['1A-S02-7', '2A-S2-7', 'BP1AUTO033', 'BP1AUTO039'],
  'fr-ch': ['4mQCM-1'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Comparer la moyenne et l'écart-type d'une série rangée en classes"
export const dateDePublication = '05/08/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 * @author Stéphane Guyon
 */

export default class MoyenneEcartTypeClasseQCM extends ExerciceQcmA {
  private appliquerLesValeurs(
    serieAForcee?: number[],
    serieBForcee?: number[],
  ): void {
    const moyenne = (arr: number[]) =>
      arr.reduce((sum, x) => sum + x, 0) / arr.length

    const ecartType = (arr: number[]) => {
      const m = moyenne(arr)
      const variance =
        arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / arr.length
      return Math.sqrt(variance)
    }

    const genereSerie = (
      moyenneCible: number,
      dispersion: number,
    ): number[] => {
      const base = moyenneCible
      const deltas = {
        faible: [0, 0, 1, -1],
        moyenne: [0, 2, -2, 0],
        forte: [3, -3, 0, 0],
      }

      const ecarts =
        deltas[
          dispersion === 1 ? 'faible' : dispersion === 2 ? 'moyenne' : 'forte'
        ]
      const melange = shuffle(ecarts)
      return melange.map((d) => base + d)
    }

    let serieA: number[] = []
    let serieB: number[] = []

    // Si des séries sont forcées (version originale), on les utilise
    if (serieAForcee && serieBForcee) {
      serieA = serieAForcee
      serieB = serieBForcee
    } else {
      // Sinon, génération aléatoire (version aléatoire)
      const scenario = Math.floor(Math.random() * 4)

      switch (scenario) {
        case 0:
          // Même moyenne, mais série F plus dispersée
          serieA = genereSerie(10, 1)
          serieB = genereSerie(10, 3)
          break
        case 1:
          // Moyenne A > B, écart-type similaire
          serieA = genereSerie(12, 2)
          serieB = genereSerie(9, 2)
          break
        case 2:
          // Moyenne égale, A plus dispersée
          serieA = genereSerie(10, 3)
          serieB = genereSerie(10, 1)
          break
        case 3:
          // Moyenne B > A, écart-type égal
          serieA = genereSerie(9, 3)
          serieB = genereSerie(12, 3)
          break
      }
    }

    const moyA = moyenne(serieA)
    const moyB = moyenne(serieB)
    const etA = ecartType(serieA)
    const etB = ecartType(serieB)

    // Liste standardisée des 4 réponses possibles
    const toutesLesReponses = [
      'La moyenne de la série F est strictement supérieure à la moyenne de la série E.',
      'La moyenne de la série E est strictement supérieure à la moyenne de la série F.',
      "L'écart-type de la série E est strictement supérieur à l'écart-type de la série F.",
      "L'écart-type de la série F est strictement supérieur à l'écart-type de la série E.",
    ]

    // Détection automatique de la bonne réponse
    let bonnePhrase = ''
    let explication = ''

    if (moyB > moyA) {
      bonnePhrase = toutesLesReponses[0]
      explication = `La moyenne de la série F est $${texNombre(moyB, 2)}$, celle de la série E est $${texNombre(moyA, 2)}$.<br>
      On peut conclure que la seule réponse acceptable est que ${texteEnCouleurEtGras('la moyenne de la série F est strictement supérieure à la moyenne de la série E')}.<br>
      Il n'est pas nécessaire de calculer l'écart-type pour répondre à cette question.`
    } else if (moyA > moyB) {
      bonnePhrase = toutesLesReponses[1]
      explication = `La moyenne de la série E est $${texNombre(moyA, 2)}$, celle de la série F est $${texNombre(moyB, 2)}$.
      <br>On peut conclure que la seule réponse acceptable est que ${texteEnCouleurEtGras('la moyenne de la série E est strictement supérieure à la moyenne de la série F')}.<br>
      Il n'est pas nécessaire de calculer l'écart-type pour répondre à cette question.`
    } else if (etA > etB) {
      bonnePhrase = toutesLesReponses[2]

      // Calcul des termes pour l'écart-type A
      const termesA = serieA
        .map((x) => `(${x} - ${texNombre(moyA, 0)})^2`)
        .join(' + ')
      const sommeCarresA = serieA.reduce(
        (sum, x) => sum + Math.pow(x - moyA, 2),
        0,
      )
      const varianceA = sommeCarresA / serieA.length

      // Calcul des termes pour l'écart-type B
      const termesB = serieB
        .map((x) => `(${x} - ${texNombre(moyB, 0)})^2`)
        .join(' + ')
      const sommeCarresB = serieB.reduce(
        (sum, x) => sum + Math.pow(x - moyB, 2),
        0,
      )
      const varianceB = sommeCarresB / serieB.length

      explication = `On calcule les moyennes des deux séries qui sont toutes les deux égales à $${texNombre(moyA, 2)}$.<br>
      Les moyennes sont égales, on calcule les écarts-types :<br>
      $\\sigma_E = \\sqrt{\\dfrac{${termesA}}{${serieA.length}}} = \\sqrt{\\dfrac{${sommeCarresA}}{${serieA.length}}} = \\sqrt{${texNombre(varianceA, 2)}}$<br>
      $\\sigma_F = \\sqrt{\\dfrac{${termesB}}{${serieB.length}}} = \\sqrt{\\dfrac{${sommeCarresB}}{${serieB.length}}} = \\sqrt{${texNombre(varianceB, 2)}}$<br>
      On a donc $\\sigma_E > \\sigma_F$.<br>
      ${texteEnCouleurEtGras("L'écart-type de la série E est strictement supérieur à celui de la série F")}.`
    } else {
      bonnePhrase = toutesLesReponses[3]

      // Calcul des termes pour l'écart-type A
      const termesA = serieA
        .map((x) => `(${x} - ${texNombre(moyA, 0)})^2`)
        .join(' + ')
      const sommeCarresA = serieA.reduce(
        (sum, x) => sum + Math.pow(x - moyA, 2),
        0,
      )
      const varianceA = sommeCarresA / serieA.length

      // Calcul des termes pour l'écart-type B
      const termesB = serieB
        .map((x) => `(${x} - ${texNombre(moyB, 0)})^2`)
        .join(' + ')
      const sommeCarresB = serieB.reduce(
        (sum, x) => sum + Math.pow(x - moyB, 2),
        0,
      )
      const varianceB = sommeCarresB / serieB.length

      explication = `On calcule les moyennes des deux séries qui sont toutes les deux égales à $${texNombre(moyA, 2)}$.<br>
      Les moyennes sont égales, on calcule les écarts-types :<br>
      $\\sigma_E = \\sqrt{\\dfrac{${termesA}}{${serieA.length}}} = \\sqrt{\\dfrac{${sommeCarresA}}{${serieA.length}}} = \\sqrt{${texNombre(varianceA, 2)}}$<br>
      $\\sigma_F = \\sqrt{\\dfrac{${termesB}}{${serieB.length}}} = \\sqrt{\\dfrac{${sommeCarresB}}{${serieB.length}}} = \\sqrt{${texNombre(varianceB, 2)}}$<br>
      On a donc $\\sigma_F > \\sigma_E$.<br>
      ${texteEnCouleurEtGras("L'écart-type de la série F est strictement supérieur à celui de la série E")}.`
    }

    // Réorganiser les réponses pour mettre la bonne en premier
    const autres = toutesLesReponses.filter((r) => r !== bonnePhrase)
    this.reponses = [bonnePhrase, ...autres]

    // Construire l'énoncé
    this.enonce = `On considère les deux séries suivantes :  <br>
${texteGras('Série E :')} $${serieA.join(' ; ')} $ <br>
${texteGras('Série F :')} $${serieB.join(' ; ')} $ <br>

Laquelle des quatre propositions suivantes est vraie ?`

    // Définir la bonne réponse
    this.reponse = bonnePhrase

    // Correction : explication simple, claire
    this.correction = explication
  }

  versionOriginale: () => void = () => {
    // Données fixes de la version originale
    const serieA = [10, 11, 10, 9]
    const serieB = [7, 13, 10, 10]
    this.appliquerLesValeurs(serieA, serieB)
  }

  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      this.appliquerLesValeurs()
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.options.vertical = true
    this.spacing = 1.5
    this.versionAleatoire()
  }
}
