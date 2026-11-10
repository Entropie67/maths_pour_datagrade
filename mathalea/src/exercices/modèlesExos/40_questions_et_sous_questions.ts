import { createQuestion } from '../../lib/interactif/createQuestion'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer des produits, des périmètres et des aires'
export const interactifReady = true
export const interactifType = 'mathLive'

export const dateDePublication = '12/10/2026'

export const uuid = 'cc0fd'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice mêlant des questions simples et des questions découpées
 * en sous-questions a), b), c) avec `createQuestion()`.
 * @see documentation/developpement/auteurs-exercices/complements/sous-questions.md
 * @author Rémi Angot
 */
export default class QuestionsEtSousQuestions extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    const listeTypeQuestions = combinaisonListes(
      ['simple', 'sousQuestions'],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const a = randint(3, 9)
      const b = randint(3, 9, a)
      if (!this.questionJamaisPosee(i, listeTypeQuestions[i], a, b)) continue
      if (listeTypeQuestions[i] === 'simple') {
        // Une question, une réponse.
        createQuestion(this, i, {
          question: `Calculer $${a}\\times ${b}$.`,
          correction: `$${a}\\times ${b}=${miseEnEvidence(a * b)}$`,
          answer: { value: a * b },
        })
      } else {
        // Une consigne commune puis des sous-questions, chacune avec son champ
        // et sa correction. La sous-question c) n'attend pas de réponse.
        // Le type de la question i dépend du tirage : comme la question
        // simple, elle doit valoir 1 point pour que la note maximale de
        // l'exercice ne change jamais (enregistreurs Capytale, Moodle…).
        const longueur = Math.max(a, b)
        const largeur = Math.min(a, b)
        createQuestion(this, i, {
          question: `Un rectangle a pour longueur $${longueur}\\text{ cm}$ et pour largeur $${largeur}\\text{ cm}$.`,
          bareme: toutPourUnPoint,
          subQuestions: [
            {
              question: 'Calculer son périmètre.',
              answer: { value: 2 * (longueur + largeur) },
              field: { texteApres: 'cm' },
              correction: `$2\\times(${longueur}+${largeur})=${2 * (longueur + largeur)}$, donc le périmètre est $${miseEnEvidence(2 * (longueur + largeur))}\\text{ cm}$.`,
            },
            {
              question: 'Calculer son aire.',
              answer: { value: longueur * largeur },
              field: { texteApres: 'cm²' },
              correction: `$${longueur}\\times ${largeur}=${longueur * largeur}$, donc l'aire est $${miseEnEvidence(longueur * largeur)}\\text{ cm}^2$.`,
            },
            {
              question: 'Ce rectangle est-il un carré ? Justifier.',
              correction: `Non, car sa longueur et sa largeur sont différentes : $${longueur}\\neq ${largeur}$.`,
            },
          ],
        })
      }
      i++
    }
    listeQuestionsToContenu(this)
  }
}
