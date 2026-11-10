import { describe, expect, it } from 'vitest'
import { estRetournee, parseQrPayload, pivoter180 } from './qr'
import { OMR_QR_VERSION } from './omrTypstTemplate'
import type { GrayImage } from './omrTypes'

describe('parseQrPayload', () => {
  it('lit un identifiant de feuille bien formé', () => {
    expect(parseQrPayload(`${OMR_QR_VERSION}|SUJ7|c03|2`)).toEqual({
      sujetId: 'SUJ7',
      copieId: 'c03',
      page: 2,
    })
  })

  it('écarte un QR-code étranger plutôt que d’en tirer une copie', () => {
    // un autocollant, un QR d'un autre logiciel, un lien collé sur la copie
    expect(parseQrPayload('https://coopmaths.fr/alea')).toBeNull()
    expect(parseQrPayload('M0|SUJ7|c03|2')).toBeNull()
    expect(parseQrPayload('')).toBeNull()
  })

  it('refuse un numéro de page absurde', () => {
    expect(parseQrPayload(`${OMR_QR_VERSION}|SUJ7|c03|0`)).toBeNull()
    expect(parseQrPayload(`${OMR_QR_VERSION}|SUJ7|c03|deux`)).toBeNull()
    expect(parseQrPayload(`${OMR_QR_VERSION}|SUJ7|c03|1.5`)).toBeNull()
  })

  it('refuse un sujet ou une copie vide', () => {
    expect(parseQrPayload(`${OMR_QR_VERSION}||c03|1`)).toBeNull()
    expect(parseQrPayload(`${OMR_QR_VERSION}|SUJ7||1`)).toBeNull()
  })

  it('refuse un nombre de champs inattendu', () => {
    expect(parseQrPayload(`${OMR_QR_VERSION}|SUJ7|c03`)).toBeNull()
    expect(parseQrPayload(`${OMR_QR_VERSION}|SUJ7|c03|1|extra`)).toBeNull()
  })
})

describe('estRetournee', () => {
  it('juge sur la moitié de page où se trouve le QR-code', () => {
    // le QR est imprimé en haut : le retrouver en bas signale une feuille
    // enfournée à l'envers — un lecteur de QR, lui, décode les deux sens
    expect(estRetournee({ x: 1000, y: 100 }, 1754)).toBe(false)
    expect(estRetournee({ x: 200, y: 1650 }, 1754)).toBe(true)
  })
})

describe('pivoter180', () => {
  it('renverse l’image sans en perdre un pixel', () => {
    const image: GrayImage = {
      width: 3,
      height: 2,
      data: new Uint8Array([1, 2, 3, 4, 5, 6]),
    }
    expect([...pivoter180(image).data]).toEqual([6, 5, 4, 3, 2, 1])
  })

  it('est sa propre réciproque', () => {
    const image: GrayImage = {
      width: 4,
      height: 3,
      data: new Uint8Array([...Array(12).keys()]),
    }
    expect([...pivoter180(pivoter180(image)).data]).toEqual([...image.data])
  })
})
