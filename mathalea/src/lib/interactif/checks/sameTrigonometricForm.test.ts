// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { seq } from './combinators'
import { sameTrigonometricForm } from './sameTrigonometricForm'

const compare = seq([sameTrigonometricForm()])
const reponse =
  '2\\sqrt{3}\\left(\\cos\\left(\\dfrac{5\\pi}{6}\\right)+\\mathrm{i}\\sin\\left(\\dfrac{5\\pi}{6}\\right)\\right)'
const accepted = (saisie: string) =>
  expect(compare(saisie, reponse).isOk, saisie).toBe(true)
const refused = (saisie: string, feedback?: string) => {
  const result = compare(saisie, reponse)
  expect(result.isOk, saisie).toBe(false)
  if (feedback != null) expect(result.feedback).toContain(feedback)
}

describe('sameTrigonometricForm', () => {
  it('accepts the expected form with equivalent LaTeX', () => {
    accepted(reponse)
    accepted('2\\sqrt3(\\cos(\\frac{5\\pi}{6})+i\\sin(\\frac{5\\pi}{6}))')
    accepted(
      '2\\sqrt{3}\\left(\\cos\\frac{5\\pi}{6}+\\imaginaryI\\sin\\frac{5\\pi}{6}\\right)',
    )
  })

  it('accepts the output of the complex keyboard', () => {
    accepted(
      '2\\sqrt{3}\\left(\\cos(\\frac{5\\pi}{6})+{\\mathrm{i}}\\sin(\\frac{5\\pi}{6})\\right)',
    )
  })

  it('refuses a wrong modulus or argument', () => {
    refused(
      '2\\left(\\cos\\left(\\frac{5\\pi}{6}\\right)+i\\sin\\left(\\frac{5\\pi}{6}\\right)\\right)',
      'module',
    )
    refused(
      '2\\sqrt{3}\\left(\\cos\\left(\\frac{\\pi}{6}\\right)+i\\sin\\left(\\frac{\\pi}{6}\\right)\\right)',
      'argument',
    )
  })

  it('requires the same argument in cosine and sine', () => {
    refused(
      '2\\sqrt{3}\\left(\\cos\\left(\\frac{5\\pi}{6}\\right)+i\\sin\\left(\\frac{\\pi}{6}\\right)\\right)',
      'même argument',
    )
  })

  it('accepts equivalent writings of the modulus and the argument', () => {
    accepted(
      '\\sqrt{12}\\left(\\cos\\left(\\frac{5\\pi}{6}\\right)+i\\sin\\left(\\frac{5\\pi}{6}\\right)\\right)',
    )
    accepted(
      '2\\sqrt{3}\\left(\\cos\\left(\\pi-\\frac{\\pi}{6}\\right)+i\\sin\\left(\\pi-\\frac{\\pi}{6}\\right)\\right)',
    )
  })

  it('omits the modulus 1 and the null cosine term', () => {
    const attendu =
      '1\\left(\\cos\\left(\\dfrac{\\pi}{2}\\right)+\\mathrm{i}\\sin\\left(\\dfrac{\\pi}{2}\\right)\\right)'
    const verifie = (saisie: string) =>
      seq([sameTrigonometricForm()])(saisie, attendu).isOk
    for (const saisie of [
      attendu,
      '\\cos\\left(\\frac{\\pi}{2}\\right)+i\\sin\\left(\\frac{\\pi}{2}\\right)',
      '\\left(\\cos\\frac{\\pi}{2}+i\\sin\\frac{\\pi}{2}\\right)',
      'i\\sin\\left(\\frac{\\pi}{2}\\right)',
      '1\\times i\\sin\\left(\\frac{\\pi}{2}\\right)',
      '1\\left(i\\sin\\left(\\frac{\\pi}{2}\\right)\\right)',
    ]) {
      expect(verifie(saisie), saisie).toBe(true)
    }
    expect(verifie('i\\sin\\left(\\frac{\\pi}{3}\\right)')).toBe(false)
    expect(verifie('2i\\sin\\left(\\frac{\\pi}{2}\\right)')).toBe(false)
  })

  it('omits the null sine term', () => {
    const attendu =
      '3\\left(\\cos\\left(\\pi\\right)+\\mathrm{i}\\sin\\left(\\pi\\right)\\right)'
    expect(seq([sameTrigonometricForm()])('3\\cos(\\pi)', attendu).isOk).toBe(
      true,
    )
  })

  it('accepts an outer parenthesis left unclosed', () => {
    const attendu =
      '2\\left(\\cos\\left(-\\dfrac{\\pi}{3}\\right)+\\mathrm{i}\\sin\\left(-\\dfrac{\\pi}{3}\\right)\\right)'
    expect(
      seq([sameTrigonometricForm()])(
        '2(\\cos\\left(-\\frac{\\pi}{3}\\right)+{\\mathrm{i}}\\sin\\left(-\\frac{\\pi}{3}\\right)',
        attendu,
      ).isOk,
    ).toBe(true)
  })

  it('requires both terms when none is null', () => {
    refused('2\\sqrt{3}i\\sin\\left(\\frac{5\\pi}{6}\\right)')
    refused('2\\sqrt{3}\\cos\\left(\\frac{5\\pi}{6}\\right)')
  })

  it('refuses an algebraic form', () => {
    refused('-3+\\sqrt{3}i', 'cos')
  })
})
