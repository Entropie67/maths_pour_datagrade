import { beforeEach, describe, expect, it } from 'vitest'
import { emptyLibrary } from '../mesFeuilles/library'
import { buildLibraryFile, parseLibraryFile } from '../mesFeuilles/libraryFile'
import {
  emptySettings,
  hasSettings,
  importSettings,
  loadSettings,
  mergeSettings,
  settingsCoveredBy,
  settingsFingerprint,
  withoutSecrets,
} from '../mesFeuilles/settings'
import { buildSyncFile, mergeSyncDocuments } from '../mesFeuilles/sync'
import {
  clearEdurlToken,
  emptyEdurlToken,
  EDURL_TOKEN_KEY,
  getEdurlToken,
  loadEdurlToken,
  mergeEdurlToken,
  readEdurlToken,
  setEdurlToken,
} from './token'

const OLD = '2026-01-01T00:00:00.000Z'
const NEW = '2026-06-01T00:00:00.000Z'

beforeEach(() => {
  window.localStorage.clear()
})

describe('Jeton edurl.fr : stockage', () => {
  it('garde le jeton sous la clé historique, avec sa date', () => {
    expect(getEdurlToken()).toBeNull()
    expect(setEdurlToken('  abc-123  ', NEW)).toBe(true)
    expect(window.localStorage.getItem(EDURL_TOKEN_KEY)).toBe('abc-123')
    expect(loadEdurlToken()).toEqual({ value: 'abc-123', updatedAt: NEW })
  })

  it('reprend un jeton enregistré avant l’ajout de la date', () => {
    window.localStorage.setItem(EDURL_TOKEN_KEY, 'ancien')
    expect(loadEdurlToken().value).toBe('ancien')
    expect(getEdurlToken()).toBe('ancien')
  })

  it('refuse un jeton vide', () => {
    expect(setEdurlToken('   ')).toBe(false)
    expect(getEdurlToken()).toBeNull()
  })

  it('oublie le jeton en gardant la date de l’oubli', () => {
    setEdurlToken('abc', OLD)
    clearEdurlToken(NEW)
    expect(loadEdurlToken()).toEqual({ value: null, updatedAt: NEW })
  })
})

describe('Jeton edurl.fr : fichier et fusion', () => {
  it('relit un jeton de fichier et écarte les valeurs invalides', () => {
    expect(readEdurlToken({ value: 'abc', updatedAt: NEW })).toEqual({
      value: 'abc',
      updatedAt: NEW,
    })
    expect(readEdurlToken({ value: 12 })).toEqual(emptyEdurlToken())
    expect(readEdurlToken('abc')).toEqual(emptyEdurlToken())
    expect(readEdurlToken({ value: 'abc', updatedAt: 'hier' }).value).toBe(
      'abc',
    )
  })

  it('ne reprend que le jeton d’un fichier plus récent', () => {
    const local = { value: 'local', updatedAt: NEW }
    expect(
      mergeEdurlToken(local, { value: 'fichier', updatedAt: OLD }).token,
    ).toEqual(local)
    expect(
      mergeEdurlToken(local, { value: 'fichier', updatedAt: NEW }).imported,
    ).toBe(0)
    expect(
      mergeEdurlToken(local, {
        value: 'fichier',
        updatedAt: '2026-12-01T00:00:00.000Z',
      }).token.value,
    ).toBe('fichier')
  })

  it('reprend le jeton du fichier quand il n’y en a pas ici', () => {
    const merged = mergeEdurlToken(emptyEdurlToken(), {
      value: 'fichier',
      updatedAt: OLD,
    })
    expect(merged.token.value).toBe('fichier')
    expect(merged.imported).toBe(1)
  })

  it('un fichier sans jeton n’efface rien, un jeton oublié plus récemment non plus', () => {
    const local = { value: 'local', updatedAt: NEW }
    expect(mergeEdurlToken(local, emptyEdurlToken()).token).toEqual(local)
    const forgotten = { value: null, updatedAt: NEW }
    expect(
      mergeEdurlToken(forgotten, { value: 'fichier', updatedAt: OLD }).token,
    ).toEqual(forgotten)
  })

  it('écrit le jeton dans le fichier, même sans autre réglage', () => {
    setEdurlToken('abc', NEW)
    const settings = loadSettings()
    expect(hasSettings(settings)).toBe(false)
    const file = buildLibraryFile(emptyLibrary(), new Map(), null, settings)
    const parsed = parseLibraryFile(JSON.stringify(file))
    expect(parsed.settings?.edurlToken).toEqual({
      value: 'abc',
      updatedAt: NEW,
    })
  })

  it('n’écrit pas de réglages dans un fichier sans jeton ni réglage', () => {
    const file = buildLibraryFile(
      emptyLibrary(),
      new Map(),
      null,
      loadSettings(),
    )
    expect(file.settings).toBeUndefined()
  })

  it('importe le jeton d’un fichier et le compte parmi les réglages', () => {
    const imported = {
      ...emptySettings(),
      edurlToken: { value: 'f', updatedAt: NEW },
    }
    expect(importSettings(imported)).toBe(1)
    expect(getEdurlToken()).toBe('f')
    expect(importSettings(imported)).toBe(0)
  })

  it('compte le jeton dans l’empreinte et la couverture du fichier', () => {
    const local = loadSettings()
    expect(settingsFingerprint(local)).toBe('')
    setEdurlToken('abc', NEW)
    const withToken = loadSettings()
    expect(settingsFingerprint(withToken)).not.toBe('')
    expect(settingsCoveredBy(emptySettings(), withToken)).toBe(false)
    expect(settingsCoveredBy(withToken, withToken)).toBe(true)
  })
})

describe('Jeton edurl.fr : jamais envoyé au serveur', () => {
  const token = { value: 'secret', updatedAt: NEW }

  it('retire le jeton du document de synchronisation', () => {
    const settings = { ...emptySettings(), edurlToken: token }
    expect(withoutSecrets(settings).edurlToken).toEqual(emptyEdurlToken())
    const file = buildSyncFile({ library: emptyLibrary(), settings })
    expect(JSON.stringify(file)).not.toContain('secret')
  })

  it('garde le jeton de l’appareil quand le serveur n’en a pas', () => {
    const local = {
      library: emptyLibrary(),
      settings: { ...emptySettings(), edurlToken: token },
    }
    const remote = { library: emptyLibrary(), settings: emptySettings() }
    expect(mergeSyncDocuments(local, remote).settings.edurlToken).toEqual(token)
  })

  it('n’adopte pas en synchronisation un jeton venu du serveur', () => {
    const merged = mergeSettings(
      emptySettings(),
      { ...emptySettings(), edurlToken: token },
      { sync: true },
    )
    expect(merged.settings.edurlToken).toEqual(emptyEdurlToken())
    expect(merged.imported).toBe(0)
  })
})
