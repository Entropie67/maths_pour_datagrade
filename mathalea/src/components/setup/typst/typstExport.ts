import {
  applyTypstSourceEdits,
  maskTypstLiterals,
  typstClosingDelimiter,
  typstLiteralRanges,
  typstRemoval,
} from './typstSource'

/** Code courant de l’énoncé seul, sans reconstruire les exercices. */
export function enonceCode(code: string): string {
  return code.replace(/(#let\s+corrige\s*=\s*)(true|false)\b/, '$1false')
}

/**
 * Corrigé seul : la banque affiche ses solutions ; les présentations sans
 * banque (fusion et CAN) gardent leur section Corrections sans les énoncés.
 */
export function corrigeCode(code: string): string {
  const bankDisplay = 'display: if corrige { "both" } else { "ex" }'
  if (code.includes(bankDisplay)) {
    return enonceCode(code)
      .replace(bankDisplay, 'display: "sol"')
      .replace(/#let entete = .*/, '#let entete = ""')
  }

  const masked = maskTypstLiterals(code)
  const edits: { start: number; end: number; text: string }[] = []
  const chained = /^#mathalea-enchainement\(/m.exec(masked)
  if (chained != null) {
    const end = typstClosingDelimiter(
      masked,
      chained.index + chained[0].length - 1,
    )
    if (end >= 0) edits.push(typstRemoval(code, chained.index, end + 1))
  }
  for (const { start, end, kind } of typstLiteralRanges(code)) {
    if (
      kind !== 'comment' ||
      !/^\/\/ ----- (Énoncés|Course aux nombres) -----$/.test(
        code.slice(start, end),
      )
    )
      continue
    const block = /^\s*#en-colonnes\s*\[/.exec(masked.slice(end))
    if (block == null) continue
    const blockEnd = typstClosingDelimiter(masked, end + block[0].length - 1)
    if (blockEnd >= 0) edits.push(typstRemoval(code, start, blockEnd + 1))
  }
  return (
    applyTypstSourceEdits(code, edits)
      .replace(/(#let\s+corrige\s*=\s*)(true|false)\b/, '$1true')
      .replace(/#let entete = .*/, '#let entete = ""')
      // Sans énoncé avant la correction, ce saut créerait une page de titre seule.
      .replace(
        new RegExp(
          '(#if corrige \\[\\s*// les corrections commencent sur une nouvelle page\\n)' +
            '  (?:#pagebreak\\(weak: true\\)|#\\{ set page\\(header: none, footer: none\\); pagebreak\\(to: "odd", weak: true\\) \\})\\n',
          chained == null ? 'g' : '',
        ),
        '$1',
      )
  )
}

/**
 * Nettoie le texte actuel de l’éditeur, sans régénérer les exercices.
 * Seuls les repères et commentaires de l’interface sont retirés ; les
 * réglages et expressions Typst restent intacts, y compris les retouches libres.
 */
export function cleanTypstExport(source: string): string {
  const masked = maskTypstLiterals(source)
  const edits: { start: number; end: number; text: string }[] = []
  const definitions: { start: number; end: number }[] = []
  for (const match of masked.matchAll(/#let\s+mathalea-anchor\s*\(/g)) {
    const paramsEnd = typstClosingDelimiter(
      masked,
      match.index + match[0].length - 1,
    )
    if (paramsEnd < 0) continue
    const body = /^\s*=\s*context\s*\{/.exec(masked.slice(paramsEnd + 1))
    if (body == null) continue
    const end = typstClosingDelimiter(masked, paramsEnd + body[0].length)
    if (end < 0) continue
    definitions.push({ start: match.index, end: end + 1 })
    edits.push(typstRemoval(source, match.index, end + 1))
  }
  for (const match of masked.matchAll(/(?<![\w-])#?mathalea-anchor\s*\(/g)) {
    if (
      definitions.some(
        ({ start, end }) => match.index >= start && match.index < end,
      )
    )
      continue
    const end = typstClosingDelimiter(masked, match.index + match[0].length - 1)
    if (end >= 0) edits.push(typstRemoval(source, match.index, end + 1))
  }
  for (const { start, end, kind } of typstLiteralRanges(source)) {
    if (
      kind !== 'comment' ||
      definitions.some((range) => start >= range.start && start < range.end)
    )
      continue
    const comment = source.slice(start, end)
    if (
      /^\/\/\s*mathalea:/.test(comment) ||
      comment ===
        '// ----- Repères invisibles de la palette de mise en page -----'
    ) {
      edits.push(typstRemoval(source, start, end))
    }
  }
  return applyTypstSourceEdits(source, edits)
}
