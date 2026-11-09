import { describe, expect, it } from 'vitest'
import { doesLatexNeedsPics, getLogoCanUrls } from '../../src/lib/Latex'
import {
  LOGO_CAN_TEX_FILE,
  loadPreambule,
} from '../../src/lib/latex/preambuleTex'
import type { LatexFileInfos } from '../../src/lib/LatexTypes'

describe('logo de la Course aux nombres en LaTeX', () => {
  it('la page de garde inclut le même PNG que la sortie Typst', () => {
    const contents = { preamble: '', intro: '', content: '', contentCorr: '' }
    loadPreambule({ style: 'Can' } as LatexFileInfos, contents)
    expect(contents.preamble).toContain(
      `\\includegraphics[width=\\linewidth]{${LOGO_CAN_TEX_FILE}}`,
    )
    expect(contents.preamble).not.toContain('mobiusCan')
  })

  it("le logo est ajouté aux fichiers à joindre quand le code l'inclut", () => {
    const urls = getLogoCanUrls(`\\includegraphics{${LOGO_CAN_TEX_FILE}}`)
    expect(urls).toHaveLength(1)
    expect(urls[0]).toMatch(/images\/logoCan\.png$/)
    expect(getLogoCanUrls('\\begin{document}')).toEqual([])
  })

  it('une fiche CAN a besoin d’images même sans figure dans les exercices', () => {
    const preamble = `\\includegraphics{${LOGO_CAN_TEX_FILE}}`
    expect(
      doesLatexNeedsPics({ preamble, content: '', contentCorr: '' }),
    ).toBe(true)
    expect(doesLatexNeedsPics({ content: '', contentCorr: '' })).toBe(false)
  })
})
