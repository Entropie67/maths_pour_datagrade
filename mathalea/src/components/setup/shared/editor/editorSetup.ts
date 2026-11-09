import {
  addCursorAbove,
  addCursorBelow,
  copyLineDown,
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  selectLine,
} from '@codemirror/commands'
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  foldService,
  foldedRanges,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
  unfoldEffect,
} from '@codemirror/language'
import {
  highlightSelectionMatches,
  search,
  searchKeymap,
} from '@codemirror/search'
import {
  Compartment,
  EditorState,
  Prec,
  RangeSetBuilder,
  StateEffect,
  StateField,
  type Extension,
} from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  Decoration,
  type DecorationSet,
  EditorView,
  GutterMarker,
  crosshairCursor,
  drawSelection,
  dropCursor,
  gutter,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
  tooltips,
} from '@codemirror/view'
import { frenchPhrases } from './editorPhrases'

/**
 * Configuration de l'éditeur de code des vues qui exposent le source d'une
 * fiche (Typst, LaTeX) : numéros de lignes, raccourcis usuels, thèmes clair
 * et sombre, et signalement des erreurs de compilation dans la marge et sous
 * le code.
 *
 * Le langage (coloration syntaxique) est le seul élément propre à chaque vue :
 * il est passé en option. Le reste est commun, pour que chaque vue n'ait à
 * connaître que `codeEditorExtensions()` et `setEditorMarkers()`.
 */

/** Erreur ou avertissement à signaler dans l'éditeur (lignes 1-based) */
export interface EditorMarker {
  line: number
  column?: number
  endLine?: number
  endColumn?: number
  severity: 'error' | 'warning'
  /** Texte affiché dans l'infobulle au survol */
  message: string
}

/** Remplace la liste des erreurs signalées dans l'éditeur */
const setMarkers = StateEffect.define<EditorMarker[]>()

/** Convertit une position ligne/colonne (1-based) en décalage dans le document */
function offsetAt(state: EditorState, line: number, column = 1): number {
  const clamped = Math.min(Math.max(line, 1), state.doc.lines)
  const target = state.doc.line(clamped)
  return Math.min(target.from + Math.max(column - 1, 0), target.to)
}

const errorLine = Decoration.line({ class: 'cm-mathalea-errorLine' })
const warningLine = Decoration.line({ class: 'cm-mathalea-warningLine' })

function buildDecorations(
  state: EditorState,
  markers: EditorMarker[],
): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  // les décorations doivent être ajoutées dans l'ordre du document
  const sorted = [...markers].sort((a, b) => a.line - b.line)
  const seenLines = new Set<number>()
  for (const marker of sorted) {
    if (marker.line < 1 || marker.line > state.doc.lines) continue
    if (seenLines.has(marker.line)) continue
    seenLines.add(marker.line)
    builder.add(
      state.doc.line(marker.line).from,
      state.doc.line(marker.line).from,
      marker.severity === 'error' ? errorLine : warningLine,
    )
  }
  return builder.finish()
}

/** Ligne du document portant une erreur, pour la pastille de marge */
const markersField = StateField.define<EditorMarker[]>({
  create: () => [],
  update(markers, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setMarkers)) return effect.value
    }
    // pendant la frappe, les positions se décalent : on suit les lignes
    // plutôt que de tout effacer (la compilation suivante les remplacera)
    if (transaction.docChanged) {
      const before = transaction.startState.doc
      const after = transaction.newDoc
      return markers
        .map((marker) => {
          if (marker.line < 1 || marker.line > before.lines) return null
          const mapped = transaction.changes.mapPos(
            before.line(marker.line).from,
          )
          if (mapped > after.length) return null
          return { ...marker, line: after.lineAt(mapped).number }
        })
        .filter((marker): marker is EditorMarker => marker != null)
    }
    return markers
  },
})

const decorationsField = StateField.define<DecorationSet>({
  create: (state) => buildDecorations(state, state.field(markersField)),
  update(decorations, transaction) {
    if (
      transaction.docChanged ||
      transaction.effects.some((effect) => effect.is(setMarkers))
    ) {
      return buildDecorations(
        transaction.state,
        transaction.state.field(markersField),
      )
    }
    return decorations
  },
  provide: (field) => EditorView.decorations.from(field),
})

class DiagnosticGutterMarker extends GutterMarker {
  constructor(
    private readonly severity: 'error' | 'warning',
    private readonly message: string,
  ) {
    super()
  }

  override toDOM(): Node {
    const element = document.createElement('span')
    element.className = `cm-mathalea-gutterMarker cm-mathalea-gutterMarker-${this.severity}`
    element.textContent = this.severity === 'error' ? '●' : '▲'
    element.title = this.message
    return element
  }
}

/** Marge affichant une pastille en face des lignes en erreur */
const diagnosticGutter = gutter({
  class: 'cm-mathalea-diagnosticGutter',
  lineMarker(view, block) {
    const markers = view.state.field(markersField, false)
    if (markers == null || markers.length === 0) return null
    const line = view.state.doc.lineAt(block.from).number
    const onLine = markers.filter((marker) => marker.line === line)
    if (onLine.length === 0) return null
    const severity = onLine.some((marker) => marker.severity === 'error')
      ? 'error'
      : 'warning'
    return new DiagnosticGutterMarker(
      severity,
      onLine.map((marker) => marker.message).join('\n'),
    )
  },
  initialSpacer: () => new DiagnosticGutterMarker('error', ''),
})

/** Signale (ou efface) les erreurs de compilation dans l'éditeur */
export function setEditorMarkers(
  view: EditorView,
  markers: EditorMarker[],
): void {
  view.dispatch({ effects: setMarkers.of(markers) })
}

/**
 * Place le curseur sur une position du code et l'amène au centre de la vue.
 * Utilisé quand on clique sur une erreur dans le panneau de diagnostics.
 */
export function revealPosition(
  view: EditorView,
  line: number,
  column = 1,
  endLine?: number,
  endColumn?: number,
): void {
  const from = offsetAt(view.state, line, column)
  const to =
    endLine != null ? offsetAt(view.state, endLine, endColumn ?? column) : from
  // la ligne visée a pu être repliée (repliage par indentation) : on la
  // déplie d'abord, sinon le curseur atterrit dans une zone invisible
  const folded = foldedRanges(view.state)
  const unfold: import('@codemirror/state').StateEffect<unknown>[] = []
  folded.between(from, Math.max(to, from), (foldFrom, foldTo) => {
    unfold.push(unfoldEffect.of({ from: foldFrom, to: foldTo }))
  })
  view.dispatch({
    selection: { anchor: from, head: Math.max(to, from) },
    effects: [...unfold, EditorView.scrollIntoView(from, { y: 'center' })],
    scrollIntoView: true,
  })
  view.focus()
}

/** Nombre de colonnes d'indentation d'une ligne (tabulation = 2) */
function indentationOf(text: string): number {
  let width = 0
  for (const character of text) {
    if (character === ' ') width += 1
    else if (character === '\t') width += 2
    else break
  }
  return width
}

/**
 * Repliage fondé sur l'indentation : le code généré imbrique les exercices,
 * les corrections et les listes de questions dans des blocs indentés, qu'on
 * peut ainsi replier pour naviguer dans une longue fiche.
 */
const indentationFolding = foldService.of((state, lineStart, lineEnd) => {
  const line = state.doc.lineAt(lineStart)
  if (line.text.trim() === '') return null
  const indent = indentationOf(line.text)
  let end: number | null = null
  for (let number = line.number + 1; number <= state.doc.lines; number++) {
    const next = state.doc.line(number)
    if (next.text.trim() === '') continue
    if (indentationOf(next.text) <= indent) break
    end = next.to
  }
  return end != null ? { from: lineEnd, to: end } : null
})

/** Réglages visuels communs aux deux thèmes */
const baseTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '0.9rem' },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    lineHeight: '1.5',
  },
  '.cm-content': { paddingBottom: '40vh' },
  '.cm-gutters': { border: 'none' },
  '.cm-mathalea-diagnosticGutter': {
    width: '1.1em',
    textAlign: 'center',
    fontSize: '0.7em',
    lineHeight: '1.5rem',
  },
  '.cm-mathalea-gutterMarker': { cursor: 'help' },
  '.cm-mathalea-gutterMarker-error': { color: '#e06c75' },
  '.cm-mathalea-gutterMarker-warning': { color: '#d19a66' },
  '.cm-panels': { fontFamily: 'inherit', fontSize: '0.85rem' },
  '.cm-panel.cm-search label': { textTransform: 'none' },
  '.cm-panel.cm-search input[type=checkbox]': { verticalAlign: 'middle' },
  '.cm-panel button[name=close]': { fontSize: '1.2em' },
})

/**
 * `::selection` est redéfini globalement par l'application (`app.css`), avec
 * une couleur de texte noire : sur le fond sombre de l'éditeur, le texte
 * sélectionné devenait illisible. On rétablit ici la couleur normale du
 * texte — le fond de sélection est dessiné par `drawSelection`.
 */
const selectionFix = Prec.highest(
  EditorView.theme({
    '.cm-content ::selection, .cm-content::selection, .cm-line::selection': {
      color: 'inherit',
    },
  }),
)

/**
 * Sélecteurs du fond de sélection. Le thème de base de CodeMirror le fixe
 * avec une règle très spécifique
 * (`&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground`) :
 * une règle plus courte est ignorée et la sélection garde le gris pâle par
 * défaut, peu visible. On reprend donc la même forme, en doublant une classe
 * pour passer devant.
 */
const SELECTION_FOCUSED =
  '&.cm-focused.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground'
const SELECTION_BLURRED =
  '.cm-selectionLayer .cm-selectionBackground.cm-selectionBackground'

/** Thème clair, accordé aux couleurs de l'application */
const lightTheme: Extension = [
  EditorView.theme(
    {
      '&': { backgroundColor: '#fbfcfd', color: '#1f2933' },
      '.cm-gutters': { backgroundColor: '#f0f3f6', color: '#8b98a5' },
      '.cm-activeLineGutter': { backgroundColor: '#e2e8f0', color: '#334155' },
      // le fond de la ligne courante (et celui des lignes en erreur) est
      // dessiné par-dessus la couche de sélection : opaque, il la masquerait
      '.cm-activeLine': { backgroundColor: 'rgba(140, 175, 220, 0.12)' },
      '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#1f2933' },
      // voir SELECTION_SELECTORS : la règle de base de CodeMirror est très
      // spécifique, il faut la surpasser pour choisir la couleur
      [SELECTION_FOCUSED]: { backgroundColor: '#8fbcf2' },
      [SELECTION_BLURRED]: { backgroundColor: '#d3dfef' },
      // les autres occurrences du texte sélectionné restent en retrait :
      // c'est la sélection courante qui doit ressortir
      '.cm-selectionMatch': { backgroundColor: '#fbeaa8' },
      '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
        backgroundColor: '#c7d2fe',
        outline: 'none',
      },
      '.cm-mathalea-errorLine': { backgroundColor: 'rgba(220, 38, 38, 0.13)' },
      '.cm-mathalea-warningLine': { backgroundColor: 'rgba(217, 119, 6, 0.15)' },
      '.cm-panels': { backgroundColor: '#f0f3f6', color: '#1f2933' },
      '.cm-panels.cm-panels-top': { borderBottom: '1px solid #cbd5e1' },
      '.cm-panel input, .cm-panel button': {
        backgroundColor: '#ffffff',
        color: '#1f2933',
        border: '1px solid #cbd5e1',
        borderRadius: '3px',
        padding: '1px 4px',
      },
      '.cm-panel button[name=close]': { border: 'none', background: 'none' },
    },
    { dark: false },
  ),
  syntaxHighlighting(defaultHighlightStyle),
]

/** Thème sombre (One Dark), avec les réglages propres à la vue */
const darkTheme: Extension = [
  oneDark,
  EditorView.theme(
    {
      '.cm-mathalea-errorLine': { backgroundColor: 'rgba(224, 108, 117, 0.18)' },
      '.cm-mathalea-warningLine': { backgroundColor: 'rgba(229, 192, 123, 0.15)' },
      [SELECTION_FOCUSED]: { backgroundColor: '#2f5480' },
      [SELECTION_BLURRED]: { backgroundColor: '#333a45' },
      '.cm-selectionMatch': { backgroundColor: 'rgba(229, 192, 123, 0.22)' },
    },
    { dark: true },
  ),
]

/** Compartiment permettant de changer de thème sans recréer l'éditeur */
const themeCompartment = new Compartment()

/** Bascule le thème de l'éditeur (suivi du mode sombre de l'application) */
export function setEditorTheme(view: EditorView, dark: boolean): void {
  view.dispatch({
    effects: themeCompartment.reconfigure(dark ? darkTheme : lightTheme),
  })
}

export interface CodeEditorOptions {
  /** Mode sombre de l'application au moment de la création */
  dark: boolean
  /** Ctrl/Cmd + Entrée : compiler tout de suite */
  onCompileNow: () => void
  /** Coloration syntaxique du langage édité (Typst, LaTeX…) */
  language: Extension
}

/**
 * Raccourcis ajoutés à ceux de CodeMirror. Les raccourcis usuels
 * (Ctrl/Cmd + D pour sélectionner l'occurrence suivante, Ctrl/Cmd + F pour
 * rechercher, Alt + ↑/↓ pour déplacer une ligne, Maj + Alt + ↑/↓ pour la
 * dupliquer, Ctrl/Cmd + Maj + K pour la supprimer, Ctrl/Cmd + / pour
 * commenter) viennent de `defaultKeymap` et `searchKeymap`.
 *
 * Pas de raccourci Ctrl/Cmd + S : Safari ouvre sa boîte de dialogue
 * d'enregistrement de page avant même que la page reçoive l'événement
 * clavier, `preventDefault()` ne peut donc rien y changer. Ctrl/Cmd + Entrée
 * reste le seul raccourci de compilation, sans ce conflit.
 */
function extraKeymap(options: CodeEditorOptions) {
  return [
    {
      key: 'Mod-Enter',
      preventDefault: true,
      run: () => (options.onCompileNow(), true),
    },
    { key: 'Mod-Shift-d', run: copyLineDown },
    { key: 'Mod-l', run: selectLine },
    { key: 'Mod-Alt-ArrowUp', run: addCursorAbove },
    { key: 'Mod-Alt-ArrowDown', run: addCursorBelow },
  ]
}

/** Extensions CodeMirror de l'éditeur de code */
export function codeEditorExtensions(options: CodeEditorOptions): Extension[] {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    diagnosticGutter,
    foldGutter({ openText: '⌄', closedText: '›' }),
    indentationFolding,
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    indentUnit.of('  '),
    bracketMatching(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    tooltips({ parent: document.body }),
    options.language,
    search({ top: true }),
    frenchPhrases,
    markersField,
    decorationsField,
    keymap.of([
      ...extraKeymap(options),
      ...searchKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
      indentWithTab,
    ]),
    themeCompartment.of(options.dark ? darkTheme : lightTheme),
    baseTheme,
    selectionFix,
    EditorView.lineWrapping,
  ]
}
