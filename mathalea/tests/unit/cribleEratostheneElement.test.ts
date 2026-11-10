// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { CribleEratostheneElement } from '../../src/lib/customElements/CribleEratostheneElement'

describe('CribleEratostheneElement', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('laisse le sélecteur sur le choix initial et masque le 1', () => {
    const element = document.createElement(
      CribleEratostheneElement.elementTag,
    ) as CribleEratostheneElement
    document.body.appendChild(element)

    const selecteur = element.querySelector('select')
    const cellules = [
      ...element.querySelectorAll('.crible-eratosthene__grille > button'),
    ]

    expect(selecteur?.value).toBe('')
    expect(selecteur?.options[1]?.textContent).toBe(
      'Colorier les multiples de 2 supérieurs à 2',
    )
    expect(cellules).toHaveLength(100)
    expect(cellules[0]?.textContent).toBe('')
    expect(cellules[9]?.textContent).toBe('10')
    expect(cellules.at(-1)?.textContent).toBe('100')
    expect(cellules.some((cellule) => cellule.textContent === '1')).toBe(false)
  })

  it('commence à colorier le multiple diviseur fois 2', () => {
    vi.useFakeTimers()
    const element = document.createElement(
      CribleEratostheneElement.elementTag,
    ) as CribleEratostheneElement
    document.body.appendChild(element)

    const selecteur = element.querySelector('select') as HTMLSelectElement
    selecteur.value = '2'
    selecteur.dispatchEvent(new Event('change'))

    const cellules = [
      ...element.querySelectorAll('.crible-eratosthene__grille > button'),
    ]
    expect(cellules[0]?.style.background).toBe('')
    expect(cellules[3]?.style.background).not.toBe('white')
  })

  it('adapte la grille, les choix et les nombres restants au maximum', () => {
    vi.useFakeTimers()
    const element = document.createElement(
      CribleEratostheneElement.elementTag,
    ) as CribleEratostheneElement
    element.setAttribute('max', '12')
    document.body.appendChild(element)

    const selecteur = element.querySelector('select') as HTMLSelectElement
    const cellules = element.querySelectorAll(
      '.crible-eratosthene__grille > button',
    )
    expect(cellules).toHaveLength(12)
    expect(selecteur.options).toHaveLength(11)
    expect(selecteur.options[10]?.textContent).toBe(
      'Colorier les multiples de 11 supérieurs à 11',
    )

    selecteur.value = '3'
    selecteur.dispatchEvent(new Event('change'))
    const restants = element.querySelector('.crible-eratosthene__restants')
    expect(restants?.textContent).toContain('Nombres restants')
    const nombresAffiches = [
      ...(restants?.querySelectorAll('annotation') ?? []),
    ].map((annotation) => annotation.textContent)
    expect(nombresAffiches.slice(0, 5)).toEqual(['2', '3', '4', '5', '7'])
    expect(nombresAffiches.slice(-2)).toEqual(['11', '12'])
  })
})
