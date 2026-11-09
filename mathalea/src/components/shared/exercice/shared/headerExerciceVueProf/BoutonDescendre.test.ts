import { fireEvent, render, screen } from '@testing-library/svelte/svelte5'
import { exercicesParams } from '../../../../../lib/stores/generalStore'
import { getMockInterfacesParams } from '../../../../../lib/types.mock'
import { randint } from '../../../../../modules/outils'
import BoutonDescendre from './BoutonDescendre.svelte'

describe('BoutonDescendre Component', () => {
  test('should be displayed', () => {
    const index = randint(0, 50)
    render(BoutonDescendre, {
      indice: index,
      indiceLastExercice: index + randint(1, 10),
    })

    const button = screen.getByRole('button')
    expect(button.classList.contains('hidden')).toBe(false)
  })
  test('should not be displayed', async () => {
    const index = randint(0, 50)
    render(BoutonDescendre, { indice: index, indiceLastExercice: index })

    const button = screen.queryByRole('button')
    if (button !== null) {
      expect(button.classList.contains('hidden')).toBe(true)
    }
  })
  test('should move exercise one step down', () => {
    const exercicesNb = randint(2, 50)
    const exercices = getMockInterfacesParams(exercicesNb)

    exercicesParams.set(exercices)
    const clickedIndex = randint(0, exercicesNb - 2)
    render(BoutonDescendre, {
      indice: clickedIndex,
      indiceLastExercice: exercices.length - 1,
    })
    const button = screen.getByRole('button')
    fireEvent.click(button)
    for (let i = 0; i < exercices.length; i++) {
      if (i === clickedIndex) expect(exercices[i].uuid).toBe(`uuid${i + 1}`)
      else if (i === clickedIndex + 1)
        expect(exercices[i].uuid).toBe(`uuid${i - 1}`)
      else expect(exercices[i].uuid).toBe(`uuid${i}`)
    }
  })
})
