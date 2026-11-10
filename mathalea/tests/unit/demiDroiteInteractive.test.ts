import { beforeEach, describe, expect, it } from 'vitest'
import DemiDroiteInteractiveElement from '../../src/lib/customElements/demi_droite_interactive'
import { setOutputHtml } from '../../src/modules/context'

describe('DemiDroiteInteractiveElement', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  function renderElement(subdivisionMode?: 'axis' | 'unit') {
    document.body.innerHTML = DemiDroiteInteractiveElement.create({
      id: `axis-${subdivisionMode ?? 'default'}`,
      x0: 0,
      initialT: 3,
      minT: 3,
      maxT: 3,
      partsCount: 1,
      subdivisionMode,
    })
    return document.body.querySelector('demi-droite-interactive')!
  }

  it('conserve le partage de tout l’axe comme mode par défaut', () => {
    const element = renderElement()

    expect(element.getAttribute('subdivision-mode')).toBe('axis')
    expect(element.querySelectorAll('svg line[stroke-width="3"]')).toHaveLength(
      4,
    )
    expect(element.textContent).toContain('Nombre de parts sur l’axe')
  })

  it('partage chaque unité en demis puis en tiers avec le bouton plus', () => {
    const element = renderElement('unit')
    const plus = () =>
      element.querySelector(
        'button[aria-label="Augmenter le nombre de parts par unité"]',
      ) as HTMLButtonElement

    plus().click()
    expect(element.querySelectorAll('svg line[stroke="#444"]')).toHaveLength(3)
    expect(element.textContent).toContain('Nombre de parts par unité2')
    expect(
      (element as unknown as DemiDroiteInteractiveElement).getValue(),
    ).toMatchObject({ partsCount: 2, subdivisionMode: 'unit' })

    plus().click()
    expect(element.querySelectorAll('svg line[stroke="#444"]')).toHaveLength(6)
    expect(element.textContent).toContain('Nombre de parts par unité3')
  })
})
