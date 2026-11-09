import QcmJsonGenerator from './QcmJsonGenerator'
import type { QcmJsonData } from './QcmJsonGenerator'

/**
 * Fonction utilitaire pour créer un exercice QCM à partir d'un fichier JSON
 * @param jsonData - Les données JSON contenant les questions
 * @returns Une classe d'exercice QCM prête à être utilisée
 */
export function createQcmFromJson(
  jsonData: QcmJsonData,
): typeof QcmJsonGenerator {
  // Valider les données JSON
  if (!QcmJsonGenerator.validateJsonData(jsonData)) {
    throw new Error('Les données JSON ne sont pas valides pour créer un QCM')
  }

  // Créer une classe d'exercice personnalisée
  class QcmPersonnalise extends QcmJsonGenerator {
    constructor() {
      super(jsonData)

      // Configuration par défaut
      // Activer l'aléatoirisation si plusieurs questions
      if (jsonData.questions.length > 1) {
        this.versionAleatoire = () => {
          // Choisir une question aléatoire
          const questionIndex = Math.floor(
            Math.random() * jsonData.questions.length,
          )
          const question = jsonData.questions[questionIndex]

          this.enonce = question.enonce
          this.reponses = [...question.reponses]

          if (question.corrections) {
            this.corrections = [...question.corrections]
          }

          if (question.bonnesReponses) {
            this.bonnesReponses = [...question.bonnesReponses]
          }
        }
      }
    }
  }

  return QcmPersonnalise
}

/**
 * Fonction pour charger et valider un fichier JSON de QCM
 * @param jsonContent - Le contenu JSON sous forme de chaîne
 * @returns Les données validées
 */
export function parseQcmJson(jsonContent: string): QcmJsonData {
  try {
    const data = JSON.parse(jsonContent)

    if (!QcmJsonGenerator.validateJsonData(data)) {
      throw new Error('Format JSON invalide pour un QCM')
    }

    return data
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('JSON malformé : ' + error.message)
    }
    throw error
  }
}

/**
 * Fonction pour créer un QCM simple avec une seule question
 * @param enonce - L'énoncé de la question
 * @param reponses - Les réponses (la première étant la bonne)
 * @param corrections - Les corrections optionnelles
 * @param titre - Le titre de l'exercice
 * @returns Une classe d'exercice QCM
 */
export function createSimpleQcm(
  enonce: string,
  reponses: string[],
  corrections?: string[],
  titre: string = 'QCM',
): typeof QcmJsonGenerator {
  const qcmData: QcmJsonData = {
    titre,
    questions: [
      {
        enonce,
        reponses,
        corrections,
      },
    ],
  }

  return createQcmFromJson(qcmData)
}

/**
 * Fonction pour créer un QCM à réponses multiples
 * @param enonce - L'énoncé de la question
 * @param reponses - Les réponses
 * @param bonnesReponses - Tableau de booléens indiquant les bonnes réponses
 * @param corrections - Les corrections optionnelles
 * @param titre - Le titre de l'exercice
 * @returns Une classe d'exercice QCM
 */
export function createMultipleChoiceQcm(
  enonce: string,
  reponses: string[],
  bonnesReponses: boolean[],
  corrections?: string[],
  titre: string = 'QCM à réponses multiples',
): typeof QcmJsonGenerator {
  const qcmData: QcmJsonData = {
    titre,
    questions: [
      {
        enonce,
        reponses,
        bonnesReponses,
        corrections,
      },
    ],
  }

  return createQcmFromJson(qcmData)
}
