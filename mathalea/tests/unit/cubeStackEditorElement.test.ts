import { describe, expect, it } from 'vitest'
import {
  areCubeStacksCongruent,
  parseCubeStackState,
  type CubeStackState,
} from '../../src/lib/customElements/CubeStackEditorElement'

const state = (coordinates: number[][]): CubeStackState => ({
  version: 1,
  grid: 12,
  cubes: coordinates.map(([x, y, z]) => ({ x, y, z, color: '#123456' })),
})

describe('areCubeStacksCongruent', () => {
  it('ignore la translation et les couleurs', () => {
    const translated = state([
      [5, 2, 7],
      [6, 2, 7],
      [6, 3, 7],
    ])
    translated.cubes.forEach((cube, index) => {
      cube.color = ['#fff', '#000', '#f00'][index]
    })
    expect(
      areCubeStacksCongruent(
        state([
          [0, 0, 0],
          [1, 0, 0],
          [1, 1, 0],
        ]),
        translated,
      ),
    ).toBe(true)
  })

  it("accepte une autre orientation dans l'espace", () => {
    expect(
      areCubeStacksCongruent(
        state([
          [0, 0, 0],
          [1, 0, 0],
          [2, 0, 0],
          [2, 1, 0],
        ]),
        state([
          [4, 0, 4],
          [4, 0, 5],
          [4, 0, 6],
          [4, 1, 6],
        ]),
      ),
    ).toBe(true)
  })

  it('refuse deux empilements non congruents', () => {
    expect(
      areCubeStacksCongruent(
        state([
          [0, 0, 0],
          [1, 0, 0],
          [2, 0, 0],
        ]),
        state([
          [0, 0, 0],
          [1, 0, 0],
          [1, 1, 0],
        ]),
      ),
    ).toBe(false)
  })

  it('compare correctement les positions par demi-pas', () => {
    expect(
      areCubeStacksCongruent(
        state([
          [0, 0, 0],
          [0.5, 0, 0],
        ]),
        state([
          [4, 2, 3],
          [4, 2.5, 3],
        ]),
      ),
    ).toBe(true)
  })
})

describe('parseCubeStackState', () => {
  it('lit le JSON de vision-espace et elimine les doublons', () => {
    expect(
      parseCubeStackState(
        '{"version":1,"grid":10,"cubes":[{"x":1,"y":0,"z":2},{"x":1,"y":0,"z":2}]}',
      ),
    ).toEqual({
      version: 1,
      grid: 10,
      cubes: [{ x: 1, y: 0, z: 2, color: '#3b82f6' }],
    })
  })

  it('accepte les coordonnées par demi-pas', () => {
    expect(
      parseCubeStackState({
        version: 1,
        grid: 10,
        cubes: [{ x: 1.5, y: 0, z: 2.5 }],
      }),
    ).toEqual({
      version: 1,
      grid: 10,
      cubes: [{ x: 1.5, y: 0, z: 2.5, color: '#3b82f6' }],
    })
  })

  it('refuse les coordonnées plus précises que le demi-pas', () => {
    expect(
      parseCubeStackState({
        version: 1,
        grid: 10,
        cubes: [{ x: 1.25, y: 0, z: 2 }],
      }),
    ).toBeNull()
  })
})
