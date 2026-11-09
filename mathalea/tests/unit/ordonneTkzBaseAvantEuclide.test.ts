import { describe, expect, it } from 'vitest'
import { ordonneTkzBaseAvantEuclide } from '../../src/lib/Latex'

describe('ordonneTkzBaseAvantEuclide', () => {
  it('réordonne quand tkz-base est chargé après tkz-euclide', () => {
    const input = [
      '\\usepackage{tikz}',
      '\\usepackage{tkz-euclide}',
      '\\usepackage{amsmath}',
      '\\usepackage{tkz-base}',
    ].join('\n')
    expect(ordonneTkzBaseAvantEuclide(input)).toBe(
      [
        '\\usepackage{tikz}',
        '\\usepackage{tkz-base}',
        '\\usepackage{tkz-euclide}',
        '\\usepackage{amsmath}',
      ].join('\n'),
    )
  })

  it('ne touche rien quand l’ordre est déjà correct', () => {
    const input = [
      '\\usepackage{tkz-base}',
      '\\usepackage{tkz-euclide}',
      '\\usepackage{amsmath}',
    ].join('\n')
    expect(ordonneTkzBaseAvantEuclide(input)).toBe(input)
  })

  it('déduplique tkz-base et le place avant tkz-euclide', () => {
    const input = [
      '\\usepackage{tkz-base}',
      '\\usepackage{tkz-euclide}',
      '\\usepackage{tkz-base}',
    ].join('\n')
    const output = ordonneTkzBaseAvantEuclide(input)
    expect(output.match(/\\usepackage\{tkz-base\}/g)).toHaveLength(1)
    expect(output.match(/\\usepackage\{tkz-euclide\}/g)).toHaveLength(1)
    expect(output.indexOf('tkz-base')).toBeLessThan(output.indexOf('tkz-euclide'))
    expect(output).toBe(
      ['\\usepackage{tkz-base}', '\\usepackage{tkz-euclide}'].join('\n'),
    )
  })

  it('est un no-op si seul tkz-euclide est présent', () => {
    const input = ['\\usepackage{tikz}', '\\usepackage{tkz-euclide}'].join('\n')
    expect(ordonneTkzBaseAvantEuclide(input)).toBe(input)
  })

  it('est un no-op si seul tkz-base est présent', () => {
    const input = ['\\usepackage{tikz}', '\\usepackage{tkz-base}'].join('\n')
    expect(ordonneTkzBaseAvantEuclide(input)).toBe(input)
  })

  it('est un no-op si aucun des deux n’est présent', () => {
    const input = ['\\usepackage{tikz}', '\\usepackage{amsmath}'].join('\n')
    expect(ordonneTkzBaseAvantEuclide(input)).toBe(input)
  })
})
