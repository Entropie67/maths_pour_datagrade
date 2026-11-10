import JSZip from 'jszip'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ManifestInvalideError } from '../components/banquesExternes'
import type { BanqueExterneSource } from '../types/banquesExternes'
import { ajouterBanqueForge } from './banquesExternesStore'

const manifestValide = {
  schema: 'mathalea-banque-v1',
  id: 'banque-forge',
  titre: 'Banque de la forge',
  exercices: [{ id: 'ex1', titre: 'Un exercice', png: 'png/ex1.png' }],
}

function reponseJson(corps: unknown): Response {
  return new Response(JSON.stringify(corps), { status: 200 })
}

function reponse404(): Response {
  return new Response('', { status: 404 })
}

/** Archive zip d'une banque, `manifest.json` (et ses assets) à la racine. */
async function archiveBanque(
  manifest: unknown,
  fichiers: Record<string, string> = { 'png/ex1.png': 'PNG' },
): Promise<Response> {
  const zip = new JSZip()
  zip.file('manifest.json', JSON.stringify(manifest))
  for (const [chemin, contenu] of Object.entries(fichiers)) {
    zip.file(chemin, contenu)
  }
  const octets = await zip.generateAsync({ type: 'arraybuffer' })
  return new Response(octets, { status: 200 })
}

describe('chargerDepuisForge', () => {
  const source: BanqueExterneSource = {
    type: 'forge',
    cle: '',
    projet: 'groupe/banque',
    ref: 'main',
  }
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    // les blob: des assets extraits d'une archive ne sont pas implémentés par jsdom
    URL.createObjectURL = vi.fn(() => 'blob:banque-forge')
    URL.revokeObjectURL = vi.fn()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    delete (URL as Partial<typeof URL>).createObjectURL
    delete (URL as Partial<typeof URL>).revokeObjectURL
  })

  describe('archive dist.zip', () => {
    it('extrait toute la banque de dist.zip sans lire le manifest fichier par fichier', async () => {
      fetchMock.mockResolvedValueOnce(await archiveBanque(manifestValide))
      const banque = await ajouterBanqueForge(source, false)
      expect(banque.manifest.id).toBe('banque-forge')
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock.mock.calls[0][0]).toContain(
        encodeURIComponent('dist.zip'),
      )
    })

    it('garde le descripteur de forge (partage par lien) malgré l’extraction du zip', async () => {
      fetchMock.mockResolvedValueOnce(await archiveBanque(manifestValide))
      const banque = await ajouterBanqueForge(source, false)
      expect(banque.source.type).toBe('forge')
      expect(banque.source.cle).toBe('forge:groupe/banque@main')
    })

    it('cherche dist.zip sous la racine explicite quand une sous-arborescence est indiquée', async () => {
      const sourceAvecRacine: BanqueExterneSource = { ...source, racine: 'publie' }
      fetchMock.mockResolvedValueOnce(reponse404())
      fetchMock.mockResolvedValueOnce(reponseJson(manifestValide))
      await ajouterBanqueForge(sourceAvecRacine, false)
      expect(fetchMock.mock.calls[0][0]).toContain(
        encodeURIComponent('publie/dist.zip'),
      )
    })
  })

  describe('repli fichier par fichier (dist.zip absent)', () => {
    it('utilise le manifest trouvé à la racine sans tenter dist/', async () => {
      fetchMock
        .mockResolvedValueOnce(reponse404())
        .mockResolvedValueOnce(reponseJson(manifestValide))
      const banque = await ajouterBanqueForge(source, false)
      expect(banque.manifest.id).toBe('banque-forge')
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock.mock.calls[1][0]).not.toContain(
        encodeURIComponent('dist/'),
      )
    })

    it('se rabat sur dist/ quand la racine ne contient pas de manifest', async () => {
      fetchMock
        .mockResolvedValueOnce(reponse404())
        .mockResolvedValueOnce(reponse404())
        .mockResolvedValueOnce(reponseJson(manifestValide))
      const banque = await ajouterBanqueForge(source, false)
      expect(banque.manifest.id).toBe('banque-forge')
      expect(fetchMock).toHaveBeenCalledTimes(3)
      expect(fetchMock.mock.calls[2][0]).toContain(
        encodeURIComponent('dist/manifest.json'),
      )
    })

    it('résout les assets depuis dist/ une fois le repli déclenché', async () => {
      fetchMock
        .mockResolvedValueOnce(reponse404())
        .mockResolvedValueOnce(reponse404())
        .mockResolvedValueOnce(reponseJson(manifestValide))
      const banque = await ajouterBanqueForge(source, false)
      const urlPng = banque.assets.get('png/ex1.png')
      expect(urlPng).toContain(encodeURIComponent('dist/png/ex1.png'))
    })

    it('essaie dist/ sous la racine explicite quand une sous-arborescence est déjà indiquée', async () => {
      const sourceAvecRacine: BanqueExterneSource = { ...source, racine: 'publie' }
      fetchMock
        .mockResolvedValueOnce(reponse404())
        .mockResolvedValueOnce(reponse404())
        .mockResolvedValueOnce(reponseJson(manifestValide))
      await ajouterBanqueForge(sourceAvecRacine, false)
      expect(fetchMock.mock.calls[2][0]).toContain(
        encodeURIComponent('publie/dist/manifest.json'),
      )
    })

    it('échoue avec un message citant dist/ si ni la racine ni dist/ n’ont de manifest', async () => {
      fetchMock
        .mockResolvedValueOnce(reponse404())
        .mockResolvedValueOnce(reponse404())
        .mockResolvedValueOnce(reponse404())
      let erreur: unknown
      try {
        await ajouterBanqueForge(source, false)
      } catch (e) {
        erreur = e
      }
      expect(erreur).toBeInstanceOf(ManifestInvalideError)
      expect((erreur as Error).message).toContain('dist')
    })
  })
})
