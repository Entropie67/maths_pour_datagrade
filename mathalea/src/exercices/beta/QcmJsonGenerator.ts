import { choice } from '../../lib/outils/arrayOutils'
import ExerciceQcm from '../ExerciceQcm'

// Type pour définir la structure d'une question QCM dans le JSON
export interface QuestionQcm {
  enonce: string
  reponses: string[]
  corrections?: string[]
  bonnesReponses?: boolean[]
}

// Type pour la structure complète du JSON
export interface QcmJsonData {
  titre: string
  consigne?: string
  questions: QuestionQcm[]
  options?: {
    vertical?: boolean
    ordered?: boolean
    lastChoice?: number
  }
}
const qcmData: QcmJsonData = {
  titre: 'QCM Mathématiques - Exemple',
  consigne: 'Choisissez la bonne réponse.',
  options: {
    vertical: false,
    ordered: false,
    lastChoice: 8,
  },
  questions: [
    {
      enonce: 'Combien font $2 + 2$ ?',
      reponses: [
        '$4$', // Bonne réponse (toujours en premier)
        '$3$',
        '$5$',
        '$22$',
      ],
      corrections: [
        'Correct ! $2 + 2 = 4$',
        'Erreur : vérifiez votre calcul',
        'Erreur : $2 + 2 \\neq 5$',
        "Erreur : ce n'est pas une concaténation",
      ],
    },
    {
      enonce: 'Quelle est la racine carrée de $16$ ?',
      reponses: [
        '$4$', // Bonne réponse
        '$8$',
        '$2$',
        '$6$',
      ],
      corrections: [
        'Correct ! $\\sqrt{16} = 4$ car $4^2 = 16$',
        'Erreur : $8^2 = 64$',
        'Erreur : $2^2 = 4$',
        'Erreur : $6^2 = 36$',
      ],
    },
    {
      enonce: 'Quelle est la valeur de $\\pi$ (approximation) ?',
      reponses: [
        '$3,14$', // Bonne réponse
        '$3,41$',
        '$2,71$',
        '$1,41$',
      ],
      corrections: [
        'Correct ! $\\pi \\approx 3,14159\\ldots$',
        'Erreur : vous avez inversé les chiffres',
        "Erreur : c'est l'approximation de $e$",
        "Erreur : c'est l'approximation de $\\sqrt{2}$",
      ],
    },
  ],
}
export const titre = 'Générer des exercices de type QCM à partir de JSON'
export const dateDePublication = '3/7/2025'
export const amcReady = 'true'
export const amcType = 'qcmMono'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const uuid = 'QcmGen'
/**
 * Générateur d'exercices QCM basé sur des données JSON
 * Cette classe permet de créer des exercices QCM à partir d'un fichier JSON
 * contenant une liste de questions avec leurs réponses et corrections
 */
export default class QcmJsonGenerator extends ExerciceQcm {
  private jsonData: QcmJsonData
  private questionsDisponibles: QuestionQcm[]

  constructor(jsonData: QcmJsonData) {
    super()
    this.jsonData = jsonData ?? qcmData // Utiliser les données par défaut si aucune donnée n'est fournie
    this.questionsDisponibles = [...this.jsonData.questions]

    // Configuration des options si fournies dans le JSON
    if (this.jsonData.options) {
      this.options = { ...this.options, ...this.jsonData.options }
    }

    // Permettre plusieurs questions si le JSON en contient plusieurs
    this.nbQuestions = Math.min(this.jsonData.questions.length, 10) // Limiter à 10 questions max
    this.nbQuestionsModifiable = this.jsonData.questions.length > 1

    // Titre de l'exercice
    if (this.jsonData.titre) {
      this.titre = this.jsonData.titre
    }

    // Consigne personnalisée si fournie
    if (this.jsonData.consigne) {
      this.consigne = this.jsonData.consigne
    }
  }

  /**
   * Version originale qui prend la première question du JSON
   */
  versionOriginale = () => {
    if (this.questionsDisponibles.length === 0) {
      throw new Error('Aucune question disponible dans les données JSON')
    }

    const question = this.questionsDisponibles[0]
    this.enonce = question.enonce
    this.reponses = [...question.reponses]

    // Gérer les corrections si présentes
    if (question.corrections) {
      this.corrections = [...question.corrections]
    }

    // Gérer les bonnes réponses si présentes (pour QCM à réponses multiples)
    if (question.bonnesReponses) {
      this.bonnesReponses = [...question.bonnesReponses]
    }

    // Correction par défaut si pas de corrections spécifiques
    if (!this.corrections || this.corrections.length === 0) {
      this.correction = 'La bonne réponse est la première de la liste.'
    }
  }

  /**
   * Version aléatoire qui choisit une question au hasard
   */
  versionAleatoire = () => {
    if (this.questionsDisponibles.length === 0) {
      throw new Error('Aucune question disponible dans les données JSON')
    }

    const question = choice(this.questionsDisponibles)
    this.enonce = question.enonce
    this.reponses = [...question.reponses]

    // Gérer les corrections si présentes
    if (question.corrections) {
      this.corrections = [...question.corrections]
    }

    // Gérer les bonnes réponses si présentes (pour QCM à réponses multiples)
    if (question.bonnesReponses) {
      this.bonnesReponses = [...question.bonnesReponses]
    }

    // Correction par défaut si pas de corrections spécifiques
    if (!this.corrections || this.corrections.length === 0) {
      this.correction = 'La bonne réponse est la première de la liste.'
    }
  }

  /**
   * Méthode pour charger des données JSON depuis un objet
   * @param jsonData - Les données JSON à charger
   */
  static fromJson(jsonData: QcmJsonData): QcmJsonGenerator {
    return new QcmJsonGenerator(jsonData)
  }

  /**
   * Méthode pour valider la structure des données JSON
   * @param data - Les données à valider
   * @returns true si les données sont valides
   */
  static validateJsonData(data: unknown): data is QcmJsonData {
    if (!data || typeof data !== 'object') return false
    if (!('titre' in data) || !data.titre || typeof data.titre !== 'string')
      return false
    if (
      !('questions' in data) ||
      !Array.isArray(data.questions) ||
      data.questions.length === 0
    )
      return false
    if (
      'consigne' in data &&
      data.consigne !== undefined &&
      typeof data.consigne !== 'string'
    )
      return false
    if ('options' in data && data.options !== undefined) {
      const options = data.options
      if (!options || typeof options !== 'object') return false
      if (
        'vertical' in options &&
        options.vertical !== undefined &&
        typeof options.vertical !== 'boolean'
      )
        return false
      if (
        'ordered' in options &&
        options.ordered !== undefined &&
        typeof options.ordered !== 'boolean'
      )
        return false
      if (
        'lastChoice' in options &&
        options.lastChoice !== undefined &&
        typeof options.lastChoice !== 'number'
      )
        return false
    }

    // Vérifier chaque question
    const questions: unknown[] = data.questions
    for (const question of questions) {
      if (!question || typeof question !== 'object') return false
      if (
        !('enonce' in question) ||
        !question.enonce ||
        typeof question.enonce !== 'string'
      )
        return false
      if (
        !('reponses' in question) ||
        !Array.isArray(question.reponses) ||
        question.reponses.length < 2
      )
        return false

      // Vérifier que toutes les réponses sont des strings
      for (const reponse of question.reponses) {
        if (typeof reponse !== 'string') return false
      }

      // Vérifier les corrections si présentes
      if ('corrections' in question && question.corrections !== undefined) {
        if (!Array.isArray(question.corrections)) return false
        for (const correction of question.corrections) {
          if (typeof correction !== 'string') return false
        }
      }

      // Vérifier les bonnes réponses si présentes
      if (
        'bonnesReponses' in question &&
        question.bonnesReponses !== undefined
      ) {
        if (!Array.isArray(question.bonnesReponses)) return false
        if (question.bonnesReponses.length !== question.reponses.length)
          return false
        for (const statut of question.bonnesReponses) {
          if (typeof statut !== 'boolean') return false
        }
      }
    }

    return true
  }

  /**
   * Méthode pour obtenir une question aléatoire différente des précédentes
   * @param questionsDejaUtilisees - Liste des questions déjà utilisées
   * @returns Une nouvelle question ou null si toutes ont été utilisées
   */
  private getQuestionAleatoire(
    questionsDejaUtilisees: QuestionQcm[],
  ): QuestionQcm | null {
    const questionsRestantes = this.questionsDisponibles.filter(
      (q) => !questionsDejaUtilisees.includes(q),
    )

    if (questionsRestantes.length === 0) {
      return null
    }

    return choice(questionsRestantes)
  }

  /**
   * Redéfinition pour gérer les questions multiples de façon aléatoire
   */
  nouvelleVersion() {
    // Utiliser la version originale par défaut
    this.versionOriginale()
    super.nouvelleVersion()
  }
}
