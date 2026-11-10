import { describe, expect, it } from 'vitest'
import { spawnSync, execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { htmlToTypst } from './latexToTypst'
import { simplifyTypstHighlights, withTypstHighlights } from './typstHighlights'

describe('mise en évidence Typst factorisée', () => {
  it('conserve les corps imbriqués et utilise la couleur orange par défaut', () => {
    const code = htmlToTypst(
      '${\\color{#f15929}\\boldsymbol{\\frac{2}{3}(x+1)}}$ et ${\\color{#F15929}\\boldsymbol{4}}$',
    )
    const simplified = simplifyTypstHighlights(code)
    expect(simplified).toBe('$evidence(2/3 (x + 1))$ et $evidence(4)$')
    const standalone = withTypstHighlights(code)
    expect(standalone.match(/#let evidence/g)).toHaveLength(1)
    expect(standalone.match(/0\.025em/g)).toHaveLength(1)
  })

  it('préserve les autres couleurs et les formules sans gras', () => {
    const code = htmlToTypst(
      '${\\color{blue}\\boldsymbol{x}}$ et ${\\color{red}y}$',
    )
    expect(simplifyTypstHighlights(code)).toBe(
      '$evidence(couleur: #rgb("#216D9A"), x)$ et $text(fill: #red, y)$',
    )
  })

  it('fournit aussi le helper aux fragments déjà factorisés, sans alourdir les autres', () => {
    expect(withTypstHighlights('$evidence(2)$')).toContain('#let evidence')
    expect(withTypstHighlights('$2 + 3$')).toBe('$2 + 3$')
    const code = withTypstHighlights('$evidence(2)$')
    expect(withTypstHighlights(code)).toBe(code)
  })

  it('conserve les parenthèses dans les chaînes et les couleurs imbriquées', () => {
    const original =
      'text(fill: #rgb("#F15929"), stroke: #stroke(paint: rgb("#F15929"), thickness: 0.025em), bold(#txt("une ) parenthèse") + text(fill: #rgb("#216D9A"), stroke: #stroke(paint: rgb("#216D9A"), thickness: 0.025em), bold(x))))'
    expect(simplifyTypstHighlights(`$${original}$`)).toBe(
      '$evidence(#txt("une ) parenthèse") + evidence(couleur: #rgb("#216D9A"), x))$',
    )
    expect(simplifyTypstHighlights('```typ\n' + original + '\n```')).toBe(
      '```typ\n' + original + '\n```',
    )
  })

  it.skipIf(
    process.env.TYPST_CLI_TESTS !== '1' &&
      (process.env.CI != null ||
        spawnSync('typst', ['--version']).status !== 0),
  )('produit exactement le même SVG avec le compilateur Typst', () => {
    const code = htmlToTypst(
      '${\\color{#F15929}\\boldsymbol{\\sqrt{2}(x+1)}}$ et ${\\color{blue}\\boldsymbol{\\frac{2}{3}}}$',
    )
    const dir = mkdtempSync(join(tmpdir(), 'typst-highlights-'))
    try {
      const render = (name: string, source: string) => {
        const input = join(dir, `${name}.typ`)
        const output = join(dir, `${name}.svg`)
        writeFileSync(input, source)
        execFileSync('typst', ['compile', input, output], { stdio: 'pipe' })
        return readFileSync(output, 'utf8')
      }
      expect(render('after', withTypstHighlights(code))).toBe(
        render('before', code),
      )
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
