import { getMockInterfacesParams } from '../types.mock'
import { moveExercice } from './generalStore'

describe('moveExercice', () => {
  test('from first index to index 2', () => {
    const movedExercice1 = moveExercice([...getMockInterfacesParams(4)], 0, 2)
    expect(movedExercice1[0].uuid).toBe('uuid1')
    expect(movedExercice1[1].uuid).toBe('uuid2')
    expect(movedExercice1[2].uuid).toBe('uuid0')
    expect(movedExercice1[3].uuid).toBe('uuid3')
  })
  test('from last index to index 1', () => {
    const movedExercice2 = moveExercice([...getMockInterfacesParams(4)], 3, 1)
    expect(movedExercice2[0].uuid).toBe('uuid0')
    expect(movedExercice2[1].uuid).toBe('uuid3')
    expect(movedExercice2[2].uuid).toBe('uuid1')
    expect(movedExercice2[3].uuid).toBe('uuid2')
  })
})
