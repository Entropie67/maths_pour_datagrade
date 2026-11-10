import { expect, test } from 'vitest'
import Grandeur from '../../src/modules/Grandeur'

const l1 = new Grandeur(12, 'km')
const l2 = new Grandeur(12, 'mm')
const w = new Grandeur(1, 'W')
const l3 = Grandeur.fromString('12,345~\\text{cm}')

test('Utilisation de la classe grandeur', () => {
  expect(l1.convertirEn('cm').mesure).toBe(1200000)
  expect(l1.convertirEn('Mm').mesure).toBe(0.012)
  expect(l1.convertirEn('mm').toString()).toBe('12 000 000\u202fmm')
  expect(l1.convertirEn('mm').toTex()).toBe('12\\,000\\,000~\\text{mm}')

  expect(l2.convertirEn('cm').mesure).toBe(1.2)
  expect(w.convertirEn('MW').mesure).toBe(0.000001)
  expect(w.convertirEn('GW').toString()).toBe('0,000 000 001\u202fGW')

  expect(l3.convertirEn('m').mesure).toBe(0.12345)
  expect(l3.estUneApproximation(new Grandeur(11.4, 'cm'), 1)).toBe(true)

  expect(
    Grandeur.fromString('13cm').estEgal(Grandeur.fromString('130\\,mm')),
  ).toBe(true)
  expect(Grandeur.fromString('1 ha').convertirEn('m^2').mesure).toBe(10000)
})
