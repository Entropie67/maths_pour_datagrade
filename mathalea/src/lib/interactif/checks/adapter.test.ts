// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { all } from './combinators'
import { fromOptions } from './adapter'

describe('fromOptions', () => {
  it('wraps current fonctionComparaison options as a check', () => {
    const compare = all([fromOptions({ expressionsForcementReduites: true })])

    expect(compare('2x', 'x+x')).toMatchObject({
      isOk: true,
      score: 1,
      feedback: '',
      details: [{ name: 'fromOptions', passed: true }],
    })

    expect(compare('x+x', '2x')).toMatchObject({
      isOk: false,
      score: 0,
      feedback:
        "Cette expression est bien égale à celle attendue mais n'est pas assez réduite.",
      details: [{ name: 'fromOptions', passed: false }],
    })
  })

  it('accepts feedback and weight overrides', () => {
    const compare = all([
      fromOptions(
        { expressionsForcementReduites: true },
        {
          name: 'reduced',
          weight: 0.4,
          feedbackKo: "L'expression peut encore être réduite.",
        },
      ),
      fromOptions({}, { name: 'isEqual', weight: 0.6 }),
    ])

    expect(compare('x+x', '2x')).toMatchObject({
      isOk: false,
      score: 0.6,
      feedback: "L'expression peut encore être réduite.",
      details: [
        { name: 'reduced', passed: false },
        { name: 'isEqual', passed: true },
      ],
    })
  })

  it('fractionIrreductible: true option — refuses reducible fractions', () => {
    const compare = all([fromOptions({ fractionIrreductible: true })])

    expect(compare('\\dfrac{2}{4}', '\\dfrac{1}{2}')).toMatchObject({
      isOk: false,
      score: 0,
    })

    expect(compare('\\dfrac{1}{2}', '\\dfrac{1}{2}')).toMatchObject({
      isOk: true,
      score: 1,
    })
  })

  it('feedbackEnabled: false — feedback empty even when check fails', () => {
    const compare = all([
      fromOptions(
        { expressionsForcementReduites: true },
        { name: 'reduced', feedbackEnabled: false },
      ),
    ])

    const result = compare('x+x', '2x')
    expect(result.isOk).toBe(false)
    // feedbackEnabled: false suppresses the feedback
    expect(result.feedback).toBe('')
  })

  it('custom name appears in details', () => {
    const compare = all([fromOptions({}, { name: 'monCheck' })])

    const result = compare('2x', '2x')
    expect(result.details).toEqual([{ name: 'monCheck', passed: true }])
  })
})
