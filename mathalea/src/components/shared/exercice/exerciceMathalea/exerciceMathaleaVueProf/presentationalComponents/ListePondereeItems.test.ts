import { cleanup, render, screen } from '@testing-library/svelte/svelte5'
import { afterEach, expect, test } from 'vitest'
import ListePondereeItems from './ListePondereeItems.svelte'

const items = ['Intervalle', 'Inégalité', 'Droite graduée'].map(
  (label, index) => ({
    nom: String(index),
    label,
    poids: 1,
  }),
)
const idItem = (item: { nom: string }) => `choice-${item.nom}`
afterEach(cleanup)

test('verrouiller les choix cochés au minimum et permettre de rétablir le troisième', async () => {
  const { rerender } = render(ListePondereeItems, {
    items,
    idItem,
    minSelections: 2,
  })
  const fields = screen.getAllByRole('checkbox') as HTMLInputElement[]
  expect(fields.every((field) => !field.disabled)).toBe(true)
  await rerender({
    items: items.map((item, index) => ({
      ...item,
      poids: index === 0 ? 0 : 1,
    })),
  })
  expect(fields.map((field) => field.disabled)).toEqual([false, true, true])
  await rerender({ items })
  expect(fields.every((field) => !field.disabled)).toBe(true)
})

test('conserver la sélection libre sans contrainte explicite', () => {
  render(ListePondereeItems, { items: [items[0]], idItem })
  expect((screen.getByRole('checkbox') as HTMLInputElement).disabled).toBe(
    false,
  )
})
