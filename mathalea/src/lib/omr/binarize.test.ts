import { describe, expect, it } from 'vitest'
import {
  buildDarkIntegral,
  darkCount,
  darkRatio,
  otsuThreshold,
} from './binarize'
import type { GrayImage } from './omrTypes'

function imageDepuis(valeurs: number[][]): GrayImage {
  const height = valeurs.length
  const width = valeurs[0].length
  const data = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) data[y * width + x] = valeurs[y][x]
  }
  return { width, height, data }
}

describe('otsuThreshold', () => {
  it('sépare les deux modes d’une image bimodale', () => {
    const data = new Uint8Array(1000)
    data.fill(240, 0, 800)
    data.fill(20, 800)
    const seuil = otsuThreshold({ width: 100, height: 10, data })
    expect(seuil).toBeGreaterThan(20)
    expect(seuil).toBeLessThanOrEqual(240)
  })

  it('renvoie un seuil qui classe effectivement le mode sombre comme sombre', () => {
    // la convention `valeur < seuil` est partagée avec `buildDarkIntegral` :
    // un seuil qui exclurait le mode sombre rendrait toute la chaîne muette
    const data = new Uint8Array(1000)
    data.fill(240, 0, 800)
    data.fill(20, 800)
    const image = { width: 100, height: 10, data }
    const seuil = otsuThreshold(image)
    const integral = buildDarkIntegral(image, seuil)
    expect(darkCount(integral, 100, 10, 0, 0, 100, 10)).toBe(200)
  })

  it('reste dans les bornes sur une image uniforme', () => {
    const data = new Uint8Array(100)
    data.fill(255)
    const seuil = otsuThreshold({ width: 10, height: 10, data })
    expect(seuil).toBeGreaterThanOrEqual(0)
    expect(seuil).toBeLessThanOrEqual(255)
  })
})

describe('buildDarkIntegral et darkCount', () => {
  const image = imageDepuis([
    [0, 255, 0],
    [255, 0, 255],
    [0, 0, 255],
  ])
  const integral = buildDarkIntegral(image, 128)

  it('compte les pixels sombres comme un parcours naïf', () => {
    // référence : comptage direct sur tous les rectangles possibles
    for (let y0 = 0; y0 < 3; y0++) {
      for (let x0 = 0; x0 < 3; x0++) {
        for (let y1 = y0 + 1; y1 <= 3; y1++) {
          for (let x1 = x0 + 1; x1 <= 3; x1++) {
            let attendu = 0
            for (let y = y0; y < y1; y++) {
              for (let x = x0; x < x1; x++) {
                if (image.data[y * 3 + x] < 128) attendu++
              }
            }
            expect(darkCount(integral, 3, 3, x0, y0, x1, y1)).toBe(attendu)
          }
        }
      }
    }
  })

  it('rogne les coordonnées débordant de l’image', () => {
    expect(darkCount(integral, 3, 3, -5, -5, 99, 99)).toBe(5)
  })

  it('renvoie 0 pour un rectangle vide plutôt que NaN', () => {
    expect(darkRatio(integral, 3, 3, 2, 2, 2, 2)).toBe(0)
  })

  it('donne une proportion entre 0 et 1', () => {
    expect(darkRatio(integral, 3, 3, 0, 0, 3, 3)).toBeCloseTo(5 / 9, 10)
  })
})
