import {
  StreamLanguage,
  type StreamParser,
  type StringStream,
} from '@codemirror/language'

/**
 * Coloration syntaxique Typst pour CodeMirror.
 *
 * Ce n'est pas un analyseur complet du langage (il n'en existe pas pour
 * CodeMirror) mais un tokeniseur ligne à ligne suffisant pour lire le code
 * généré par MathALÉA : commentaires, mode balisage (titres, listes, gras,
 * italique, littéral), mode code (après `#`), mode mathématique (`$…$`).
 *
 * Il fournit aussi les jetons de commentaire, ce qui active le raccourci
 * « commenter / décommenter » (Ctrl/Cmd + /) de CodeMirror.
 */

/** Contexte syntaxique courant, empilé au fil des délimiteurs */
type ContextKind =
  /** Texte ordinaire (mode balisage Typst) */
  | 'markup'
  /** Bloc de code `{ … }` ou groupe `( … )` */
  | 'code'
  /** Expression introduite par `#` : se referme d'elle-même */
  | 'expr'
  /** Instruction introduite par `#` (`#let`, `#show`…) : court jusqu'au bout de la ligne */
  | 'statement'
  /** Formule `$ … $` */
  | 'math'

interface Context {
  kind: ContextKind
  /**
   * Pour `expr` : vrai quand l'identifiant a été lu et que l'expression peut
   * se terminer si le caractère suivant ne la prolonge pas (`(`, `[`, `.`).
   */
  complete?: boolean
}

interface TypstState {
  stack: Context[]
  /** Profondeur des commentaires de bloc `/* … *\/` (imbricables en Typst) */
  blockComment: number
}

/** Mots-clés introduisant une instruction qui court jusqu'à la fin de la ligne */
const STATEMENT_KEYWORDS = new Set([
  'let',
  'set',
  'show',
  'import',
  'include',
  'if',
  'else',
  'for',
  'while',
  'return',
  'context',
])

/** Mots-clés du mode code */
const KEYWORDS = new Set([
  ...STATEMENT_KEYWORDS,
  'in',
  'as',
  'and',
  'or',
  'not',
  'break',
  'continue',
])

/** Littéraux du mode code */
const ATOMS = new Set(['true', 'false', 'none', 'auto'])

const IDENTIFIER = /^[\p{L}_][\p{L}\p{N}_-]*/u
/** Nombre avec unité optionnelle (`12pt`, `1.5em`, `50%`, `2fr`, `30deg`) */
const NUMBER = /^\d+(?:\.\d+)?(?:pt|mm|cm|in|em|fr|deg|rad|%)?\b/

function top(state: TypstState): Context {
  return state.stack[state.stack.length - 1] ?? { kind: 'markup' }
}

/** Referme les expressions `#…` terminées, une fois leur suite écartée */
function closeCompletedExpressions(stream: StringStream, state: TypstState) {
  // en fin de ligne (`peek()` vaut undefined) rien ne prolonge l'expression
  const next = stream.peek() ?? '\n'
  let current = top(state)
  while (
    current.kind === 'expr' &&
    current.complete === true &&
    next !== '(' &&
    next !== '[' &&
    next !== '.'
  ) {
    state.stack.pop()
    current = top(state)
  }
}

const parser: StreamParser<TypstState> = {
  name: 'typst',

  startState: () => ({
    stack: [{ kind: 'markup' as ContextKind }],
    blockComment: 0,
  }),

  copyState: (state) => ({
    stack: state.stack.map((context) => ({ ...context })),
    blockComment: state.blockComment,
  }),

  blankLine(state) {
    // une instruction `#let …` ne franchit pas une ligne vide
    while (top(state).kind === 'statement' || top(state).kind === 'expr') {
      state.stack.pop()
    }
  },

  token(stream, state) {
    // Les instructions `#…` s'arrêtent au retour à la ligne
    if (stream.sol()) {
      while (top(state).kind === 'statement') state.stack.pop()
      closeCompletedExpressions(stream, state)
    }

    // --- Commentaires (valables dans tous les modes) ---
    if (state.blockComment > 0) {
      while (!stream.eol()) {
        if (stream.match('*/')) {
          state.blockComment -= 1
          if (state.blockComment === 0) break
        } else if (stream.match('/*')) {
          state.blockComment += 1
        } else {
          stream.next()
        }
      }
      return 'comment'
    }
    if (stream.match('/*')) {
      state.blockComment = 1
      return 'comment'
    }
    if (stream.match('//')) {
      stream.skipToEnd()
      return 'comment'
    }

    if (stream.eatSpace()) {
      closeCompletedExpressions(stream, state)
      return null
    }

    const context = top(state)

    // --- Mode mathématique ---
    if (context.kind === 'math') {
      if (stream.eat('$') != null) {
        state.stack.pop()
        return 'keyword'
      }
      if (stream.match('"')) {
        stream.match(/^[^"]*"?/)
        return 'string'
      }
      if (stream.eat('#') != null) return pushHash(stream, state)
      if (stream.match(NUMBER)) return 'number'
      if (stream.match(/^[+\-*\/^_=<>&|]+/)) return 'operator'
      if (stream.match(/^\\[a-zA-Z]+|^\\./)) return 'escape'
      stream.next()
      return null
    }

    // --- Mode code (`#…`, blocs `{ }`, groupes `( )`) ---
    if (context.kind !== 'markup') {
      if (stream.match('"')) {
        stream.match(/^(?:\\.|[^"\\])*"?/)
        return 'string'
      }
      if (stream.eat('$') != null) {
        state.stack.push({ kind: 'math' })
        return 'keyword'
      }
      const open = stream.eat(/[([{]/)
      if (open != null) {
        state.stack.push({ kind: open === '[' ? 'markup' : 'code' })
        return 'bracket'
      }
      if (stream.eat(/[)\]}]/) != null) {
        // referme le groupe, puis l'expression `#…` qu'il terminait
        if (state.stack.length > 1) state.stack.pop()
        const parent = top(state)
        if (parent.kind === 'expr') parent.complete = true
        return 'bracket'
      }
      if (stream.match(NUMBER)) return 'number'
      const identifier = stream.match(IDENTIFIER) as RegExpMatchArray | null
      if (identifier != null) {
        const name = identifier[0]
        if (KEYWORDS.has(name)) return 'keyword'
        if (ATOMS.has(name)) return 'atom'
        if (stream.peek() === '(') return 'variableName.function'
        if (context.kind === 'expr') context.complete = true
        return 'variableName'
      }
      if (stream.match(/^[=<>!+\-*\/%.,:;]+/)) return 'operator'
      stream.next()
      return null
    }

    // --- Mode balisage ---
    if (stream.sol()) {
      // titres de section : `= Titre`, `== Sous-titre`…
      if (stream.match(/^=+\s/)) {
        stream.skipToEnd()
        return 'heading'
      }
      // marqueurs de liste (à puces, numérotée, de description)
      if (
        stream.match(/^[-+]\s/) ||
        stream.match(/^\/\s/) ||
        stream.match(/^\d+\.\s/)
      ) {
        return 'keyword'
      }
    }
    if (stream.eat('#') != null) return pushHash(stream, state)
    if (stream.eat('$') != null) {
      state.stack.push({ kind: 'math' })
      return 'keyword'
    }
    if (stream.match(/^```[\s\S]*?```/) || stream.match(/^`[^`\n]*`/))
      return 'string'
    if (stream.match(/^\*[^*\n]+\*/)) return 'strong'
    if (stream.match(/^_[^_\n]+_/)) return 'emphasis'
    if (stream.match(/^<[\p{L}_][\p{L}\p{N}_-]*>/u)) return 'labelName'
    if (stream.match(/^@[\p{L}_][\p{L}\p{N}_-]*/u)) return 'link'
    if (stream.match(/^\\(?:u\{[0-9a-fA-F]+\}|.)/)) return 'escape'
    if (stream.eat(/[[{]/) != null) {
      state.stack.push({ kind: 'markup' })
      return 'bracket'
    }
    if (stream.eat(/[\]}]/) != null) {
      if (state.stack.length > 1) state.stack.pop()
      const parent = top(state)
      if (parent.kind === 'expr') parent.complete = true
      return 'bracket'
    }
    // texte ordinaire : on avance jusqu'au prochain caractère significatif
    stream.next()
    stream.eatWhile(/[^#$`*_<@\\[\]{}/\s]/)
    return null
  },

  languageData: {
    commentTokens: { line: '//', block: { open: '/*', close: '*/' } },
    indentOnInput: /^\s*[}\])]$/,
    wordChars: '-',
  },
}

/**
 * Traite un `#` : mot-clé d'instruction (jusqu'au bout de la ligne),
 * appel de fonction ou simple variable.
 */
function pushHash(stream: StringStream, state: TypstState): string {
  const identifier = stream.match(IDENTIFIER) as RegExpMatchArray | null
  if (identifier == null) {
    // `#(`, `#{`, `#[` : bloc de code ou de contenu anonyme
    state.stack.push({ kind: 'expr' })
    return 'keyword'
  }
  const name = identifier[0]
  if (STATEMENT_KEYWORDS.has(name)) {
    state.stack.push({ kind: 'statement' })
    return 'keyword'
  }
  if (ATOMS.has(name)) return 'atom'
  state.stack.push({ kind: 'expr', complete: stream.peek() !== '(' })
  return stream.peek() === '(' ? 'variableName.function' : 'variableName'
}

/** Extension CodeMirror : coloration et commentaires Typst */
export const typstLanguage = StreamLanguage.define(parser)
