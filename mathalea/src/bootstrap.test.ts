import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildStatsUrl } from './modules/statsUrl'

describe('ouverture des liens statistiques', () => {
  let initialUrl: string
  let initialState: unknown
  let initialBody: string
  const loadApp = vi.fn((url: string) => Promise.resolve(url))

  beforeEach(() => {
    initialUrl = window.location.href
    initialState = window.history.state
    initialBody = document.body.innerHTML
    document.body.innerHTML = '<div id="appMathalea"></div>'
    loadApp.mockClear()
    vi.resetModules()
    vi.doMock('./main', () => ({ default: loadApp(window.location.href) }))
  })

  afterEach(() => {
    window.history.replaceState(initialState, '', initialUrl)
    document.body.innerHTML = initialBody
    vi.doUnmock('./main')
  })

  async function startAt(url: string) {
    window.history.replaceState({ fromMatomo: true }, '', url)
    const { default: app } = await import('./bootstrap')
    return app
  }

  it('restaure les paramètres facultatifs avant tout import de l’application', async () => {
    const normalUrl = `${window.location.origin}/alea/?uuid=A&s=1&uuid=B&uuid=C&s=3&v=eleve#exercice-3`
    const historyLength = window.history.length
    await startAt(buildStatsUrl(normalUrl))
    expect(window.location.href).toBe(normalUrl)
    expect(loadApp).toHaveBeenCalledExactlyOnceWith(normalUrl)
    expect(window.history.length).toBe(historyLength)
    expect(window.history.state).toEqual({ fromMatomo: true })
  })

  it('laisse une URL normale intacte, y compris son encodage', async () => {
    const normalUrl = `${window.location.origin}/alea/?uuid=A&s=1&title=a%20b`
    await startAt(normalUrl)
    expect(window.location.href).toBe(normalUrl)
    expect(loadApp).toHaveBeenCalledExactlyOnceWith(normalUrl)
  })

  it('restaure les UUID identiques et les collisions avec les clés statistiques', async () => {
    const normalUrl = `${window.location.origin}/alea/?uuid=A&s=1&uuid=A&s=3&uuids=autre&_mathaleaStats=texte`
    await startAt(buildStatsUrl(normalUrl))
    expect(window.location.href).toBe(normalUrl)
    expect(loadApp).toHaveBeenCalledExactlyOnceWith(normalUrl)
  })

  it('laisse une URL normale avec des clés uuids/_mathaleaStats intacte', async () => {
    const normalUrl = `${window.location.origin}/alea/?uuid=A&uuids=autre&_mathaleaStats=texte`
    await startAt(normalUrl)
    expect(window.location.href).toBe(normalUrl)
    expect(loadApp).toHaveBeenCalledExactlyOnceWith(normalUrl)
  })

  it('restaure aussi les réglages d’une sélection sans exercice', async () => {
    const normalUrl = `${window.location.origin}/alea/?v=eleve&title=a%2Cb&bq=un&bq=deux`
    await startAt(buildStatsUrl(normalUrl))
    expect(window.location.href).toBe(normalUrl)
    expect(loadApp).toHaveBeenCalledExactlyOnceWith(normalUrl)
  })

  it('accepte une URL normale sans exercice et une clé de métadonnées sans JSON', async () => {
    const normalUrl = `${window.location.origin}/alea/?v=eleve&_mathaleaStats=texte`
    await startAt(normalUrl)
    expect(window.location.href).toBe(normalUrl)
    expect(loadApp).toHaveBeenCalledExactlyOnceWith(normalUrl)
  })

  it.each(['/alea/?uuids=A,B&s=1,3', '/alea/?uuids=A&_mathaleaStats=invalide'])(
    'affiche une erreur sans démarrer pour un lien non réversible %s',
    async (url) => {
      await startAt(url)
      expect(loadApp).not.toHaveBeenCalled()
      expect(window.location.href).toBe(`${window.location.origin}${url}`)
      expect(document.querySelector('[role="alert"]')?.textContent).toContain(
        'lien statistique est incomplet ou invalide',
      )
    },
  )

  it('ne démarre pas l’application lorsqu’une colonne de valeurs manque', async () => {
    const url = new URL(
      buildStatsUrl(`${window.location.origin}/alea/?uuid=A&s=1&uuid=B&s=3`),
    )
    url.searchParams.delete('s')
    await startAt(url.href)
    expect(loadApp).not.toHaveBeenCalled()
    expect(window.location.href).toBe(url.href)
    expect(document.querySelector('[role="alert"]')).not.toBeNull()
  })
})
