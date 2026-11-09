import Bugsnag, { type NotifiableError } from '@bugsnag/js'

import { get } from 'svelte/store'
import { showDialogForLimitedTime } from './lib/components/dialogs'
import { createURL } from './lib/createURL'
import { isProductionSite } from './lib/isProductionSite'
import { canOptions } from './lib/stores/canStore'
import {
  capytaleMode,
  capytaleStudentAssignment,
  exercicesParams,
} from './lib/stores/generalStore'
import { globalOptions } from './lib/stores/globalOptions'
import { tropDeChiffres } from './modules/messages'

type Metadatas = Record<string, unknown>

function handleBugsnag() {
  // const fileName = '../_private/bugsnagApiKey'
  // PROVISOIRE : MGU
  const getBugsnagApiKey = '6f45f454e2366599256bddc91cd7000b' // await import(/* @vite-ignore */fileName)
  const key = getBugsnagApiKey // .default() || ''
  Bugsnag.start({
    apiKey: key,
    onError: function (event) {
      event.addMetadata('Parametres Exos', get(exercicesParams))
      event.addMetadata('Parametres: ', {
        globalOptions: get(globalOptions),
        canOptions: get(canOptions),
        exercicesParams: get(exercicesParams),
        capytaleMode: get(capytaleMode),
        studentAssignment: get(capytaleStudentAssignment),
      })
      event.addMetadata('Url Exos', {
        url: createURL(get(exercicesParams)).toString(),
      })
    },
  })
}

if (isProductionSite()) {
  handleBugsnag()
}

function isDevMode() {
  return window.location.href.startsWith('http://localhost')
}

export function notifyLocal(error: string | Error, metadatas: Metadatas) {
  if (!isDevMode()) return
  if (typeof error === 'string') {
    // @ts-expect-error
    if (error.includes(tropDeChiffres) && !window.Bugsnag) {
      console.error(
        error +
          "\nIl y a un risque d'erreur d'approximation (la limite est de 15 chiffres significatifs)\nnb : " +
          metadatas.nb +
          '\nprecision (= nombre de décimales demandé) : ' +
          metadatas.precision,
      )
    }
    error = Error(error).message
  }
  const message =
    'Ce message ne sera pas envoyé à Bugsnag dans la version en ligne, mais il faut traiter le problème !'
  showDialogForLimitedTime(
    'notifDialog',
    5000,
    message + ' : <br>' + error.toString() + JSON.stringify(metadatas),
  )
  console.error(message, error)
  if (metadatas) console.info('avec les metadatas', metadatas)
  if (metadatas) console.info(JSON.stringify(metadatas))
  console.info('Paramètres des exercices', get(exercicesParams))
  console.trace()
}
/**
 * Une fonction à importer dans les fichiers typescript si on veut faire du window.notify() on utilise notify().
 * @param error
 * @param metadatas
 */
export function notify(error: string | NotifiableError, metadatas: Metadatas) {
  if (typeof error === 'string') {
    // @ts-expect-error
    if (error.includes(tropDeChiffres) && !window.Bugsnag) {
      console.error(
        error +
          "\nIl y a un risque d'erreur d'approximation (la limite est de 15 chiffres significatifs)\nnb : " +
          metadatas.nb +
          '\nprecision (= nombre de décimales demandé) : ' +
          metadatas.precision,
      )
    }
    error = Error(error).message
  }
  // console.error(error)
  // if (metadatas) console.info('Avec les metadatas:', metadatas)
  // console.info('Paramètres des exercices:', get(exercicesParams))
  // return

  if (Bugsnag && !isDevMode()) {
    if (metadatas) Bugsnag.addMetadata('ajouts', metadatas)
    Bugsnag.addMetadata('Paramètres des exercices', get(exercicesParams))
    Bugsnag.notify(error)
    console.error(error)
  } else {
    const message =
      "message qui aurait été envoyé à bugsnag s'il avait été configuré"
    showDialogForLimitedTime(
      'notifDialog',
      5000,
      message + ' : <br>' + error.toString(),
    )
    console.error(message, error)
    if (metadatas) console.info('avec les metadatas', metadatas)
    if (metadatas) console.info(JSON.stringify(metadatas))
    console.info('Paramètres des exercices', get(exercicesParams))
    if (metadatas) console.info(JSON.stringify(get(exercicesParams)))
    console.info('URL:' + createURL(get(exercicesParams)).toString())
  }
}

// @ts-expect-error
window.notify = notify

// @ts-expect-error
window.notifyLocal = notifyLocal
