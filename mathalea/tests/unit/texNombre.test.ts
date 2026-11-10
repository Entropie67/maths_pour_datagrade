import { describe, expect, it } from 'vitest'
import { texNombre } from '../../src/lib/outils/texNombre'

describe('texNombre : séparateurs de classes', () => {
  it.each<[number, string]>([
    [0, '0'],
    [123, '123'],
    [1234, '1\\,234'],
    [12345, '12\\,345'],
    [683565, '683\\,565'],
    [1281402, '1\\,281\\,402'],
    [12345678, '12\\,345\\,678'],
    [123456789, '123\\,456\\,789'],
    [-1281402, '-1\\,281\\,402'],
    [12345.6789, '12\\,345,678\\,9'],
    [0.12345678, '0,123\\,456\\,78'],
  ])('formater %s sans regrouper deux fois les chiffres', (value, expected) => {
    expect(texNombre(value)).toBe(expected)
  })
})
