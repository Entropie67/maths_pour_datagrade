import { describe, expect, it } from 'vitest'
import { getKeyboardBlocks } from './loaders'

describe('getKeyboardBlocks', () => {
  it('attribut data-keyboard absent : clavier par défaut', () => {
    expect(getKeyboardBlocks(undefined)).toEqual([
      'numbers',
      'fullOperations',
      'variables',
    ])
  })

  it('data-keyboard="" (clavierEntierementPersonnalisable) : aucun bloc', () => {
    expect(getKeyboardBlocks('')).toEqual([])
  })

  it('data-keyboard renseigné : ses blocs', () => {
    expect(getKeyboardBlocks('numbers basicOperations')).toEqual([
      'numbers',
      'basicOperations',
    ])
  })
})
