import { describe, expect, test } from 'vitest'
import { isHtmlDocumentText } from '../../src/lib/httpResponses'

describe('HTTP response helpers', () => {
  test('detects uppercase and lowercase HTML doctypes', () => {
    expect(isHtmlDocumentText('<!DOCTYPE html><html></html>')).toBe(true)
    expect(isHtmlDocumentText('\n<!doctype html><html></html>')).toBe(true)
  })

  test('does not reject LaTeX content', () => {
    expect(isHtmlDocumentText('\\begin{EXO}Texte\\end{EXO}')).toBe(false)
  })
})
