import type { QcmJsonData } from '../beta/QcmJsonGenerator'
import QcmJsonGenerator from '../beta/QcmJsonGenerator'

// Exemple d'utilisation du générateur QCM JSON
// Données JSON pour un QCM de mathématiques
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
        'Correct ! $\\pi \\approx 3,14159...$',
        'Erreur : vous avez inversé les chiffres',
        "Erreur : c'est l'approximation de $e$",
        "Erreur : c'est l'approximation de $\\sqrt{2}$",
      ],
    },
  ],
}

// Export de la classe d'exercice configurée
export const uuid = 'exemple-qcm-json'
export const titre = 'Exemple QCM JSON'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

// Création de l'exercice
export default class ExempleQcmJson extends QcmJsonGenerator {
  constructor() {
    super(qcmData)

    // Configuration spécifique
    // Permettre l'aléatoirisation des questions
    this.versionAleatoire = () => {
      // Choisir une question aléatoire
      const questionIndex = Math.floor(Math.random() * qcmData.questions.length)
      const question = qcmData.questions[questionIndex]

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
