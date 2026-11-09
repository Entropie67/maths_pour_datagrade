/** Zones littérales à protéger lors d’une transformation ciblée du source. */
export function typstLiteralRanges(source: string) {
  const ranges: { start: number; end: number; kind: 'literal' | 'comment' }[] =
    []
  for (let i = 0; i < source.length;) {
    const start = i
    let kind: 'literal' | 'comment' = 'literal'
    if (source[i] === '"') {
      i++
      while (i < source.length) {
        if (source[i] === '\\') i += 2
        else if (source[i++] === '"') break
      }
    } else if (source[i] === '`') {
      while (source[i] === '`') i++
      const delimiter = source.slice(start, i)
      const end = source.indexOf(delimiter, i)
      i = end < 0 ? source.length : end + delimiter.length
    } else if (source.startsWith('//', i)) {
      kind = 'comment'
      const end = source.indexOf('\n', i)
      i = end < 0 ? source.length : end
    } else if (source.startsWith('/*', i)) {
      kind = 'comment'
      i += 2
      let depth = 1
      while (i < source.length && depth > 0) {
        if (source.startsWith('/*', i)) {
          depth++
          i += 2
        } else if (source.startsWith('*/', i)) {
          depth--
          i += 2
        } else i++
      }
    } else {
      // Un délimiteur échappé dans le balisage n’ouvre pas de littéral.
      i += source[i] === '\\' ? 2 : 1
      continue
    }
    ranges.push({ start, end: Math.min(i, source.length), kind })
  }
  return ranges
}

/** Même longueur et mêmes lignes ; les chaînes, codes bruts et commentaires sont masqués. */
export function maskTypstLiterals(source: string): string {
  let result = ''
  let offset = 0
  for (const { start, end } of typstLiteralRanges(source)) {
    result += source.slice(offset, start)
    result += source.slice(start, end).replace(/[^\r\n]/g, ' ')
    offset = end
  }
  return result + source.slice(offset)
}

/** Cherche la fin d’un appel/bloc dans un source dont les littéraux sont masqués. */
export function typstClosingDelimiter(masked: string, start: number): number {
  const delimiters: Record<string, string> = { '(': ')', '{': '}', '[': ']' }
  const closing = delimiters[masked[start]]
  if (closing == null) return -1
  let depth = 1
  for (let i = start + 1; i < masked.length; i++) {
    if (masked[i] === masked[start]) depth++
    else if (masked[i] === closing && --depth === 0) return i
  }
  return -1
}

export function applyTypstSourceEdits(
  source: string,
  edits: { start: number; end: number; text: string }[],
): string {
  const parts: string[] = []
  let offset = 0
  for (const { start, end, text } of edits.sort((a, b) => a.start - b.start)) {
    parts.push(source.slice(offset, start), text)
    offset = end
  }
  parts.push(source.slice(offset))
  return parts.join('')
}

/** Retire aussi la ligne si elle ne porte que l’élément supprimé. */
export function typstRemoval(source: string, start: number, end: number) {
  const lineStart = source.lastIndexOf('\n', start - 1) + 1
  const nextNewline = source.indexOf('\n', end)
  const lineEnd = nextNewline < 0 ? source.length : nextNewline
  if (
    /^[ \t]*$/.test(source.slice(lineStart, start)) &&
    /^[ \t\r]*$/.test(source.slice(end, lineEnd))
  ) {
    return {
      start: lineStart,
      end: nextNewline < 0 ? lineEnd : lineEnd + 1,
      text: '',
    }
  }
  return { start, end, text: '' }
}
