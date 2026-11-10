import { EditorState } from '@codemirror/state'

/**
 * Traductions françaises de l'interface de CodeMirror (panneau de recherche
 * ouvert par Ctrl/Cmd + F, boîte « Aller à la ligne » de Alt + G, messages
 * lus par les lecteurs d'écran).
 *
 * Les clés sont les chaînes anglaises passées à `state.phrase()` par
 * `@codemirror/search`, `@codemirror/view`, `@codemirror/language` et
 * `@codemirror/commands` ; `$` y est un emplacement d'argument.
 */
export const frenchPhrases = EditorState.phrases.of({
  // Panneau de recherche
  Find: 'Rechercher',
  Replace: 'Remplacer',
  next: 'Suivant',
  previous: 'Précédent',
  all: 'Tout sélectionner',
  'match case': 'Respecter la casse',
  regexp: 'Expression régulière',
  'by word': 'Mot entier',
  replace: 'Remplacer',
  'replace all': 'Tout remplacer',
  close: 'Fermer',
  'current match': 'Occurrence courante',
  'on line': 'à la ligne',
  'replaced $ matches': '$ occurrences remplacées',
  'replaced match on line $': 'occurrence remplacée à la ligne $',
  // Aller à la ligne
  'Go to line': 'Aller à la ligne',
  go: 'Aller',
  // Divers
  'Selection deleted': 'Sélection supprimée',
  'folded code': 'code replié',
  unfold: 'déplier',
  to: 'à',
  'Control character': 'Caractère de contrôle',
})
