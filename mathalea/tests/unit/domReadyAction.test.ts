import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DomReadyActionElement } from '../../src/lib/customElements/DomReadyAction'
import { setOutputHtml } from '../../src/modules/context'

const action = 'test:dom-ready'

/** Attend le `requestAnimationFrame` dans lequel `connectedCallback()` agit. */
function attendUneFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

/** Simule le rendu d'un énoncé : Svelte remplace le HTML de la zone d'exercice. */
function afficheEnonce(): void {
  document.body.innerHTML = DomReadyActionElement.create({
    id: 'test-dom-ready',
    action,
  })
}

describe('DomReadyActionElement', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    DomReadyActionElement.unregisterCallback(action)
  })

  it('exécute le callback inscrit quand l’élément entre dans le DOM', async () => {
    const callback = vi.fn()
    DomReadyActionElement.registerCallback(action, callback)
    afficheEnonce()
    await attendUneFrame()
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('exécute le nettoyage quand l’élément quitte le DOM', async () => {
    const cleanup = vi.fn()
    DomReadyActionElement.registerCallback(action, () => cleanup)
    afficheEnonce()
    await attendUneFrame()
    document.body.innerHTML = ''
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('exécute le nouveau callback après régénération de l’énoncé', async () => {
    // Le nettoyage de l'ancien élément désinscrit l'action : il ne doit pas
    // emporter l'inscription faite entre-temps par le nouvel énoncé.
    const premierCallback = vi.fn(
      () => () => DomReadyActionElement.unregisterCallback(action),
    )
    DomReadyActionElement.registerCallback(action, premierCallback)
    afficheEnonce()
    await attendUneFrame()
    expect(premierCallback).toHaveBeenCalledTimes(1)

    // « Nouvel énoncé » : nouvelleVersion() réinscrit avant que Svelte ne
    // remplace le HTML (donc avant le disconnectedCallback de l'ancien élément).
    const secondCallback = vi.fn()
    DomReadyActionElement.registerCallback(action, secondCallback)
    afficheEnonce()
    await attendUneFrame()
    expect(secondCallback).toHaveBeenCalledTimes(1)
  })

  it('ne désinscrit pas une inscription plus récente que le callback fourni', async () => {
    const ancienCallback = vi.fn()
    const nouveauCallback = vi.fn()
    DomReadyActionElement.registerCallback(action, ancienCallback)
    DomReadyActionElement.registerCallback(action, nouveauCallback)
    DomReadyActionElement.unregisterCallback(action, ancienCallback)
    afficheEnonce()
    await attendUneFrame()
    expect(nouveauCallback).toHaveBeenCalledTimes(1)
    expect(ancienCallback).not.toHaveBeenCalled()
  })
})
