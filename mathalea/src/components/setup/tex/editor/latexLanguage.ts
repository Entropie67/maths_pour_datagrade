import { StreamLanguage } from '@codemirror/language'
import { stex } from '@codemirror/legacy-modes/mode/stex'

/**
 * Coloration syntaxique LaTeX de l'éditeur de la vue « LaTeX ».
 *
 * Contrairement à Typst (dont le mode est écrit à la main dans
 * `typst/editor/typstLanguage.ts`), CodeMirror fournit déjà un mode `stex`
 * satisfaisant : on se contente de l'emballer.
 *
 * `languageData` fournit le jeton de commentaire, ce qui active
 * « commenter / décommenter » (Ctrl/Cmd + /) comme dans la vue Typst.
 */
export const latexLanguage = StreamLanguage.define({
  ...stex,
  languageData: {
    ...(stex.languageData ?? {}),
    commentTokens: { line: '%' },
  },
})
