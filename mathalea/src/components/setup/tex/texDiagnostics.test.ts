import { describe, expect, it } from 'vitest'
import {
  countErrors,
  parseTexLog,
  summarizeDiagnostics,
} from './texDiagnostics'

describe('parseTexLog', () => {
  it('lit une commande inconnue et sa ligne', () => {
    const log = [
      'LaTeX Font Info:    ... okay on input line 2.',
      '! Undefined control sequence.',
      'l.4 \\undefinedcommand',
      '                     ',
      '!  ==> Fatal error occurred, no output PDF file produced!',
    ].join('\n')
    const diagnostics = parseTexLog(log)
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]).toMatchObject({
      line: 4,
      severity: 'error',
      message: 'Commande inconnue.',
    })
    expect(diagnostics[0].hint).toBeDefined()
  })

  it('traduit une erreur LaTeX nommée', () => {
    const log = [
      "! LaTeX Error: Environment tabular* undefined.",
      '',
      'See the LaTeX manual or LaTeX Companion for explanation.',
      'l.12 \\begin{tabular*}',
    ].join('\n')
    const [diagnostic] = parseTexLog(log)
    expect(diagnostic.message).toBe('Environnement « tabular* » inconnu.')
    expect(diagnostic.line).toBe(12)
  })

  it('recolle un message coupé sur plusieurs lignes', () => {
    const log = [
      '! LaTeX Error: File `image-qui-nexiste-pas.png\' not',
      'found.',
      'l.7 \\includegraphics{image-qui-nexiste-pas.png}',
    ].join('\n')
    const [diagnostic] = parseTexLog(log)
    expect(diagnostic.message).toContain('image-qui-nexiste-pas.png')
    expect(diagnostic.line).toBe(7)
  })

  it('lit un avertissement et sa ligne', () => {
    const log = 'LaTeX Warning: Citation `foo\' undefined on input line 21.'
    const [diagnostic] = parseTexLog(log)
    expect(diagnostic.severity).toBe('warning')
    expect(diagnostic.line).toBe(21)
  })

  it('écarte les avertissements typographiques', () => {
    const log = [
      'Overfull \\hbox (12.3pt too wide) in paragraph at lines 3--4',
      'Underfull \\vbox (badness 10000) has occurred while \\output is active',
    ].join('\n')
    expect(parseTexLog(log)).toHaveLength(0)
  })

  it("ne garde « Emergency stop » que faute d'autre diagnostic", () => {
    const withCause = parseTexLog(
      ['! Undefined control sequence.', 'l.4 \\foo', '! Emergency stop.'].join(
        '\n',
      ),
    )
    expect(withCause).toHaveLength(1)
    expect(withCause[0].message).toBe('Commande inconnue.')

    const alone = parseTexLog('! Emergency stop.')
    expect(alone).toHaveLength(1)
  })

  it('ne répète pas un même message sur une même ligne', () => {
    const log = [
      '! Missing $ inserted.',
      'l.9 x_2',
      '! Missing $ inserted.',
      'l.9 x_2',
    ].join('\n')
    expect(parseTexLog(log)).toHaveLength(1)
  })

  it('laisse en anglais un message non couvert', () => {
    const [diagnostic] = parseTexLog(
      ['! Dimension too large.', 'l.3 \\hspace{100000cm}'].join('\n'),
    )
    expect(diagnostic.message).toBe('Dimension too large.')
    expect(diagnostic.raw).toBe('Dimension too large.')
  })

  it('ignore un journal sans erreur', () => {
    expect(parseTexLog('This is LuaHBTeX\n(./document.tex)\nOutput written')).toEqual(
      [],
    )
  })
})

describe('résumé', () => {
  it('compte erreurs et avertissements', () => {
    const diagnostics = parseTexLog(
      [
        '! Undefined control sequence.',
        'l.4 \\foo',
        "LaTeX Warning: Reference `x' undefined on input line 8.",
      ].join('\n'),
    )
    expect(countErrors(diagnostics)).toBe(1)
    expect(summarizeDiagnostics(diagnostics)).toBe('1 erreur, 1 avertissement')
  })

  it('accorde le pluriel', () => {
    const diagnostics = parseTexLog(
      [
        '! Undefined control sequence.',
        'l.4 \\foo',
        '! Too many }\'s.',
        'l.6 }',
      ].join('\n'),
    )
    expect(summarizeDiagnostics(diagnostics)).toBe('2 erreurs')
  })
})
