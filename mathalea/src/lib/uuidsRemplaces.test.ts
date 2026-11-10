import { describe, expect, it } from 'vitest'
import { uuidCourant, uuidNouvelleVersion } from './uuidsRemplaces'

const connus = { aaaaa: '1e/X.ts', bbbbb: '1e/X-old.ts', ccccc: '1e/Y.ts' }

describe('uuidNouvelleVersion', () => {
  it('propose le successeur même si le fichier archivé existe', () => {
    expect(uuidNouvelleVersion('bbbbb', connus, { bbbbb: 'aaaaa' })).toBe(
      'aaaaa',
    )
  })

  it('suit les remplacements jusqu’à la dernière version', () => {
    expect(
      uuidNouvelleVersion('bbbbb', connus, { bbbbb: 'aaaaa', aaaaa: 'ccccc' }),
    ).toBe('ccccc')
  })

  it('ne propose rien sans successeur disponible ou en cas de cycle', () => {
    const tables: Record<string, string | null>[] = [
      {},
      { bbbbb: null },
      { bbbbb: 'absent' },
      { bbbbb: 'aaaaa', aaaaa: 'bbbbb' },
    ]
    for (const remplaces of tables) {
      expect(uuidNouvelleVersion('bbbbb', connus, remplaces)).toBeUndefined()
    }
  })
})

describe('uuidCourant', () => {
  it('garde un uuid qui a encore un fichier, même si la table le remplace', () => {
    expect(uuidCourant('bbbbb', connus, { bbbbb: 'aaaaa' })).toBe('bbbbb')
  })

  it('redirige un uuid sans fichier vers la version courante', () => {
    expect(uuidCourant('ddddd', connus, { ddddd: 'aaaaa' })).toBe('aaaaa')
  })

  it('suit une chaîne de remplacements', () => {
    expect(
      uuidCourant('eeeee', connus, { eeeee: 'ddddd', ddddd: 'ccccc' }),
    ).toBe('ccccc')
  })

  it('renvoie l’uuid inchangé quand il est inconnu ou supprimé (null)', () => {
    expect(uuidCourant('zzzzz', connus, {})).toBe('zzzzz')
    expect(uuidCourant('ddddd', connus, { ddddd: null })).toBe('ddddd')
  })

  it('ne boucle pas sur un cycle', () => {
    expect(
      uuidCourant('ddddd', connus, { ddddd: 'eeeee', eeeee: 'ddddd' }),
    ).toMatch(/^[de]{5}$/)
  })
})
