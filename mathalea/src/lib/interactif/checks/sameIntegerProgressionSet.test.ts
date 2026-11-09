// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { all } from './combinators'
import { sameIntegerProgressionSet } from './sameIntegerProgressionSet'

describe('sameIntegerProgressionSet', () => {
  it('accepts affine expressions describing the same set over Z', () => {
    expect(all([sameIntegerProgressionSet()])('2x+2', '2x')).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(
      all([sameIntegerProgressionSet()])('2k\\pi', '2k\\pi-2\\pi'),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(
      all([sameIntegerProgressionSet()])('2k*pi', '2*pi*k-2*pi'),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(
      all([sameIntegerProgressionSet()])('-1/2pi+kpi', '1/2pi+kpi'),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(
      all([sameIntegerProgressionSet()])('-1/2 pi + k pi', '1/2 pi + k pi'),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(
      all([sameIntegerProgressionSet()])('-1/2*pi+k*pi', '1/2*pi+k*pi'),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(
      all([sameIntegerProgressionSet()])(
        '-\\frac{1}{2}\\pi+k\\pi',
        '\\frac{1}{2}\\pi+k\\pi',
      ),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(
      all([sameIntegerProgressionSet()])(
        '-\\frac12\\pi+k\\pi',
        '\\frac12\\pi+k\\pi',
      ),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(
      all([sameIntegerProgressionSet()])(
        '\\frac{-1}{2}\\pi+k\\pi',
        '\\frac{1}{2}\\pi+k\\pi',
      ),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(
      all([sameIntegerProgressionSet({ variable: 'n' })])('4n+1', '4n-3'),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })
  })

  it('refuses affine expressions describing different sets over Z', () => {
    expect(all([sameIntegerProgressionSet()])('2x+1', '2x+2')).toMatchObject({
      isOk: false,
      score: 0,
    })
    expect(all([sameIntegerProgressionSet()])('2x', '4x')).toMatchObject({
      isOk: false,
      score: 0,
    })
    expect(
      all([sameIntegerProgressionSet()])('2k\\pi', '2k\\pi+\\pi'),
    ).toMatchObject({
      isOk: false,
      score: 0,
    })
  })

  it('accepts the equivalent zero-set answer with semicolon or comma branches', () => {
    const compare = all([
      sameIntegerProgressionSet({
        variable: 'k',
        allowMultipleExpressions: true,
      }),
    ])

    expect(
      compare(
        'S=\\left\\{\\frac{4\\pi}{3}+4k\\pi;-\\frac{2\\pi}{3}+4k\\pi\\mid k\\in\\mathbb{Z}\\right\\}',
        '-\\frac{2\\pi}{3}+2k\\pi',
      ),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })

    expect(
      compare(
        'S=\\left\\{\\frac{4\\pi}{3}+4k\\pi,-\\frac{2\\pi}{3}+4k\\pi\\mid k\\in\\mathbb{Z}\\right\\}',
        '-\\frac{2\\pi}{3}+2k\\pi',
      ),
    ).toMatchObject({
      isOk: true,
      score: 1,
    })
  })

  it('refuses an incomplete union of progressions', () => {
    expect(
      all([
        sameIntegerProgressionSet({
          variable: 'k',
          allowMultipleExpressions: true,
        }),
      ])('\\frac{4\\pi}{3}+4k\\pi', '-\\frac{2\\pi}{3}+2k\\pi'),
    ).toMatchObject({
      isOk: false,
      score: 0,
    })
  })

  it('accepts an answer ending with a fraction of k', () => {
    const compare = all([
      sameIntegerProgressionSet({
        variable: 'k',
        allowMultipleExpressions: true,
      }),
    ])

    expect(
      compare(
        '-\\dfrac{\\pi}{6}-\\dfrac{2k\\pi}{3}',
        '-\\dfrac{\\pi}{6}-\\dfrac{2k\\pi}{3}',
      ),
    ).toMatchObject({ isOk: true, score: 1 })
    expect(
      compare(
        '\\frac{\\pi}{2}+\\frac{2k\\pi}{3}',
        '-\\dfrac{\\pi}{6}-\\dfrac{2k\\pi}{3}',
      ),
    ).toMatchObject({ isOk: true, score: 1 })
    expect(compare('\\frac{k\\pi}{2}', '-\\dfrac{k\\pi}{2}')).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(compare('\\frac{k\\pi}{4}', '-\\dfrac{k\\pi}{2}')).toMatchObject({
      isOk: false,
      score: 0,
    })
  })

  it('compares families whose offsets differ by less than a period', () => {
    const compare = all([
      sameIntegerProgressionSet({
        variable: 'n',
        allowMultipleExpressions: true,
      }),
    ])

    expect(compare('2n\\pi;\\pi+2n\\pi', '2n\\pi;\\pi+2n\\pi')).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(compare('n\\pi', '2n\\pi;\\pi+2n\\pi')).toMatchObject({
      isOk: true,
      score: 1,
    })
    expect(compare('2n\\pi', '2n\\pi;\\pi+2n\\pi')).toMatchObject({
      isOk: false,
      score: 0,
    })
    expect(
      compare(
        '\\frac{\\pi}{6}+2n\\pi;\\frac{5\\pi}{6}+2n\\pi',
        '\\dfrac{\\pi}{6}+n\\pi',
      ),
    ).toMatchObject({ isOk: false, score: 0 })
  })
})
