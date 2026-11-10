import { describe, expect, it } from 'vitest'
import {
  appliqueToucheAuChampTexte,
  champAvecClavierFocalise,
} from './champTexteClavier'

function champ(valeur: string, curseur = valeur.length) {
  const input = document.createElement('input')
  input.type = 'text'
  input.value = valeur
  input.setSelectionRange(curseur, curseur)
  return input
}

describe('appliqueToucheAuChampTexte', () => {
  it('insère le texte de la touche à la place du curseur', () => {
    const input = champ('52', 1)
    appliqueToucheAuChampTexte(input, { display: '$,$', insert: ',' })
    expect(input.value).toBe('5,2')
    expect(input.selectionStart).toBe(2)
  })

  it('efface le caractère avant le curseur', () => {
    const input = champ('5,2')
    appliqueToucheAuChampTexte(input, {
      display: '⌫',
      command: ['performWithFeedback', 'deleteBackward'],
    })
    expect(input.value).toBe('5,')
  })

  it('déplace le curseur avec les flèches', () => {
    const input = champ('AB')
    appliqueToucheAuChampTexte(input, {
      display: '<',
      command: ['performWithFeedback', 'moveToPreviousChar'],
    })
    expect(input.selectionStart).toBe(1)
  })

  it('respecte la longueur maximale du champ', () => {
    const input = champ('AB')
    input.maxLength = 2
    appliqueToucheAuChampTexte(input, { display: 'C', insert: 'C' })
    expect(input.value).toBe('AB')
  })
})

describe('champAvecClavierFocalise', () => {
  it('reconnaît un champ texte relié au clavier', () => {
    const input = champ('')
    expect(champAvecClavierFocalise(input)).toBe(false)
    input.dataset.clavierVirtuel = 'true'
    expect(champAvecClavierFocalise(input)).toBe(true)
  })
})
