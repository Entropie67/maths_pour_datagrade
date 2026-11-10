import { describe, expect, it } from 'vitest'
import { encrypt } from '../components/urls'
import {
  addSelection,
  emptyLibrary,
  searchSelections,
  trashItems,
  restoreItems,
} from './library'
import { buildLibraryFile, parseLibraryFile } from './libraryFile'
import {
  defaultSelectionName,
  readSelectionLink,
  selectionUrl,
  selectionView,
} from './selectionLink'
import { syncLibraries } from './sync'

const external =
  'https://example.org/ressource?uuid=autre&v=eleve&alea=123#section'

describe('Liens web dans les sauvegardes', () => {
  it('conserve toute l’adresse externe même avec des paramètres ressemblant à MathALÉA', () => {
    const content = readSelectionLink(external)
    expect(content).toEqual({
      externalUrl: external,
      query: '?',
      exercises: [],
    })
    expect(defaultSelectionName(content)).toBe('example.org')
    const { selection } = addSelection(emptyLibrary(), {
      ...content,
      name: 'Ressource',
      folderId: null,
    })
    expect(selectionUrl(selection, 'https://coopmaths.fr/alea/')).toBe(external)
    expect(selectionView(selection)).toBe('external')
  })

  it.each([
    'https://coopmaths.fr/alea/?uuid=aaa&id=6N1E&alea=123',
    'https://mathalea.fr/alea?uuid=aaa&id=6N1E&alea=123',
    'coopmaths.fr/alea/?uuid=aaa&id=6N1E&alea=123',
    '?uuid=aaa&id=6N1E&alea=123',
  ])('reconnaît un lien MathALÉA : %s', (url) => {
    const content = readSelectionLink(url)
    expect(content.externalUrl).toBeUndefined()
    expect(content.exercises).toEqual(['6N1E'])
    expect(content.query).toContain('alea=123')
  })

  it('accepte les pages MathALÉA sans exercice et les liens cryptés', () => {
    expect(readSelectionLink('https://mathalea.fr/alea/')).toEqual({
      query: '?',
      exercises: [],
    })
    const url = new URL('https://coopmaths.fr/alea/?uuid=aaa&id=6N1E')
    expect(readSelectionLink(encrypt(url.href)).exercises).toEqual(['6N1E'])
  })

  it.each([
    'https://coopmaths.fr/autre?uuid=aaa',
    'https://coopmaths.fr.example.org/alea/?uuid=aaa',
    'https://example.org/alea/?uuid=aaa',
  ])('garde les autres domaines et chemins comme liens web : %s', (url) => {
    expect(readSelectionLink(url).externalUrl).toBe(url)
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,test',
    'file:///tmp/test',
    'https://',
  ])('refuse une adresse non web : %s', (url) => {
    expect(() => readSelectionLink(url)).toThrow()
  })

  it('conserve le lien et ses métadonnées à l’export, à la synchronisation et dans la corbeille', () => {
    const { library, selection } = addSelection(emptyLibrary(), {
      ...readSelectionLink(external),
      name: 'Ressource',
      folderId: null,
      stars: 2,
      comment: 'À utiliser en classe.',
    })
    const file = buildLibraryFile(library, new Map())
    const parsed = parseLibraryFile(JSON.stringify(file)).library
    expect(parsed.selections).toEqual(library.selections)
    expect(syncLibraries(emptyLibrary(), parsed).selections).toEqual(
      library.selections,
    )
    const restored = restoreItems(trashItems(parsed, [selection.id]), [
      selection.id,
    ])
    expect(restored.selections[0].externalUrl).toBe(external)
    expect(searchSelections(parsed, 'example.org')).toHaveLength(1)
    file.selections[0] = {
      ...file.selections[0],
      externalUrl: 'javascript:alert(1)',
    }
    expect(
      parseLibraryFile(JSON.stringify(file)).library.selections,
    ).toHaveLength(0)
  })
})
