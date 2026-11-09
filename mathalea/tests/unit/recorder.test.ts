import { describe, expect, it } from 'vitest'

import { usesHostActivityProtocol } from '../../src/lib/recorder'

describe('usesHostActivityProtocol', () => {
  it.each(['flowmath', 'sesatheque'] as const)(
    'active le protocole piloté pour %s',
    (recorder) => {
      expect(usesHostActivityProtocol(recorder)).toBe(true)
    },
  )

  it.each(['capytale', 'labomep', 'moodle', 'anki', undefined] as const)(
    'ne l’active pas pour %s',
    (recorder) => {
      expect(usesHostActivityProtocol(recorder)).toBe(false)
    },
  )
})
