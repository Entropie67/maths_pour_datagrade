import { describe, expect, it } from 'vitest'
import { loadPackagesFromContent } from '../../src/lib/latex/preambuleTex'
import { courbe } from '../../src/lib/2d/Courbe'
import { repere } from '../../src/lib/2d/reperes'
import type { contentsType } from '../../src/lib/LatexTypes'

describe('préambule PGFPlots', () => {
  it('charge arrows.meta pour les axes utilisant une pointe Stealth', () => {
    const contents: contentsType = {
      preamble: '',
      intro: '',
      content:
        '\\begin{tikzpicture}\\begin{axis}[axis line style={-{Stealth}}]\\end{axis}\\end{tikzpicture}',
      contentCorr: '',
    }

    loadPackagesFromContent(contents)

    expect(contents.preamble).toContain('\\usepackage{pgfplots}')
    expect(contents.preamble).toContain('\\usetikzlibrary{arrows.meta}')
  })

  it('conserve les accolades protégeant une couleur RGB dans addplot', () => {
    const r = repere({ xMin: 0, xMax: 10, yMin: 0, yMax: 10 })
    const graph = courbe((x) => x, {
      repere: r,
      color: 'blue',
      usePgfplots: true,
      fLatex: 'x',
    })

    expect(graph.tikz()).toMatch(/color=\{rgb,255:red,/)
  })
})
