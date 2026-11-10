import { expect, test } from 'vitest'
import Hms from '../../src/modules/Hms'

const t1 = new Hms({ hour: 12, minute: 34, second: 56 })
const t2 = new Hms({ hour: 12, minute: 35, second: 3 })
const t2Bis = Hms.fromString('12 h 35 min 3 s')
const t2Ter = Hms.fromString('45 303 s')
const t3 = new Hms({ hour: 1, minute: 70, second: 120 })

test('Utilisation de la classe Hms', () => {
  expect(t1.toString()).toBe('12 h 34 min 56 s')
  expect(t1.toString2()).toBe('12 h 34 min 56')
  expect(t2.isGreaterThan(t1)).toBe(true)
  expect(t2.substract(t1).toString()).toBe('7 s')
  expect(t1.add(t2).toString()).toBe('25 h 09 min 59 s')
  expect(t2.isTheSame(t2Bis)).toBe(true)
  expect(t2.toSeconds()).toBe(45303)
  expect(t2.toSecondsString()).toBe('45303 s')
  expect(t2Ter.isEqual(t2)).toBe(true)
  expect(t2Ter.isTheSame(t2)).toBe(false)
  expect(t3.normalize().toString2()).toBe('2 h 12')
})
