import type { MultiMathfieldElement } from './customElements/MultiMathfield'
import type MathaleaLabyrintheElement from './customElements/MathaleaLabyrintheElement'
import type { MathfieldElement } from 'mathlive'
import { get } from 'svelte/store'
import { type MathaleaSVG } from '../lib/types'
import MathaleaCustomElement, {
  listOfCustomElements,
} from './customElements/MathaleaCustomElement'
import { previousView } from './stores/generalStore'
import { globalOptions } from './stores/globalOptions'
import type { VueType } from './VueType'

export function mathaleaGoToView(destinationView: '' | VueType) {
  const originView = get(globalOptions).v ?? ''
  const prevView = get(previousView)

  if (destinationView === '') {
    // Retour à l'accueil : si une vue « parente » a été mémorisée
    // explicitement (ex. la vue Outils qui a lancé un export), on y
    // retourne plutôt que d'aller à l'accueil. Dans tous les cas on purge
    // `previousView` : sans ça, quitter une vue d'export (Typst, LaTeX…)
    // réarmerait ce retour et le clic « accueil » suivant (croix, logo
    // MathALÉA…) ramènerait dans la vue qu'on vient de quitter.
    previousView.set(undefined)
    if (prevView) {
      destinationView = prevView as '' | VueType
    }
  } else {
    // On mémorise la vue d'origine pour pouvoir y revenir depuis la
    // destination.
    previousView.set(originView)
  }

  if (destinationView !== get(globalOptions).v) {
    // on met à jour que si nécessaire
    globalOptions.update((l) => {
      l.v = destinationView
      return l
    })
  }
}

function log(message: string) {
  // console.log(message)
}

/**
 * Attend qu'un élément du DOM remplisse une condition, ou time out
 * @param {() => boolean} conditionFn - fonction qui retourne true quand l'élément est prêt
 * @param {number} timeout - durée max en ms
 * @param {number} interval - fréquence de vérification en ms
 */
export function waitFor(
  conditionFn: () => boolean,
  timeout = 2000,
  interval = 50,
  trace: string = '',
) {
  return new Promise((resolve, reject) => {
    const start = Date.now()

    function check() {
      if (conditionFn()) {
        resolve(true)
      } else if (Date.now() - start > timeout) {
        reject(new Error('Timeout waiting for condition:' + trace))
      } else {
        setTimeout(check, interval)
      }
    }

    check()
  })
}

/**
 * On attend un élément ou des éléments du DOM en fonction d'un selecteur
 * @param elementId selecteur
 * @param timeWait temps en secondes
 * @returns une promise sur l'élément ou les éléments en question
 */
const waitForElement = async (
  elementId: string,
  timeWait = 4,
): Promise<NodeListOf<HTMLElement>> => {
  return new Promise((resolve, reject) => {
    const ele = document.querySelectorAll<HTMLElement>(elementId)
    if (ele.length) {
      // pas besoin d'attendre
      resolve(ele)
      return
    }

    let tempTime = 0
    const timeWait1000 = timeWait * 10
    const checkExist = setInterval(function () {
      const ele = document.querySelectorAll<HTMLElement>(elementId)
      if (ele.length) {
        // console.log(`Exists ${elementId}`)
        clearInterval(checkExist)
        resolve(ele)
      } else if (ele.length === 0 && tempTime > timeWait1000) {
        // console.log('Doesn\'t exist...')
        clearInterval(checkExist)
        const domSnapshot = document.body.outerHTML
        window.notify(`Timeout waiting for element ${elementId}`, {
          timeWait,
          domSnapshot,
        })
        reject(new Error(`Element not found ${elementId}`))
      } else {
        tempTime++
        // console.log(`Waiting for ${elementId}`, tempTime)
      }
    }, 100) // check every 100ms
  })
}

export function mathaleaWriteStudentPreviousAnswers(answers?: {
  [key: string]: string
}): Promise<boolean>[] {
  const promiseAnswers: Promise<boolean>[] = []
  const starttime = window.performance.now()
  for (const answer in answers) {
    if (listOfCustomElements.includes(answer.split('Ex')[0])) {
      const p = new Promise<boolean>((resolve) => {
        waitForElement('#' + answer)
          .then(() => {
            // La réponse correspond à un customElement quel qu'il soit
            const element = document.querySelector(
              `#${answer}`,
            ) as MathaleaCustomElement
            if (element !== null) {
              element.value = answers[answer]
              resolve(true)
            }
          })
          .catch((reason) => {
            console.error(reason)
            window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {})
            resolve(true)
          })
      })
      promiseAnswers.push(p)
    } else if (answer.includes('MetaInteractif2d')) {
      const p = new Promise<boolean>((resolve) => {
        const saisies = JSON.parse(answers[answer])
        const selectors = Object.keys(saisies).map((field) => `#${field}`)

        Promise.all(selectors.map((selector) => waitForElement(selector)))
          .then(() => {
            for (const field in saisies) {
              const mf = document.getElementById(field) as MathfieldElement
              if (
                mf &&
                'setPromptValue' in mf &&
                typeof mf.setPromptValue === 'function'
              ) {
                mf.setPromptValue('champ1', saisies[field], { mode: 'auto' })
              }
            }
            const time = window.performance.now()
            log(`duration ${answer}: ${time - starttime}`)
            resolve(true)
          })
          .catch((reason) => {
            console.error(reason)
            window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {})
            resolve(true)
          })
      })
      promiseAnswers.push(p)
    } else if (
      answer.includes('apigeom') ||
      answers[answer].includes('apiGeomVersion')
    ) {
      const p = new Promise<boolean>((resolve) => {
        waitForElement('#' + answer)
          .then(() => {
            // La réponse correspond à une figure apigeom
            const event = new CustomEvent(answer, { detail: answers[answer] })
            document.dispatchEvent(event)
            const time = window.performance.now()
            log(`duration ${answer}: ${time - starttime}`)
            // ne pas resolve ici si tu veux attendre waitFor
            return waitFor(
              () => {
                const el = document.querySelector('#' + answer)
                if (!el) return false // l'élément n'existe pas encore
                return el?.children.length >= 1
              },
              5000,
              100,
              '#' + answer,
            )
          })
          .then(() => resolve(true))
          .catch((reason) => {
            console.error(reason)
            window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {})
            resolve(true)
          })
      })
      promiseAnswers.push(p)
    } else if (answer.includes('cliquefigure')) {
      const p = new Promise<boolean>((resolve) => {
        waitForElement('#' + answer)
          .then(() => {
            // La réponse correspond à une figure cliquefigures
            const ele = document.querySelector(`#${answer}`) as MathaleaSVG
            if (ele) {
              ele.etat = true
              ele.style.border = `3px solid #f15929`
              const time = window.performance.now()
              log(`duration ${answer}: ${time - starttime}`)
              resolve(true)
            }
          })
          .catch((reason) => {
            console.error(reason)
            window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {})
            resolve(true)
          })
      })
      promiseAnswers.push(p)
    } else if (answer.includes('cliquePoint')) {
      // "answers": {"cliquePointfigEx7Q0P60" : "svg[id$='Ex7Q0'] g:nth-of-type(61)"}
      // On active le point 60 (61ème enfant) par exemple ici...
      const p = new Promise<boolean>((resolve) => {
        waitForElement(answers[answer])
          .then(() => {
            // La réponse correspond à un cliquePoint
            const ele = document.querySelector(answers[answer]) as MathaleaSVG
            if (ele) {
              const evt = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
              })
              ele.dispatchEvent(evt)
              const time = window.performance.now()
              log(`duration ${answer}: ${time - starttime}`)
              resolve(true)
            }
          })
          .catch((reason) => {
            console.error(reason)
            window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {})
            resolve(true)
          })
      })
      promiseAnswers.push(p)
    } else if (answer.includes('texteDND')) {
      // on ignore ce champ, il est juste pour le debug et il ne sert pas!
      const p = new Promise<boolean>((resolve) => {
        resolve(true)
      })
      promiseAnswers.push(p)
    } else if (answer.includes('rectangleDND')) {
      const p = new Promise<boolean>((resolve) => {
        waitForElement(`div#${answer.replace('DND', '')}`)
          .then(() => {
            const rectangle = document.querySelector(
              `div#${answer.replace('DND', '')}`,
            )
            if (rectangle !== null) {
              const listeOfIds = answers[answer].split(';')
              for (const id of listeOfIds) {
                // attention ! on a peut-être à faire à des clones ! qu'il faut recréer !
                if (!id.includes('-clone-')) {
                  // Non, c'est un original
                  const etiquette = document.querySelector(`div#${id}`)
                  if (etiquette !== null) {
                    // Remet l'étiquette à la bonne réponse
                    rectangle.appendChild(etiquette)
                  }
                } else {
                  // Là, on doit recloner l'original !
                  const idOriginalAndDate = id.split('-clone-')
                  const etiquetteOriginale = document.querySelector(
                    `div#${idOriginalAndDate[0]}`,
                  )
                  if (etiquetteOriginale != null) {
                    const clonedEtiquette = etiquetteOriginale.cloneNode(
                      true,
                    ) as HTMLDivElement
                    clonedEtiquette.id = `${idOriginalAndDate[0]}-clone-${idOriginalAndDate[1]}`
                    rectangle.appendChild(clonedEtiquette)
                  }
                }
              }
              const time = window.performance.now()
              log(`duration ${answer}: ${time - starttime}`)
              resolve(true)
            }
          })
          .catch((reason) => {
            console.error(reason)
            window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {})
            resolve(true)
          })
      })
      promiseAnswers.push(p)
    } else if (answer.startsWith('labyrintheEx')) {
      const p = new Promise<boolean>((resolve) => {
        waitForElement('#' + answer)
          .then(() => {
            const labyrinthe = document.querySelector(
              `#${answer}`,
            ) as MathaleaLabyrintheElement
            if (labyrinthe !== null) {
              labyrinthe.state = answers[answer]
              const time = window.performance.now()
              log(`duration ${answer}: ${time - starttime}`)
              resolve(true)
            }
          })
          .catch((reason) => {
            console.error(reason)
            window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {})
            resolve(true)
          })
      })
      promiseAnswers.push(p)
    } else {
      const p = new Promise<boolean>((resolve) => {
        // Une ancienne réponse peut désormais appartenir à un champ regroupé
        // dans le shadow DOM d'un multi-mathfield (ex. les longueurs de Thalès).
        const legacyKey = encodeURIComponent(JSON.stringify(answer) + ':')
        waitForElement(
          `[id$='${answer}'], multi-mathfield[data-legacy-answer-ids*='${legacyKey}']`,
        )
          .then((eles) => {
            const legacyHost = Array.from(eles).find((ele) => {
              const mapping = ele.getAttribute('data-legacy-answer-ids')
              return (
                mapping != null &&
                answer in JSON.parse(decodeURIComponent(mapping))
              )
            }) as MultiMathfieldElement | undefined
            if (legacyHost != null) {
              const mapping = JSON.parse(
                decodeURIComponent(
                  legacyHost.getAttribute('data-legacy-answer-ids')!,
                ),
              ) as Record<string, string>
              legacyHost.setAnswers({ [mapping[answer]]: answers[answer] })
              resolve(true)
              return
            }
            eles.forEach((ele) => {
              if (ele.id.includes('check')) {
                // La réponse correspond à une case à cocher qui doit être cochée
                if (answers[answer] === '1') {
                  ;(ele as HTMLInputElement).checked = true
                }

                resolve(true)
              } else if (
                ele.tagName === 'MATH-FIELD' &&
                'setValue' in ele &&
                typeof (ele as any).setValue === 'function'
              ) {
                // La réponse correspond à un champs texte
                ;(ele as any).setValue(answers[answer])

                resolve(true)
              } else if (ele.tagName === 'INPUT') {
                ;(ele as HTMLInputElement).value = answers[answer]

                resolve(true)
              }
            })
            resolve(false)
          })
          .catch((reason) => {
            console.error(reason)
            window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {})
            resolve(true)
          })
      })
      promiseAnswers.push(p)
    }
  }
  return promiseAnswers
}
