export const optionsKatex = {
  delimiters: [
    { left: '\\[', right: '\\]', display: true },
    { left: '$', right: '$', display: false },
  ],
  macros: {
    ':': '{\\char`:}',
    ',': '{\\char`,}',
    '·': '{\\char`·}',
  },
  fleqn: true,
  throwOnError: true,
  errorColor: '#CC0000',
  strict: 'warn',
  trust: false,
  // `math-field` garde son contenu initial (LaTeX brut, avec ses éventuels `$`)
  // dans son DOM léger même une fois la saisie de l'élève en cours : si l'auto-render
  // KaTeX vient y toucher (ex : au second rendu déclenché par la vérification), MathLive
  // resynchronise le champ depuis ce contenu resté figé et efface la réponse déjà saisie.
  ignoredTags: [
    'script',
    'noscript',
    'style',
    'textarea',
    'pre',
    'code',
    'option',
    'math-field',
  ],
  // Les zones d'interface gérées par Svelte (ex : bouton « Vérifier » et score
  // d'une question) portent cette classe : l'auto-render remplacerait sinon les
  // nœuds texte vides qui servent d'ancres aux blocs `{#if}` et détruirait leur contenu.
  ignoredClasses: ['katex-ignore'],
}
