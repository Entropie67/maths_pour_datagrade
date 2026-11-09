import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { emptyLibrary } from './library'
import {
  buildLibraryFile,
  parseLibraryFile,
  readLibraryFileText,
  zipLibraryFile,
} from './libraryFile'

const encode = (text: string) => new TextEncoder().encode(text).buffer

describe('fichier .mathalea zippé', () => {
  const file = buildLibraryFile(emptyLibrary(), new Map())

  it('écrit une archive ZIP compressée, relue à l’identique', async () => {
    const zipped = await zipLibraryFile(file)
    const bytes = new Uint8Array(zipped)
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe('PK')
    const text = await readLibraryFileText(zipped)
    expect(JSON.parse(text)).toEqual(file)
    expect(parseLibraryFile(text).library.sheets).toEqual([])
  })

  it('compresse le JSON', async () => {
    const long = {
      ...file,
      exportedAt: new Date(0).toISOString(),
      folders: Array.from({ length: 500 }, (_, i) => ({
        id: `dossier-${i}`,
        name: 'Dossier',
        parentId: null,
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
      })),
    }
    const zipped = await zipLibraryFile(long)
    expect(zipped.byteLength).toBeLessThan(JSON.stringify(long).length / 2)
  })

  it('continue à lire un ancien fichier en JSON seul', async () => {
    const json = JSON.stringify(file)
    expect(await readLibraryFileText(encode(json))).toBe(json)
  })

  it('renvoie le texte tel quel pour un fichier vide ou non zippé', async () => {
    expect(await readLibraryFileText(new ArrayBuffer(0))).toBe('')
    expect(await readLibraryFileText(encode('{"a":1}'))).toBe('{"a":1}')
  })

  it('refuse une archive illisible ou sans sauvegarde', async () => {
    const message = 'Ce fichier n’est pas une sauvegarde MathALÉA lisible.'
    await expect(readLibraryFileText(encode('PK abîmé'))).rejects.toThrow(
      message,
    )
    const other = new JSZip()
    other.file('autre.txt', 'bonjour')
    await expect(
      readLibraryFileText(await other.generateAsync({ type: 'arraybuffer' })),
    ).rejects.toThrow(message)
  })
})
