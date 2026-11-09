import { describe, expect, it } from 'vitest'
import { compareFormeCanonique } from './1AL20-1'

describe('compareFormeCanonique', () => {
  const answer = '1(x-1)^2+2'

  it('accepts the requested canonical form', () => {
    expect(compareFormeCanonique('(x-1)^2+2', answer)).toMatchObject({
      isOk: true,
    })
  })

  it('refuses an equivalent expression that expands the square', () => {
    expect(compareFormeCanonique('(x^2-2x+1)+2', answer)).toMatchObject({
      isOk: false,
      feedback:
        'La réponse doit être écrite sous la forme $a(x-\\alpha)^2+\\beta$.',
    })
  })

  it('keeps accepting a non-unit leading coefficient', () => {
    expect(compareFormeCanonique('-2(x+3)^2-4', '-2(x+3)^2-4')).toMatchObject({
      isOk: true,
    })
  })
})
