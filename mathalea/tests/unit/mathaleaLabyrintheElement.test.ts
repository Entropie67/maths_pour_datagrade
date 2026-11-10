import { afterEach, describe, expect, it, vi } from 'vitest'
import MathaleaLabyrintheElement from '../../src/lib/customElements/MathaleaLabyrintheElement'

/** Le shadow root est fermé : on le récupère à sa création. */
function monteLabyrinthe(attributs: string): ShadowRoot {
  const attachShadow = HTMLElement.prototype.attachShadow
  let root: ShadowRoot | undefined
  vi.spyOn(HTMLElement.prototype, 'attachShadow').mockImplementation(function (
    this: HTMLElement,
    init: ShadowRootInit,
  ) {
    root = attachShadow.call(this, init)
    return root
  })
  const conteneur = document.createElement('div')
  document.body.appendChild(conteneur)
  conteneur.innerHTML = `<${MathaleaLabyrintheElement.elementTag} seed="abcd" rows="5" cols="7" orientation="horizontal" ${attributs}></${MathaleaLabyrintheElement.elementTag}>`
  if (root === undefined) throw new Error('Labyrinthe non monté')
  return root
}

describe('mathalea-labyrinthe', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('la correction colore le chemin, même après un nouveau rendu', () => {
    const root = monteLabyrinthe('correction="true" disabled="true"')
    const element = root.host as MathaleaLabyrintheElement
    const chemin = () => root.querySelectorAll('.grid-cell.correct').length

    expect(element.totalGood).toBeGreaterThan(0)
    expect(chemin()).toBe(element.totalGood)

    element.render()
    expect(chemin()).toBe(element.totalGood)
  })

  it("l'énoncé ne révèle pas le chemin", () => {
    const root = monteLabyrinthe('correction="false"')
    expect(root.querySelectorAll('.grid-cell').length).toBe(35)
    expect(root.querySelectorAll('.grid-cell.correct').length).toBe(0)
  })
})
