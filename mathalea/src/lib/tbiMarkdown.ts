import katex from 'katex'
import { Marked, type TokenizerAndRendererExtension, type Tokens } from 'marked'

/**
 * Notes Markdown de la vue TBI : rendu et mise en forme de la sélection.
 *
 * Markdown ne connaît ni les couleurs ni les tailles : elles s'écrivent
 * `[texte]{rouge}`, `[texte]{grand}` ou `[texte]{rouge grand}`. Seuls les noms
 * ci-dessous sont reconnus, et le HTML brut est affiché comme du texte : une
 * note peut venir d'une séance reçue d'un collègue, rien de ce qu'elle contient
 * ne doit pouvoir s'exécuter ou modifier la page.
 *
 * Les formules s'écrivent `$…$` et `$$…$$`, comme dans les exercices.
 */

export interface TbiNoteStyle {
  name: string
  label: string
}

/** Couleurs proposées (teintes dans `TbiMarkdownNote.svelte`) */
export const TBI_NOTE_COLORS: TbiNoteStyle[] = [
  { name: 'rouge', label: 'Rouge' },
  { name: 'orange', label: 'Orange' },
  { name: 'vert', label: 'Vert' },
  { name: 'bleu', label: 'Bleu' },
  { name: 'violet', label: 'Violet' },
  { name: 'gris', label: 'Gris' },
]

export const TBI_NOTE_SIZES: TbiNoteStyle[] = [
  { name: 'petit', label: 'Petit' },
  { name: 'grand', label: 'Grand' },
  { name: 'enorme', label: 'Énorme' },
]

const COLOR_NAMES = TBI_NOTE_COLORS.map((style) => style.name)
const SIZE_NAMES = TBI_NOTE_SIZES.map((style) => style.name)
const STYLE_NAMES = [...COLOR_NAMES, ...SIZE_NAMES]

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMath(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: 'ignore',
    trust: false,
  })
}

/** Lien cliquable : http(s) et courriel seulement (pas de `javascript:`…) */
function isSafeLink(href: string): boolean {
  return /^(?:https?:\/\/|mailto:)/i.test(href)
}

/** Image : http(s) ou image intégrée, jamais de script (`data:image/svg+xml`) */
function isSafeImage(href: string): boolean {
  return (
    /^https?:\/\//i.test(href) ||
    /^data:image\/(?:png|jpeg|gif|webp);/i.test(href)
  )
}

const inlineMath: TokenizerAndRendererExtension = {
  name: 'tbiInlineMath',
  level: 'inline',
  start: (src) => {
    const index = src.indexOf('$')
    return index < 0 ? undefined : index
  },
  tokenizer(src) {
    // pas d'espace contre les `$`, ni de chiffre après : « de 5 $ à 10 $ »
    const match = /^\$(?!\s)((?:\\.|[^$\\\n])+?)(?<!\s)\$(?!\d)/.exec(src)
    if (!match) return undefined
    return { type: 'tbiInlineMath', raw: match[0], tex: match[1] }
  },
  renderer: (token) => renderMath(String(token.tex), false),
}

const blockMath: TokenizerAndRendererExtension = {
  name: 'tbiBlockMath',
  level: 'block',
  start: (src) => {
    const index = src.indexOf('$$')
    return index < 0 ? undefined : index
  },
  tokenizer(src) {
    const match = /^\$\$((?:\\.|[^$\\])+?)\$\$(?:\n|$)/.exec(src)
    if (!match) return undefined
    return { type: 'tbiBlockMath', raw: match[0], tex: match[1].trim() }
  },
  renderer: (token) => `<div>${renderMath(String(token.tex), true)}</div>\n`,
}

const styledText: TokenizerAndRendererExtension = {
  name: 'tbiStyledText',
  level: 'inline',
  start: (src) => {
    const index = src.indexOf('[')
    return index < 0 ? undefined : index
  },
  tokenizer(src) {
    const match =
      /^\[((?:\\.|[^[\]\\]|\[(?:\\.|[^[\]\\])*\](?:\{[^}]*\})?)+)\]\{([a-z ]+)\}/.exec(
        src,
      )
    if (!match) return undefined
    const names = match[2].trim().split(/\s+/)
    if (!names.every((name) => STYLE_NAMES.includes(name))) return undefined
    return {
      type: 'tbiStyledText',
      raw: match[0],
      names,
      tokens: this.lexer.inlineTokens(match[1]),
    }
  },
  renderer(token) {
    const classes = (token.names as string[])
      .map((name) => `tbi-note-${name}`)
      .join(' ')
    const inner = this.parser.parseInline(token.tokens ?? [])
    return `<span class="${classes}">${inner}</span>`
  },
}

const noteMarked = new Marked({
  gfm: true,
  // un retour à la ligne dans l'éditeur en est un à l'écran
  breaks: true,
  extensions: [blockMath, inlineMath, styledText],
  renderer: {
    html: ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text),
    link({ href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens)
      if (!isSafeLink(href)) return text
      const titleAttribute = title ? ` title="${escapeHtml(title)}"` : ''
      return `<a href="${escapeHtml(href)}"${titleAttribute} target="_blank" rel="noopener noreferrer">${text}</a>`
    },
    image({ href, title, text }: Tokens.Image) {
      if (!isSafeImage(href)) return escapeHtml(text)
      const titleAttribute = title ? ` title="${escapeHtml(title)}"` : ''
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttribute}>`
    },
  },
})

/** HTML d'une note, sans risque pour la page (voir l'en-tête du fichier) */
export function renderTbiNote(markdown: string): string {
  return noteMarked.parse(markdown, { async: false })
}

/** Texte modifié et sélection à rétablir dans l'éditeur */
export interface TbiNoteEdit {
  text: string
  start: number
  end: number
}

const PLACEHOLDER = 'texte'

/** Sépare une sélection de ses espaces de début et de fin, qui restent dehors */
function splitSpaces(selected: string) {
  const inner = selected.trim()
  const before = selected.slice(
    0,
    selected.length - selected.trimStart().length,
  )
  const after = selected.slice(selected.trimEnd().length)
  return { before, inner, after }
}

/**
 * Entoure la sélection d'un marqueur (`**`, `*`, `$`) ou le retire s'il y est
 * déjà. Sans sélection, le texte à remplacer est inséré et sélectionné.
 */
export function toggleMarker(
  text: string,
  start: number,
  end: number,
  marker: string,
): TbiNoteEdit {
  const { before, inner, after } = splitSpaces(text.slice(start, end))
  const from = start + before.length
  const to = from + inner.length
  const size = marker.length
  if (
    inner !== '' &&
    text.slice(from - size, from) === marker &&
    text.slice(to, to + size) === marker
  ) {
    return {
      text: text.slice(0, from - size) + inner + text.slice(to + size),
      start: from - size,
      end: to - size,
    }
  }
  const content = inner === '' ? PLACEHOLDER : inner
  return {
    text: `${text.slice(0, from)}${marker}${content}${marker}${after}${text.slice(end)}`,
    start: from + size,
    end: from + size + content.length,
  }
}

/** Noms de style après le choix de `name` : remplace ceux de sa catégorie */
function nextStyleNames(names: string[], name: string): string[] {
  const category = COLOR_NAMES.includes(name) ? COLOR_NAMES : SIZE_NAMES
  const kept = names.filter((other) => !category.includes(other))
  return names.includes(name) ? kept : [...kept, name]
}

/** Texte `inner` avec ces styles, ou nu s'il n'en a plus */
function styled(inner: string, names: string[]): string {
  return names.length === 0 ? inner : `[${inner}]{${names.join(' ')}}`
}

/**
 * Début d'une ligne de Markdown qui reste hors de la couleur ou de la taille
 * (une liste doit rester une liste), le texte, et les espaces de fin.
 */
const LINE_PARTS = /^(\s*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s+)?)(.*?)(\s*)$/

/**
 * Applique une couleur ou une taille à la sélection. Si elle est déjà dans un
 * texte stylé, le style y est remplacé (ou retiré s'il y est déjà). Un style ne
 * pouvant pas franchir un paragraphe, une sélection de plusieurs lignes est
 * stylée ligne par ligne.
 */
export function applyNoteStyle(
  text: string,
  start: number,
  end: number,
  name: string,
): TbiNoteEdit {
  const selected = text.slice(start, end)
  if (selected.includes('\n')) {
    const lines = selected.split('\n').map((line) => {
      const [, prefix, content, spaces] = LINE_PARTS.exec(line) ?? []
      return content ? `${prefix}${styled(content, [name])}${spaces}` : line
    })
    const replaced = lines.join('\n')
    return {
      text: text.slice(0, start) + replaced + text.slice(end),
      start,
      end: start + replaced.length,
    }
  }
  const { before, inner, after } = splitSpaces(selected)
  const from = start + before.length
  const to = from + inner.length
  // texte stylé sélectionné en entier, crochets compris
  const whole = /^\[(.*)\]\{([a-z ]+)\}$/.exec(inner)
  if (whole) {
    const names = nextStyleNames(whole[2].trim().split(/\s+/), name)
    const replaced = styled(whole[1], names)
    const offset = names.length === 0 ? 0 : 1
    return {
      text: text.slice(0, from) + replaced + text.slice(to),
      start: from + offset,
      end: from + offset + whole[1].length,
    }
  }
  // sélection qui est exactement le contenu d'un texte stylé
  const closing = /^\]\{([a-z ]+)\}/.exec(text.slice(to))
  if (inner !== '' && text[from - 1] === '[' && closing) {
    const names = nextStyleNames(closing[1].trim().split(/\s+/), name)
    const replaced = styled(inner, names)
    const offset = names.length === 0 ? 0 : 1
    return {
      text:
        text.slice(0, from - 1) + replaced + text.slice(to + closing[0].length),
      start: from - 1 + offset,
      end: from - 1 + offset + inner.length,
    }
  }
  const content = inner === '' ? PLACEHOLDER : inner
  return {
    text: `${text.slice(0, from)}${styled(content, [name])}${after}${text.slice(end)}`,
    start: from + 1,
    end: from + 1 + content.length,
  }
}

/** Ajoute un préfixe (`# `, `- `) aux lignes de la sélection, ou le retire */
export function toggleLinePrefix(
  text: string,
  start: number,
  end: number,
  prefix: string,
): TbiNoteEdit {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const nextBreak = text.indexOf('\n', end)
  const lineEnd = nextBreak < 0 ? text.length : nextBreak
  const lines = text.slice(lineStart, lineEnd).split('\n')
  const filled = lines.filter((line) => line.trim() !== '')
  const remove =
    filled.length > 0 && filled.every((line) => line.startsWith(prefix))
  const replaced = lines
    .map((line) => {
      if (line.trim() === '') return line
      return remove ? line.slice(prefix.length) : `${prefix}${line}`
    })
    .join('\n')
  return {
    text: text.slice(0, lineStart) + replaced + text.slice(lineEnd),
    start: lineStart,
    end: lineStart + replaced.length,
  }
}
