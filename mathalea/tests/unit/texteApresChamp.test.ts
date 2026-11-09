import { beforeEach, describe, expect, it } from 'vitest'
import { texteApresChamp } from '../../src/lib/outils/outilString'
import { setOutputHtml, setOutputLatex } from '../../src/modules/context'

describe('texteApresChamp', () => {
  beforeEach(() => setOutputHtml())

  it('sépare toujours le texte du champ par une seule espace', () => {
    expect(texteApresChamp('cm')).toBe('&nbsp;cm')
    expect(texteApresChamp(' €')).toBe('&nbsp;€')
    expect(texteApresChamp('&nbsp; euros')).toBe('&nbsp;euros')
    expect(texteApresChamp('$\\text{ cm}$')).toBe('&nbsp;$\\text{ cm}$')
  })

  it("n'ajoute rien sans texte", () => {
    expect(texteApresChamp('')).toBe('')
    expect(texteApresChamp(' ')).toBe('')
  })

  it('utilise une espace LaTeX hors HTML', () => {
    setOutputLatex()
    expect(texteApresChamp(' cm')).toBe('\\,cm')
  })
})
