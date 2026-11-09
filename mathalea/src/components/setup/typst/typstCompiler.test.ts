import { afterEach, describe, expect, it, vi } from 'vitest'
import { cachedResponse } from './typstCompiler'

const wasm = new Uint8Array([0, 0x61, 0x73, 0x6d, 1, 0, 0, 0])

afterEach(() => vi.unstubAllGlobals())

describe('cachedResponse', () => {
  it('remplace un WASM invalide en cache par un téléchargement valide', async () => {
    const cache = {
      match: vi.fn().mockResolvedValue(new Response('<html>Erreur</html>')),
      delete: vi.fn().mockResolvedValue(true),
      put: vi.fn().mockResolvedValue(undefined),
    }
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue(cache) })
    const fetcher = vi.fn().mockResolvedValue(new Response(wasm))
    vi.stubGlobal('fetch', fetcher)
    const response = await cachedResponse('/compiler.wasm')
    expect(cache.delete).toHaveBeenCalledWith('/compiler.wasm')
    expect(fetcher).toHaveBeenCalledWith('/compiler.wasm', { cache: 'reload' })
    expect(response.headers.get('content-type')).toBe('application/wasm')
    expect(WebAssembly.validate(await response.arrayBuffer())).toBe(true)
    expect(cache.put).toHaveBeenCalledOnce()
  })

  it('réessaie sans mettre en cache une page HTML renvoyée avec HTTP 200', async () => {
    const cache = {
      match: vi.fn().mockResolvedValue(undefined),
      put: vi.fn(),
    }
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue(cache) })
    const fetcher = vi
      .fn()
      .mockImplementation(async () => new Response('<html>Erreur</html>'))
    vi.stubGlobal('fetch', fetcher)
    await expect(cachedResponse('/compiler.wasm')).rejects.toThrow(
      'WebAssembly valide',
    )
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(cache.put).not.toHaveBeenCalled()
  })
})
