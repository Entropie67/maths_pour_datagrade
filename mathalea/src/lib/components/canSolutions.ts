/**
 * Affichage des réponses élèves dans la vue des corrections de la CAN
 * (`src/components/display/can/presentationalComponents/Solutions.svelte`).
 *
 * Deux opérations sont nécessaires pour chaque question :
 * - `formatStudentAnswer` : formater la réponse brute de l'élève (telle que
 *   stockée dans `exercice.answers`) pour la ligne « Réponse donnée : ... » ;
 * - `stripInteractiveWidgets` : nettoyer le HTML de la question pour la liste
 *   des corrections (retirer ou remplacer les éléments interactifs).
 *
 * Les customElements (interactive-clock, multi-mathfield, liste-deroulante...)
 * sont traités de façon générique : chaque classe qui étend
 * `MathaleaCustomElement` et est enregistrée via
 * `registerMathaleaCustomElement` peut surcharger les hooks statiques
 * `formatStudentAnswer` et `stripFromQuestionHtml`. Pour brancher un nouveau
 * customElement ici, il n'y a donc rien à modifier dans ce fichier :
 * voir `documentation/developpement/maintenance-moteur/interactivite/custom-elements.md`.
 *
 * Les autres types d'interactivité (QCM, champ texte, mathfield...) n'ont pas
 * de classe dédiée : ils sont détectés par des marqueurs dans le HTML de la
 * question (id ou attribut caractéristique) dans les cascades ci-dessous.
 */

import type MathaleaCustomElement from '../customElements/MathaleaCustomElement'
import { mathaleaCustomElementsRegistry } from '../customElements/MathaleaCustomElement'
/**
 * Retourne la classe du customElement utilisé par la question, ou `null`.
 *
 * La détection se fait par la présence du tag dans le HTML de la question
 * (les ids sont de la forme `interactive-clockEx0Q1`, donc contiennent le tag).
 * Quand un customElement en contient un autre (`possible-multi-lines-answer`
 * contient un `mathalea-mathfield`), c'est le plus extérieur, donc celui qui
 * apparaît en premier dans le HTML, qui gère la question.
 */
function customElementClassForQuestion(questionHtml: string) {
  let found: typeof MathaleaCustomElement | null = null
  let foundIndex = Infinity
  for (const [tag, elementClass] of mathaleaCustomElementsRegistry) {
    const index = questionHtml.indexOf(tag)
    if (index !== -1 && index < foundIndex) {
      found = elementClass
      foundIndex = index
    }
  }
  return found
}

/**
 * Formate la réponse brute de l'élève pour l'affichage « Réponse donnée : ... ».
 * @param questionHtml HTML de la question (sert à détecter le type d'interactivité)
 * @param rawAnswer réponse telle que stockée dans `exercice.answers`
 */
export function formatStudentAnswer(
  questionHtml: string,
  rawAnswer: string,
): string {
  if (!rawAnswer) return 'aucune'
  // QCM : la réponse est le texte des propositions cochées (déjà lisible),
  // sauf si c'est du LaTeX sans dollars qu'il faut alors entourer.
  if (
    questionHtml.includes('checkbox') ||
    (questionHtml.includes('<input') && questionHtml.includes('checkEx'))
  ) {
    return rawAnswer.includes('\\') && !rawAnswer.includes('$')
      ? '$' + rawAnswer + '$'
      : rawAnswer
  }
  // customElements : chaque classe sait formater sa propre valeur.
  const elementClass = customElementClassForQuestion(questionHtml)
  if (elementClass)
    return elementClass.formatStudentAnswer(rawAnswer, questionHtml)
  // Champ texte : la réponse est une chaîne libre déjà lisible.
  if (
    questionHtml.includes('<input') &&
    questionHtml.includes('champTexteEx')
  ) {
    return rawAnswer
  }
  // Figures apigeom : la réponse a déjà été remplacée par « Voir figure ».
  if (questionHtml.includes('apigeomEx')) return rawAnswer
  // Drag and drop : la réponse est le texte déposé, déjà lisible.
  if (questionHtml.includes('divDragAndDropEx')) return rawAnswer
  // Par défaut (mathfield, fillInTheBlanks...) : réponse LaTeX à entourer de dollars.
  return '$' + cleanFillInTheBlanks(rawAnswer) + '$'
}

/**
 * Réunit les réponses d'une question à plusieurs champs pour la ligne
 * « Réponse donnée : ... », un champ laissé vide restant visible. Sans aucune
 * réponse, le résultat reste vide pour que `formatStudentAnswer` affiche « aucune ».
 */
export function joinStudentAnswers(fieldAnswers: string[]): string {
  if (!fieldAnswers.some((answer) => answer)) return ''
  return fieldAnswers.map((answer) => answer || '…').join(' ; ')
}

/**
 * Nettoie le HTML d'une question pour l'affichage dans la liste des
 * corrections : les éléments interactifs sont retirés ou remplacés par des
 * pointillés.
 */
export function stripInteractiveWidgets(questionHtml: string): string {
  if (typeof questionHtml !== 'string') return ''
  // fillInTheBlanks : on garde le mathfield (il affiche les trous), on ne
  // retire que les commandes \placeholder. Surtout ne pas appliquer le
  // remplacement générique des <math-field> par « ... » ci-dessous.
  if (questionHtml.includes('placeholder')) {
    return cleanFillInTheBlanks(questionHtml)
  }
  let cleaned = questionHtml
  // customElements : chaque classe décide si elle reste affichée ou non.
  for (const [tag, elementClass] of mathaleaCustomElementsRegistry) {
    if (cleaned.includes(tag)) {
      cleaned = elementClass.stripFromQuestionHtml(cleaned)
    }
  }
  // Listes déroulantes historiques injectées en HTML brut.
  cleaned = cleaned.replace(/<select[^>]*>[^]*?<\/select>/g, '')
  // Mathfields : remplacés par des pointillés.
  cleaned = cleaned.replace(/<math-field[^>]*>[^]*?<\/math-field>/g, ' ... ')
  return cleaned
}

/**
 * Retire les commandes `\placeholder[...]` d'une saisie fillInTheBlanks et
 * matérialise les trous restés vides par `{...}`.
 */
export function cleanFillInTheBlanks(text: string): string {
  if (typeof text !== 'string') return ''
  return text
    .replace(/\\placeholder(\[[^\]]*\])+/g, '')
    .replace(/\{\}/g, '{...}')
}
