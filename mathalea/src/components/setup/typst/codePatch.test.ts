import { describe, expect, it } from 'vitest'
import { applyCodePatch, createCodePatch } from './codePatch'

const report = (original: string, edited: string, target: string) =>
  applyCodePatch(target, createCodePatch(original, edited))

describe('codePatch', () => {
  it('reporte une consigne reformulée sur un sujet aux nombres différents', () => {
    expect(
      report(
        'Calculer.\n+ $3 + 4$\n+ $5 times 2$',
        'Calculer sans poser les opérations.\n+ $3 + 4$\n+ $5 times 2$',
        'Calculer.\n+ $7 + 1$\n+ $6 times 9$',
      ),
    ).toBe('Calculer sans poser les opérations.\n+ $7 + 1$\n+ $6 times 9$')
  })

  it('reporte plusieurs retouches éloignées', () => {
    expect(
      report(
        'Calculer.\n+ $3 + 4$\n+ $5 times 2$\nVérifier le résultat.',
        'Calculer mentalement.\n+ $3 + 4$\n+ $5 times 2$\nVérifier le résultat avec la calculatrice.',
        'Calculer.\n+ $8 + 2$\n+ $1 times 3$\nVérifier le résultat.',
      ),
    ).toBe(
      'Calculer mentalement.\n+ $8 + 2$\n+ $1 times 3$\nVérifier le résultat avec la calculatrice.',
    )
  })

  it('reporte une suppression', () => {
    expect(
      report(
        'Calculer.\n#v(1em)\n+ $3 + 4$',
        'Calculer.\n+ $3 + 4$',
        'Calculer.\n#v(1em)\n+ $9 + 9$',
      ),
    ).toBe('Calculer.\n+ $9 + 9$')
  })

  it('refuse de reporter une retouche portant sur des nombres propres au sujet', () => {
    expect(
      report('Calculer $3 + 4$.', 'Calculer $3 + 5$.', 'Calculer $7 + 1$.'),
    ).toBeNull()
  })

  it('refuse une retouche ambiguë', () => {
    expect(
      report('Calculer.', 'Calculer vite.', 'Calculer. Calculer.'),
    ).toBeNull()
  })

  it('situe une retouche malgré des nombres différents dans son contexte', () => {
    expect(report('+ $3$\n+ $4$', '+ $3$ cm\n+ $4$', '+ $5$\n+ $6$')).toBe(
      '+ $5$ cm\n+ $6$',
    )
  })

  it('reporte une structure ajoutée autour de nombres propres au sujet', () => {
    expect(
      report('Calculer $3 + 4$.', 'Calculer $(3 + 4)$.', 'Calculer $7 + 1$.'),
    ).toBe('Calculer $(7 + 1)$.')
  })

  it('remplit un texte vide (exercice à énoncé libre)', () => {
    expect(report('', 'Mon énoncé.', '')).toBe('Mon énoncé.')
  })

  it('laisse le texte inchangé sans retouche', () => {
    expect(report('Calculer.', 'Calculer.', 'Résoudre.')).toBe('Résoudre.')
  })

  it('reporte une retouche en fin de texte', () => {
    expect(
      report('Calculer $1$.', 'Calculer $1$.\n\nJustifier.', 'Calculer $2$.'),
    ).toBe('Calculer $2$.\n\nJustifier.')
  })

  it('reste rapide sur un long énoncé entièrement réécrit', () => {
    const items = (shift: number) =>
      Array.from({ length: 400 }, (_, k) => `+ $${k + shift} + 1$`).join('\n')
    const start = performance.now()
    const patched = report(items(0), 'Nouvel énoncé.', items(7))
    expect(performance.now() - start).toBeLessThan(2000)
    expect(patched).toBeNull()
  })
})
