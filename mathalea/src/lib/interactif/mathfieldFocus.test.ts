import { describe, expect, it } from 'vitest'
import { isMathfieldFocused } from './mathfieldFocus'

describe('isMathfieldFocused', () => {
  it('returns true when the active element is a math-field in the main document', () => {
    const activeElement = document.createElement('math-field')

    expect(isMathfieldFocused(activeElement)).toBe(true)
  })

  it('returns true when the active element is a multi-mathfield host with a focused math-field in its shadow root', () => {
    const host = document.createElement('multi-mathfield')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const shadowMathfield = document.createElement('math-field')
    shadowRoot.appendChild(shadowMathfield)
    Object.defineProperty(shadowRoot, 'activeElement', {
      configurable: true,
      get: () => shadowMathfield,
    })

    expect(isMathfieldFocused(host)).toBe(true)
  })

  it('returns false when the active element is not a math-field and no shadow-root math-field has focus', () => {
    const input = document.createElement('input')

    expect(isMathfieldFocused(input)).toBe(false)
  })
})
