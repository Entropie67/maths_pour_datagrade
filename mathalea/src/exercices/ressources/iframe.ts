import { get } from 'svelte/store'
import { updateIframeSize } from '../../lib/components/sizeTools'
import { exercicesParams } from '../../lib/stores/generalStore'
import { globalOptions } from '../../lib/stores/globalOptions'
import Exercice from '../Exercice'
import { createButon, createTextInput } from './_components'

export const uuid = 'iframe'
export const titre = 'Ressource externe'
/**
 * @author Rémi Angot
 */
class ressourceVideo extends Exercice {
  container: HTMLDivElement
  iframe: HTMLIFrameElement
  fieldUrl: HTMLInputElement
  button: HTMLButtonElement
  url: URL = new URL('https://coopmaths.fr/alea')
  constructor() {
    super()
    this.typeExercice = 'html'
    this.container = document.createElement('div')
    this.iframe = document.createElement('iframe')
    this.iframe.setAttribute('width', '500')
    this.iframe.setAttribute('height', '315')
    window.addEventListener('resize', this.updateSize)
    this.container.addEventListener('addedToDom', this.updateSize)
    document.addEventListener('questionDisplay', this.updateSize)
    this.iframe.classList.add('my-10')
    this.fieldUrl = createTextInput({ placeholder: 'URL', autoCorrect: false })
    this.button = createButon()
    this.container.append(this.fieldUrl, this.button, this.iframe)
    this.button.addEventListener('click', () => {
      this.iframe.src = this.fieldUrl.value
      this.sup = encodeURIComponent(this.fieldUrl.value)
      exercicesParams.update((l) => {
        if (
          this.numeroExercice !== undefined &&
          l[this.numeroExercice] !== undefined
        ) {
          l[this.numeroExercice].sup = encodeURIComponent(this.fieldUrl.value)
        }
        return l
      })
      this.updateSize()
    })
  }

  private updateSize = () => {
    updateIframeSize(this.container, this.iframe)
  }

  destroy() {
    window.removeEventListener('resize', this.updateSize)
    this.container.removeEventListener('addedToDom', this.updateSize)
  }

  get html() {
    if (get(globalOptions).v === 'eleve') {
      this.fieldUrl.remove()
      this.button.remove()
    }
    if (this.sup !== undefined) {
      let iframeUrl: string | URL
      try {
        iframeUrl = new URL(decodeURIComponent(this.sup))
        if (
          iframeUrl.protocol === 'http:' ||
          iframeUrl.protocol === 'https:' ||
          iframeUrl.protocol === 'ftp:'
        ) {
          iframeUrl = iframeUrl.href
        } else {
          iframeUrl = 'data:text/html,Erreur'
        }
      } catch (e) {
        iframeUrl = 'data:text/html,Erreur'
      }
      this.iframe.src = iframeUrl
      this.fieldUrl.value = decodeURIComponent(this.sup)
    }
    this.updateSize()
    return this.container
  }
}

export default ressourceVideo
