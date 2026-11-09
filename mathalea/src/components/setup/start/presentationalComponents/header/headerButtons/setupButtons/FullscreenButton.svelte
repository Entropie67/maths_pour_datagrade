<script lang="ts">
  import { showDialogForLimitedTime } from '../../../../../../../lib/components/dialogs'
  import TwoStatesIcon from '../../../../../../../components/shared/icons/TwoStatesIcon.svelte'
  import { onMount, onDestroy } from 'svelte'

  export let callback: (isFullScreen: boolean) => void = () => {}

  type FullscreenRequestEnabled = {
    requestFullscreen?(): Promise<void>
    mozRequestFullScreen?(): Promise<void>
    webkitRequestFullscreen?(): Promise<void>
    msRequestFullscreen?(): Promise<void>
  }

  const isFullscreenRequestEnabled = (
    element: HTMLElement,
  ): element is HTMLElement & FullscreenRequestEnabled => {
    return (
      'requestFullscreen' in element ||
      'mozRequestFullScreen' in element ||
      'webkitRequestFullscreen' in element ||
      'msRequestFullscreen' in element
    )
  }

  type FullscreenExitEnabled = {
    exitFullscreen?(): Promise<void>
    mozCancelFullScreen?(): Promise<void>
    webkitExitFullscreen?(): Promise<void>
    msExitFullscreen?(): Promise<void>
  }

  const isFullscreenExitEnabled = (
    doc: Document,
  ): doc is Document & FullscreenExitEnabled => {
    return (
      'exitFullscreen' in doc ||
      'mozCancelFullScreen' in doc ||
      'webkitExitFullscreen' in doc ||
      'msExitFullscreen' in doc
    )
  }

  const appId = 'appComponent'
  let isFullScreen = false

  onMount(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
  })

  onDestroy(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
  })

  const handleFullscreenChange = () => {
    const isInFullScreen = document.fullscreenElement != null
    isFullScreen = isInFullScreen
    callback?.(isFullScreen)
  }

  const switchFullScreen = async () => {
    const element = document.getElementById(appId)
    if (!element) {
      handleFullScreenError(new Error(`#${appId} non trouvé`))
      return
    }

    isFullScreen = !isFullScreen

    const isInFullScreen = document.fullscreenElement != null
    if (isFullScreen && !isInFullScreen) {
      if (isFullscreenRequestEnabled(element)) {
        try {
          await requestFullScreen(element)
        } catch (error) {
          console.error('Erreur lors de la requête de plein écran.')
        }
      } else {
        handleFullScreenError(new Error('Plein écran non disponible'))
      }
    }
    if (!isFullScreen && isInFullScreen) {
      if (isFullscreenExitEnabled(document)) {
        try {
          await exitFullScreen()
        } catch (error) {
          console.error('Erreur lors de la sortie du plein écran.')
        }
      } else {
        handleFullScreenError(new Error('Sortie du plein écran non disponible'))
      }
    }
    callback?.(isFullScreen)
  }

  const requestFullScreen = async (
    element: HTMLElement & FullscreenRequestEnabled,
  ) => {
    if (
      !(element instanceof HTMLElement) ||
      !isFullscreenRequestEnabled(element)
    ) {
      handleFullScreenError(new Error("Le plein écran n'est plus disponible"))
      return
    }
    const method =
      element.requestFullscreen ||
      element.mozRequestFullScreen ||
      element.webkitRequestFullscreen ||
      element.msRequestFullscreen
    if (method) {
      try {
        await method.call(element)
      } catch (error) {
        handleFullScreenError(new Error('Requête de plein écran refusée'))
      }
    } else {
      handleFullScreenError(new Error('Plein écran non disponible'))
    }
  }

  const exitFullScreen = async () => {
    if (!isFullscreenExitEnabled(document)) {
      handleFullScreenError(new Error("Le plein écran n'est plus disponible"))
      return
    }
    const method =
      document.exitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen
    if (method) {
      await method.call(document)
    } else {
      handleFullScreenError(new Error('Sortie du plein écran non disponible'))
    }
  }

  const handleFullScreenError = (error: Error) => {
    console.error(error)
    showDialogForLimitedTime('notifDialog', 2000, 'Accès au plein écran refusé')
  }
</script>

<button
  type="button"
  class="tooltip tooltip-bottom tooltip-neutral"
  data-tip={isFullScreen ? 'Quitter le plein écran' : 'Plein écran'}
  aria-label={isFullScreen ? 'Quitter le plein écran' : 'Plein écran'}
  on:click={switchFullScreen}
>
  <div class="px-2">
    <TwoStatesIcon isOnStateActive={isFullScreen}>
      <i
        slot="icon_to_switch_on"
        aria-hidden="true"
        class="bx bx-fullscreen text-3xl
          text-coopmaths-action dark:text-coopmathsdark-action
          hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
      ></i>
      <i
        slot="icon_to_switch_off"
        aria-hidden="true"
        class="bx bx-exit-fullscreen text-3xl
        text-coopmaths-action dark:text-coopmathsdark-action
        hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
      ></i>
    </TwoStatesIcon>
  </div>
</button>
