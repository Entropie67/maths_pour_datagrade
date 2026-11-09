import { get } from 'svelte/store'
import { updateIframeSize } from '../../lib/components/sizeTools'
import { getUniqueStringBasedOnTimeStamp } from '../../lib/components/time'
import { exercicesParams } from '../../lib/stores/generalStore'
import { globalOptions } from '../../lib/stores/globalOptions'
import Exercice from '../Exercice'
import { createButon, createIButton, createTextInput } from './_components'

export const uuid = 'video'
export const titre = 'Vidéo'

/**
 * @author Rémi Angot
 */

class ressourceVideo extends Exercice {
  container: HTMLDivElement
  iframe: HTMLIFrameElement
  fieldUrl: HTMLInputElement
  fieldText: HTMLInputElement
  teacherText: HTMLDivElement
  iTooltip: HTMLButtonElement
  button: HTMLButtonElement
  constructor() {
    super()
    this.typeExercice = 'html'
    this.titre = 'Vidéo'
    this.container = document.createElement('div')
    this.container.setAttribute('overflow', 'auto')
    this.iframe = document.createElement('iframe')
    this.iframe.setAttribute('width', '500')
    this.iframe.setAttribute('height', '315')
    this.iframe.setAttribute('title', 'YouTube video player')
    this.iframe.setAttribute('frameborder', '0')
    this.iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    )
    this.iframe.setAttribute('allowfullscreen', '')
    this.teacherText = document.createElement('div')
    window.addEventListener('resize', this.updateSize)
    this.container.addEventListener('addedToDom', this.updateSize)
    document.addEventListener('questionDisplay', this.updateSize)

    // constitution d'une ID pour mise en forme dans app.css
    this.iframe.setAttribute(
      'id',
      'iframe-video' + getUniqueStringBasedOnTimeStamp('-'),
    )
    // /!\ pas de mise en formee ici !!!
    // this.iframe.classList.add('my-10')
    this.fieldUrl = createTextInput({ placeholder: 'URL', autoCorrect: false })
    this.fieldText = createTextInput({ placeholder: 'Consigne éventuelle' })
    this.fieldText.style.display = 'block'
    this.button = createButon()
    const tooltip = `Formats supportés : 
- lien direct vers la vidéo
- peertube
- podeduc.apps.education.fr
- www.youtube.com
- youtu.be
- www.dailymotion.com
- dai.ly
- vimeo.com`
    this.iTooltip = createIButton({ tooltip, direction: 'bottom' })
    this.container.append(
      this.fieldUrl,
      this.iTooltip,
      this.fieldText,
      this.teacherText,
      this.button,
      this.iframe,
    )
    this.button.addEventListener('click', () => {
      // On transforme https://youtu.be/Jup128waBI8 en https://www.youtube.com/embed/Jup128waBI8
      this.updateVideoFromUrl()
      this.sup = encodeURIComponent(this.fieldUrl.value)
      if (this.fieldText.value !== '') {
        this.sup2 = encodeURIComponent(this.fieldText.value)
      }
      exercicesParams.update((l) => {
        if (
          this.numeroExercice !== undefined &&
          l[this.numeroExercice] !== undefined
        ) {
          l[this.numeroExercice].sup = this.sup
          if (this.fieldText.value !== '') {
            l[this.numeroExercice].sup2 = encodeURIComponent(
              this.fieldText.value,
            )
          }
        }
        return l
      })
    })
  }

  private updateSize = () => {
    // same function as in video.ts
    updateIframeSize(this.container, this.iframe)
  }

  destroy() {
    window.removeEventListener('resize', this.updateSize)
    this.container.removeEventListener('addedToDom', this.updateSize)
  }

  get html() {
    if (get(globalOptions).v === 'eleve') {
      this.fieldUrl.remove()
      this.fieldText.remove()
      this.button.remove()
      this.iTooltip.remove()
    }
    if (this.sup !== undefined) {
      try {
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
        this.fieldUrl.value = iframeUrl
      } catch (e) {
        console.error('Invalid URI: ', this.sup)
      }
      this.updateVideoFromUrl()
    }
    if (this.sup2 !== undefined) {
      try {
        this.teacherText.textContent = decodeURIComponent(this.sup2)
      } catch (e) {
        console.error('Invalid URI: ', this.sup2)
      }
    }
    return this.container
  }

  updateVideoFromUrl() {
    const url = new URL(this.fieldUrl.value)
    if (url.hostname === 'youtu.be') {
      url.hostname = 'www.youtube.com'
      url.pathname = '/embed' + url.pathname
      this.iframe.src = url.toString()
    } else if (url.hostname === 'www.youtube.com') {
      this.iframe.src = url.toString().replace('watch?v=', 'embed/')
    } else if (url.hostname === 'www.dailymotion.com') {
      url.pathname = '/embed' + url.pathname
      this.iframe.src = url.toString()
    } else if (url.hostname === 'dai.ly') {
      url.hostname = 'www.dailymotion.com'
      url.pathname = '/embed/video' + url.pathname
      this.iframe.src = url.toString()
    } else if (url.hostname === 'vimeo.com') {
      url.hostname = 'player.vimeo.com'
      url.pathname = '/video' + url.pathname
      this.iframe.src = url.toString()
    } else if (url.hostname === 'podeduc.apps.education.fr') {
      this.iframe.src = this.fieldUrl.value + '/?is_iframe=true'
    } else if (this.fieldUrl.value.includes('/w/')) {
      // Gestion des url en provenance de peertube
      this.iframe.src = this.fieldUrl.value.replace('/w/', '/videos/embed/')
    } else {
      this.iframe.src = this.fieldUrl.value
    }
    this.teacherText.textContent = this.fieldText.value
    this.titre = this.fieldText.value
  }
}

export default ressourceVideo
