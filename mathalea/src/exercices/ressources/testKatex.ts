import katex from 'katex'

export const uuid = 'testKatex'
export const titre = 'Katex sandbox'

/**
 * @author Jean-claude Lhote
 */
export default class KatexSandbox {
  typeExercice: string
  numeroExercice!: number
  // titre: string
  container: HTMLDivElement

  constructor() {
    this.typeExercice = 'html'

    this.container = document.createElement('div')
    this.container.setAttribute('overflow', 'auto')
    this.container.id = 'katex-sandbox'
    const textarea = document.createElement('textarea')
    textarea.id = 'latex'
    textarea.rows = 10
    textarea.cols = 80
    this.container.appendChild(textarea)
    this.container.appendChild(document.createElement('br'))
    const button = document.createElement('button')
    button.id = 'rendre'
    this.container.appendChild(button)
    const renduKatexDiv = document.createElement('div')
    renduKatexDiv.id = 'rendu-katex'
    this.container.appendChild(renduKatexDiv)
    this.container.querySelector('#rendre')!.textContent = 'Valider'
    this.container.querySelector('#rendu-katex')!.textContent =
      "Le rendu s'affichera ici :"
    const katexZone = document.createElement('div')
    katexZone.id = 'KatexZone'
    katexZone.style.display = 'block'
    katexZone.style.border = '1px solid'
    katexZone.style.minWidth = '100px'
    katexZone.style.minHeight = '30px'
    const renduKatex = this.container.querySelector('#rendu-katex')
    if (renduKatex) {
      renduKatex.appendChild(katexZone)
    }

    ;(this.container.querySelector('#rendre') as HTMLButtonElement)!.onclick =
      () => {
        const stringLatex = (this.container.querySelector(
          '#latex',
        ) as HTMLTextAreaElement)!.value
        const htmlKatex = katex.renderToString(`${stringLatex}`)
        this.container.querySelector('#KatexZone')!.innerHTML = htmlKatex
      }
  }

  get html() {
    return this.container
  }
}
