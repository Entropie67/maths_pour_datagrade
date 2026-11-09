import { beforeEach, describe, expect, it } from 'vitest'
import MathaleaCustomElement from '../../src/lib/customElements/MathaleaCustomElement'
import { setOutputHtml } from '../../src/modules/context'

class ReadOnlyMathElement extends MathaleaCustomElement {
  static readonly elementTag = 'read-only-math-test'

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  render(): void {
    this.innerHTML = '<span class="light-math">$x+1$</span>'
    if (this.shadowRoot != null) {
      this.shadowRoot.innerHTML = '<span class="shadow-math">$y+1$</span>'
    }
  }

  protected onInteractivityChanged(): void {
    this.render()
  }
}

if (customElements.get(ReadOnlyMathElement.elementTag) == null) {
  customElements.define(ReadOnlyMathElement.elementTag, ReadOnlyMathElement)
}

describe('MathaleaCustomElement', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  it('rend le LaTeX du DOM léger et du shadow DOM en passant en lecture seule', () => {
    const element = document.createElement(
      ReadOnlyMathElement.elementTag,
    ) as ReadOnlyMathElement
    document.body.appendChild(element)

    element.interactivityOn = false

    expect(element.querySelector('.light-math .katex')).not.toBeNull()
    expect(
      element.shadowRoot?.querySelector('.shadow-math .katex'),
    ).not.toBeNull()
  })

  it("rend aussi le LaTeX d'un élément initialement non interactif", () => {
    const element = document.createElement(
      ReadOnlyMathElement.elementTag,
    ) as ReadOnlyMathElement
    element.setAttribute('interactivity-on', 'false')

    document.body.appendChild(element)

    expect(element.querySelector('.light-math .katex')).not.toBeNull()
    expect(
      element.shadowRoot?.querySelector('.shadow-math .katex'),
    ).not.toBeNull()
  })
})
