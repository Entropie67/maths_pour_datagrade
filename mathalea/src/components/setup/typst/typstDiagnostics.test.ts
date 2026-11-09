import { describe, expect, it } from 'vitest'
import {
  countErrors,
  parseTypstDiagnostics,
  summarizeDiagnostics,
  translateTypstMessage,
} from './typstDiagnostics'

describe('parseTypstDiagnostics', () => {
  it('lit position, sévérité et message du format unix', () => {
    const [diagnostic] = parseTypstDiagnostics([
      '/main.typ:11:4: error: unknown variable: foo',
    ])
    expect(diagnostic.severity).toBe('error')
    expect(diagnostic.file).toBe('/main.typ')
    expect(diagnostic.external).toBe(false)
    // les positions du compilateur sont déjà comptées à partir de 1
    expect(diagnostic.line).toBe(11)
    expect(diagnostic.column).toBe(4)
    expect(diagnostic.original).toBe('unknown variable: foo')
  })

  it('lit une position couvrant plusieurs lignes', () => {
    const [diagnostic] = parseTypstDiagnostics([
      'main.typ:2:9-3:15: error: unexpected type in `+` application',
    ])
    expect(diagnostic.line).toBe(2)
    expect(diagnostic.column).toBe(9)
    expect(diagnostic.endLine).toBe(3)
    expect(diagnostic.endColumn).toBe(15)
  })

  it('repère un diagnostic venant d’un paquet importé', () => {
    const [diagnostic] = parseTypstDiagnostics([
      'tblr:0.5.0@lib.typ:120:2: error: expected content, found integer',
    ])
    expect(diagnostic.packageName).toBe('tblr')
    expect(diagnostic.external).toBe(true)
    // une ligne d'un fichier importé ne correspond à rien dans l'éditeur
    expect(diagnostic.line).toBeUndefined()
  })

  it('conserve une ligne au format inattendu', () => {
    const [diagnostic] = parseTypstDiagnostics([
      'panic dans le compilateur WASM',
    ])
    expect(diagnostic.severity).toBe('error')
    expect(diagnostic.message).toBe('panic dans le compilateur WASM')
    expect(diagnostic.line).toBeUndefined()
  })

  it('supprime les doublons et met les erreurs en premier', () => {
    const diagnostics = parseTypstDiagnostics([
      'main.typ:40:0: warning: unused import',
      'main.typ:9:0: error: unknown variable: bar',
      'main.typ:9:0: error: unknown variable: bar',
    ])
    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[0].severity).toBe('error')
    expect(diagnostics[1].severity).toBe('warning')
  })

  it('regroupe le même message répété sur une ligne à des colonnes voisines', () => {
    const diagnostics = parseTypstDiagnostics([
      'main.typ:20:1: error: the character `#` is not valid in code',
      'main.typ:20:14: error: the character `#` is not valid in code',
    ])
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toContain('n’est pas valide')
  })

  it('trie les erreurs par ligne', () => {
    const diagnostics = parseTypstDiagnostics([
      'main.typ:30:0: error: unknown variable: b',
      'main.typ:10:0: error: unknown variable: a',
    ])
    expect(diagnostics.map((diagnostic) => diagnostic.line)).toEqual([10, 30])
  })
})

describe('translateTypstMessage', () => {
  it('traduit une variable inconnue et propose une piste', () => {
    const { message, hint } = translateTypstMessage(
      'unknown variable: mavariable',
    )
    expect(message).toContain('Variable ou fonction inconnue')
    expect(message).toContain('mavariable')
    expect(hint).toContain('#let mavariable')
  })

  it('reconnaît une figure MathALÉA manquante', () => {
    const { message, hint } = translateTypstMessage('unknown variable: fig-3')
    expect(message).toContain('fig-3')
    expect(hint).toContain('image(')
  })

  it('explique le saut de page dans un conteneur', () => {
    const { hint } = translateTypstMessage(
      'pagebreak is not allowed inside of a container',
    )
    expect(hint).toContain('en-colonnes')
  })

  it('traduit les types dans « expected … found … »', () => {
    expect(
      translateTypstMessage('expected content, found integer').message,
    ).toBe('Attendu : contenu ; trouvé : entier.')
  })

  it('traduit un délimiteur manquant', () => {
    expect(translateTypstMessage('expected closing brace').message).toBe(
      'Il manque une accolade fermante « } ».',
    )
  })

  it('traduit un paquet introuvable', () => {
    const { message, hint } = translateTypstMessage(
      'package not found (searched for @preview/tblr:0.5.0)',
    )
    expect(message).toContain('paquet Typst')
    expect(hint).toContain('packages.typst.org')
  })

  it('laisse le message anglais quand il n’est pas couvert', () => {
    const original = 'some brand new typst message'
    expect(translateTypstMessage(original).message).toBe(original)
  })

  it('signale l’origine externe d’un message non traduit', () => {
    const { hint } = translateTypstMessage('some package internal message', {
      external: true,
    })
    expect(hint).toContain('paquet importé')
  })
})

describe('résumé', () => {
  it('compte les erreurs sans les avertissements', () => {
    const diagnostics = parseTypstDiagnostics([
      'main.typ:1:0: error: unknown variable: a',
      'main.typ:2:0: warning: unused import',
    ])
    expect(countErrors(diagnostics)).toBe(1)
    expect(summarizeDiagnostics(diagnostics)).toBe('1 erreur, 1 avertissement')
  })

  it('accorde le pluriel', () => {
    const diagnostics = parseTypstDiagnostics([
      'main.typ:1:0: error: unknown variable: a',
      'main.typ:2:0: error: unknown variable: b',
    ])
    expect(summarizeDiagnostics(diagnostics)).toBe('2 erreurs')
  })
})
