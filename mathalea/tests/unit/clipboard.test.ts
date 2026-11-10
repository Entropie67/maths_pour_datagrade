import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyTextToClipboard } from '../../src/lib/components/clipboard'

describe('copyTextToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    // @ts-expect-error nettoyage du stub éventuel
    delete document.execCommand
  })

  it('utilise navigator.clipboard quand il est disponible', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    await expect(copyTextToClipboard('abc')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('abc')
  })

  it('bascule sur execCommand en contexte non sécurisé (clipboard absent)', async () => {
    vi.stubGlobal('navigator', {})
    document.execCommand = vi.fn().mockReturnValue(true)
    await expect(copyTextToClipboard('abc')).resolves.toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  it('bascule aussi si clipboard.writeText échoue (permission refusée)', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    document.execCommand = vi.fn().mockReturnValue(true)
    await expect(copyTextToClipboard('abc')).resolves.toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  it('renvoie false sans lever d’erreur si aucune méthode ne fonctionne', async () => {
    vi.stubGlobal('navigator', {})
    document.execCommand = vi.fn().mockImplementation(() => {
      throw new Error('not implemented')
    })
    await expect(copyTextToClipboard('abc')).resolves.toBe(false)
  })

  it('ajoute le textarea de repli dans le conteneur fourni (dialog modale)', async () => {
    vi.stubGlobal('navigator', {})
    const container = document.createElement('div')
    document.body.appendChild(container)
    let parentAuMomentDeLaCopie: HTMLElement | null = null
    document.execCommand = vi.fn().mockImplementation(() => {
      parentAuMomentDeLaCopie =
        document.querySelector('textarea')?.parentElement ?? null
      return true
    })
    await expect(copyTextToClipboard('abc', container)).resolves.toBe(true)
    expect(parentAuMomentDeLaCopie).toBe(container)
    container.remove()
  })
})
