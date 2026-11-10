import { describe, expect, it } from 'vitest'
import { mathaleaHandleStringFromUrl } from './mathalea'

describe('conversion des paramètres d’URL', () => {
  it('conserve les zéros initiaux des réglages textuels', () => {
    expect(mathaleaHandleStringFromUrl('01234')).toBe('01234')
    expect(mathaleaHandleStringFromUrl('00000')).toBe('00000')
  })

  it('convertit les nombres usuels et les booléens', () => {
    expect(mathaleaHandleStringFromUrl('0')).toBe(0)
    expect(mathaleaHandleStringFromUrl('1234')).toBe(1234)
    expect(mathaleaHandleStringFromUrl('true')).toBe(true)
    expect(mathaleaHandleStringFromUrl('false')).toBe(false)
    expect(mathaleaHandleStringFromUrl('1-2')).toBe('1-2')
  })
})
