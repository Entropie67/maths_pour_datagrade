import { describe, expect, it } from 'vitest'
import { tbiLabelHtml, tbiLabelPlain } from '../../src/lib/tbiLabel'

describe('noms affichés', () => {
  it('rend les formules par KaTeX', () => {
    const html = tbiLabelHtml('Puissances de $10$')
    expect(html).toContain('Puissances de ')
    expect(html).toContain('class="katex"')
    expect(html).not.toContain('$')
  })

  it('échappe le texte, un nom pouvant venir d’un lien partagé', () => {
    const html = tbiLabelHtml('<img src=x onerror=alert(1)> & co')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
    expect(html).toContain('&amp; co')
  })

  it('n’exécute rien dans une formule', () => {
    const html = tbiLabelHtml('$\\href{javascript:alert(1)}{x}$')
    expect(html).not.toContain('href="javascript')
  })

  it('laisse un dollar seul tel quel', () => {
    expect(tbiLabelHtml('Prix en $')).toBe('Prix en $')
  })

  it('donne une version en texte simple pour les attributs', () => {
    expect(tbiLabelPlain('Puissances de $10$')).toBe('Puissances de 10')
    expect(tbiLabelPlain('Calculer $\\dfrac{a}{b}$')).toBe('Calculer a/b')
    expect(tbiLabelPlain('Sans formule')).toBe('Sans formule')
  })
})
