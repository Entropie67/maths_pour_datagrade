import { get } from 'svelte/store'
import { sendToCapytaleSaveStudentAssignment } from '../../lib/handleCapytale'
import {
  exercicesParams,
  resultsByExercice,
} from '../../lib/stores/generalStore'
import { globalOptions } from '../../lib/stores/globalOptions'
import Exercice from '../Exercice'
/**
 * @author Rémi Angot
 */
class ExternalApp extends Exercice {
  typeExercice: string
  container: HTMLDivElement
  iframe: HTMLIFrameElement
  url: URL
  isEmbedded: boolean
  state: 'done' | ''
  type = 'app'
  // Le getter html est appelé à chaque rendu : sans ce drapeau on empilerait
  // un écouteur de message supplémentaire (et donc autant de sauvegardes) par rendu
  isScoreHandled = false
  constructor(url: string) {
    super()
    this.url = new URL(url)
    this.isEmbedded = this.url.searchParams.get('v') === 'embed'

    this.typeExercice = 'html'
    this.state = ''
    this.container = document.createElement('div')
    this.iframe = document.createElement('iframe')
    this.iframe.setAttribute('width', '400px')
    this.iframe.setAttribute('height', '300px')
    this.iframe.classList.add('my-10')
    this.iframe.setAttribute('allowfullscreen', '')
    this.container.appendChild(this.iframe)
    let hasReportedHeight = false
    const updateIframeSize = () => {
      if (hasReportedHeight) return
      if (window.innerWidth > window.innerHeight) {
        this.iframe.setAttribute('width', '100%')
        this.iframe.setAttribute(
          'height',
          (document.body.offsetWidth * 0.75).toString(),
        )
      } else {
        this.iframe.setAttribute('width', '100%')
        this.iframe.setAttribute(
          'height',
          (document.body.offsetWidth * 1.5).toString(),
        )
      }
    }
    window.addEventListener('resize', updateIframeSize)
    window.addEventListener('orientationchange', updateIframeSize)
    this.container.addEventListener('addedToDom', updateIframeSize)
    window.addEventListener('message', (event) => {
      if (
        event.data?.type === 'mathaleaSettings' &&
        event.data?.numeroExercice === this.numeroExercice
      ) {
        this.sup = event.data.urlParams
        exercicesParams.update((l) => {
          if (
            this.numeroExercice !== undefined &&
            l[this.numeroExercice] !== undefined
          ) {
            l[this.numeroExercice].sup = event.data.urlParams
          }
          return l
        })
      }
      if (
        event.data?.type === 'height' &&
        event.data?.numeroExercice === this.numeroExercice &&
        event.source === this.iframe.contentWindow
      ) {
        const height = Number(event.data.height)
        if (!Number.isFinite(height) || height <= 0) return
        hasReportedHeight = true
        this.iframe.setAttribute('scrolling', 'no')
        this.iframe.setAttribute('height', (height + 20).toString())
      }
    })
  }

  get html() {
    exercicesParams.update((l) => {
      if (
        this.numeroExercice !== undefined &&
        l[this.numeroExercice] !== undefined
      ) {
        l[this.numeroExercice].type = 'app'
      }
      return l
    })
    this.handleScore()
    if (this.sup !== undefined) {
      const searchParams = new URLSearchParams(this.sup)
      for (const [key, value] of searchParams.entries()) {
        this.url.searchParams.set(key, value)
      }
    }
    if (get(globalOptions).v === 'eleve') {
      this.url.searchParams.set('v', 'eleve')
    }
    if (this.isEmbedded) {
      this.url.searchParams.set('embed', '1')
    }
    if (this.numeroExercice !== undefined) {
      this.url.searchParams.set(
        'numeroExercice',
        this.numeroExercice.toString(),
      )
    }
    this.url.searchParams.set('seed', this.seed ?? '')
    this.iframe.setAttribute('src', this.url.toString())
    return this.container
  }

  /**
   * Transmet le score au SCO Moodle (`moodle.scorm.js`) ou à la question GIFT
   * (`moodle.js`), qui attendent le même message `mathalea:score` que celui des
   * exercices MathALÉA. Le `finalState` de l'app est du HTML destiné à la vue
   * professeur : il n'est pas transmis, car il alourdirait `cmi.suspend_data`
   * (limité à 4 096 caractères en SCORM 1.2) et l'app ne rejoue pas de copie.
   */
  sendToMoodle() {
    const iframe = new URL(window.location.href).searchParams.get('iframe')
    // filter retire aussi les trous du tableau, que moodle.scorm.js ne sait pas lire
    const resultsByExerciceToSend = get(resultsByExercice)
      .filter((result) => result !== undefined)
      .map((result) => ({ ...result, answers: undefined }))
    window.parent.postMessage(
      {
        resultsByExercice: resultsByExerciceToSend,
        action: 'mathalea:score',
        iframe,
      },
      '*',
    )
  }

  handleScore() {
    if (this.isScoreHandled) return
    this.isScoreHandled = true
    window.addEventListener('message', (event) => {
      if (event.data?.numeroExercice !== this.numeroExercice) return
      if (event.data?.type === 'mathaleaSendScore') {
        this.state = 'done'
        const indice = parseInt(event.data.numeroExercice)
        const numberOfQuestions = parseInt(event.data.numberOfQuestions)
        const scoreSentByApp = parseInt(event.data.score)
        // Certaines apps cumulent le score restauré par mathaleaHasScore avec celui
        // de la nouvelle tentative et peuvent donc annoncer plus de points que de questions
        if (scoreSentByApp > numberOfQuestions) {
          window.notify(
            `L'app de l'exercice ${indice} a envoyé un score de ${scoreSentByApp} pour ${numberOfQuestions} questions`,
            { url: this.url.toString(), data: event.data },
          )
        }
        const numberOfPoints = Math.min(scoreSentByApp, numberOfQuestions)
        const answers = Array.isArray(event.data.finalState)
          ? event.data.finalState
          : [event.data.finalState]
        const type = 'app'
        // Le meilleur score peut venir d'une copie précédente restaurée par Capytale
        // (exercicesParams) ou d'une tentative de la session en cours (resultsByExercice)
        const previousBestScore = Math.max(
          get(exercicesParams)[indice]?.bestScore ?? 0,
          get(resultsByExercice)[indice]?.bestScore ?? 0,
        )
        // On ne remplace jamais la meilleure copie de l'élève par une tentative moins bonne
        if (numberOfPoints < previousBestScore) return
        const bestScore = numberOfPoints
        exercicesParams.update((l) => {
          if (l[indice] !== undefined) l[indice].bestScore = bestScore
          return l
        })
        resultsByExercice.update((l) => {
          l[indice] = {
            numberOfPoints,
            bestScore,
            numberOfQuestions,
            indice,
            answers,
            type,
            alea: this.seed ?? undefined,
          }
          return l
        })
        if (get(globalOptions).recorder === 'capytale') {
          sendToCapytaleSaveStudentAssignment({
            indiceExercice: this.numeroExercice,
          })
        } else if (get(globalOptions).recorder === 'moodle') {
          this.sendToMoodle()
        }
      } else if (event.data?.type === 'mathaleaHasScore') {
        const numberOfPoints = parseInt(event.data.score)
        const indice = parseInt(event.data.numeroExercice)
        const numberOfQuestions = parseInt(event.data.numberOfQuestions)
        const answers = Array.isArray(event.data.finalState)
          ? event.data.finalState
          : [event.data.finalState]
        // Restauration d'une copie précédente : le score restauré est le meilleur score
        const bestScore = Math.max(
          numberOfPoints,
          get(exercicesParams)[indice]?.bestScore ?? 0,
        )
        resultsByExercice.update((l) => {
          l[indice] = {
            numberOfPoints,
            bestScore,
            numberOfQuestions,
            indice,
            answers,
            type: 'app',
          }
          return l
        })
        const message = {
          type: 'mathaleaHasScore',
          score: numberOfPoints,
          numeroExercice: indice,
          numberOfQuestions,
          finalState: answers,
        }
        if (this.iframe !== null && this.iframe.contentWindow !== null) {
          this.iframe.contentWindow.postMessage(message, '*')
        }
      } else if (event.data?.type === 'mathaleaAskScore') {
        const indice = parseInt(event.data.numeroExercice) || 0
        const results = get(resultsByExercice)[indice]
        if (typeof results !== 'undefined') {
          const message = {
            type: 'mathaleaHasScore',
            score: results.numberOfPoints,
            numeroExercice: indice,
            numberOfQuestions: results.numberOfQuestions,
            finalState: results.answers,
          }
          if (this.iframe !== null && this.iframe.contentWindow !== null) {
            this.iframe.contentWindow.postMessage(message, '*')
          }
        }
      }
    })
  }
}

export default ExternalApp
