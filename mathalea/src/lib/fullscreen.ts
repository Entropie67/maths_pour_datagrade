import { writable } from 'svelte/store'

/*
  Passage en plein écran des vues intégrées dans un LMS.

  Dans Moodle, MathALÉA est chargé dans une iframe dont la hauteur suit celle de
  l'exercice : l'énoncé est à l'étroit, en particulier sur mobile. Deux
  mécanismes se complètent pour lui rendre toute la place disponible.

  1. L'API Fullscreen native, utilisable quand toutes les iframes parentes
     autorisent le plein écran. C'est le cas du Gift : `moodle.js` pose
     `allow="fullscreen"` sur l'iframe qu'il crée.
  2. À défaut (Scorm : l'iframe du SCO est posée par Moodle sans cette
     autorisation, ce qui coupe la délégation à l'iframe MathALÉA), un message
     `mathalea:fullscreen` demande à la page hôte d'agrandir elle-même l'iframe
     (voir `public/assets/externalJs/moodle.js` et `moodle.scorm.js`).
*/

export const isFullscreen = writable(false)

// Vrai lorsque le plein écran est assuré par la page hôte et non par le navigateur.
let isHostFullscreen = false

function askHost(value: boolean) {
  const iframe = new URL(window.location.href).searchParams.get('iframe')
  window.parent.postMessage(
    { action: 'mathalea:fullscreen', value, iframe },
    '*',
  )
}

async function enterFullscreen() {
  if (document.fullscreenEnabled) {
    try {
      await document.documentElement.requestFullscreen()
      return
    } catch (error) {
      console.info('Plein écran natif refusé, repli sur la page hôte', error)
    }
  }
  isHostFullscreen = true
  isFullscreen.set(true)
  askHost(true)
}

async function exitFullscreen() {
  if (document.fullscreenElement !== null) {
    await document.exitFullscreen()
    return
  }
  if (isHostFullscreen) {
    isHostFullscreen = false
    isFullscreen.set(false)
    askHost(false)
  }
}

export async function toggleFullscreen(isActive: boolean) {
  if (isActive) {
    await exitFullscreen()
  } else {
    await enterFullscreen()
  }
}

/**
 * Synchronise le store avec le plein écran natif, que l'utilisateur peut aussi
 * quitter sans passer par le bouton (touche Échap, geste du navigateur).
 * @returns fonction de nettoyage à appeler au démontage du composant
 */
export function listenToFullscreenChange(): () => void {
  const onChange = () => {
    if (!isHostFullscreen) isFullscreen.set(document.fullscreenElement !== null)
  }
  document.addEventListener('fullscreenchange', onChange)
  return () => document.removeEventListener('fullscreenchange', onChange)
}

/**
 * Sortie du plein écran délégué à la page hôte avec la touche Échap : le
 * navigateur ne s'en charge que pour le plein écran natif.
 */
export function handleFullscreenEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && isHostFullscreen) {
    exitFullscreen()
  }
}
