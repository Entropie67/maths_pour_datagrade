import { fireEvent, render, screen } from '@testing-library/svelte/svelte5'
import { exercicesParams } from '../../../../../lib/stores/generalStore'
import { getMockInterfacesParams } from '../../../../../lib/types.mock'
import { randint } from '../../../../../modules/outils'
import BoutonMonter from './BoutonMonter.svelte'

describe('BoutonMonter Component', () => {
  test('should be displayed', () => {
    const index = randint(1, 50)
    render(BoutonMonter, { indice: index })

    const button = screen.getByRole('button')
    expect(button.classList.contains('hidden')).toBe(false)
  })
  test('should not be displayed', () => {
    const index = 0
    render(BoutonMonter, { indice: index })

    const button = screen.queryByRole('button')
    if (button !== null) {
      expect(button.classList.contains('hidden')).toBe(true)
    }
  })
  test('should move exercise one step up', () => {
    const exercicesNb = randint(2, 50)
    const exercices = getMockInterfacesParams(exercicesNb)

    exercicesParams.set(exercices)
    const clickedIndex = randint(1, exercicesNb - 1)
    render(BoutonMonter, { indice: clickedIndex })
    const button = screen.getByRole('button')
    fireEvent.click(button)
    for (let i = 0; i < exercices.length; i++) {
      if (i === clickedIndex) expect(exercices[i].uuid).toBe(`uuid${i - 1}`)
      else if (i === clickedIndex - 1)
        expect(exercices[i].uuid).toBe(`uuid${i + 1}`)
      else expect(exercices[i].uuid).toBe(`uuid${i}`)
    }
  })
})
